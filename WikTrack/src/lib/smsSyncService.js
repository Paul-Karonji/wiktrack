import { parseSMS } from './smsParser';
import { readSmsMessages } from './smsReader';
import { supabase } from './supabase';
import { useBusinessStore } from '../store';
import { sha256String } from './hash';
import {
  getLocalDashboardData,
  initLocalDatabase,
  listPendingFailedParses,
  listPendingTransactions,
  markFailedParsesSynced,
  markFailedParsesSyncError,
  markTransactionsSynced,
  markTransactionsSyncError,
  queryLocalTransactions,
  upsertLocalFailedParses,
  upsertLocalTransactions,
  saveLocalRecipientMapping,
  listPendingRecipientMappings,
  markRecipientMappingsSynced,
} from './localDatabase';

export const PARSER_VERSION = 'wiktrack-sync-v2';

export async function getBusinessSyncContext() {
  if (useBusinessStore.persist?.rehydrate) {
    await useBusinessStore.persist.rehydrate();
  }

  const state = useBusinessStore.getState();

  return {
    businessId: state.businessId,
    enabledTypes: state.enabledTypes || ['pochi', 'p2p', 'till', 'paybill', 'withdrawal', 'fuliza', 'repayment'],
  };
}

export async function syncSmsInbox({
  businessId,
  enabledTypes,
  fullHistory = false,
  minDate = 0,
  onProgress,
}) {
  await initLocalDatabase();

  // 1. Fetch M-Pesa messages
  const messages = await readSmsMessages({
    box: 'inbox',
    address: 'MPESA',
    minDate,
  });

  // Sort in descending order of time
  messages.sort((a, b) => b.date - a.date);

  const processed = await processSmsMessages(messages, {
    businessId,
    enabledTypes,
    onProgress,
  });

  const upload = await flushPendingSync(businessId);

  return {
    success: true,
    messagesRead: messages.length,
    parsedCount: processed.parsedCount,
    failedParseCount: processed.failedParseCount,
    insertedCount: processed.parsedCount,
    syncedCount: upload.syncedTransactions,
    syncedFailedParseCount: upload.syncedFailedParses,
    syncedMappingsCount: upload.syncedMappings,
    fullHistory,
    stage: 'complete',
  };
}

export async function syncIncomingSms(sms) {
  await initLocalDatabase();

  const { businessId, enabledTypes } = await getBusinessSyncContext();
  if (!businessId) {
    return {
      success: false,
      stage: 'business',
      errorMessage: 'Business profile is missing.',
    };
  }

  const processed = await processSmsMessages([sms], { businessId, enabledTypes });
  const upload = await flushPendingSync(businessId);

  return {
    success: true,
    messagesRead: 1,
    parsedCount: processed.parsedCount,
    failedParseCount: processed.failedParseCount,
    syncedCount: upload.syncedTransactions,
    syncedFailedParseCount: upload.syncedFailedParses,
    syncedMappingsCount: upload.syncedMappings,
    stage: 'complete',
  };
}

export async function processSmsMessages(messages, { businessId, enabledTypes, onProgress }) {
  const transactions = [];
  const failedParses = [];

  for (const sms of messages) {
    const rawSms = sms.body || sms.rawSms || '';
    if (!rawSms.trim()) continue;

    const senderAddr = sms.address || sms.sender || 'MPESA';
    const parsed = parseSMS(rawSms, senderAddr, enabledTypes);
    const smsHash = await hashSms(rawSms);

    if (parsed) {
      transactions.push(toLocalTransaction(parsed, businessId, smsHash));
      if (onProgress) {
        onProgress({
          parsedCount: transactions.length,
          failedParseCount: failedParses.length,
          messagesRead: messages.length,
        });
      }
      continue;
    }

    const disabledKnownType = parseSMS(rawSms, senderAddr);
    if (!disabledKnownType && isMonitoredSender(senderAddr)) {
      failedParses.push(toLocalFailedParse(sms, businessId, smsHash));
    }
  }

  await upsertLocalTransactions(transactions, 'pending');
  await upsertLocalFailedParses(failedParses, 'pending');

  return {
    parsedCount: transactions.length,
    failedParseCount: failedParses.length,
  };
}

export async function flushPendingSync(businessId) {
  await initLocalDatabase();

  const syncedTransactions = await flushPendingTransactions(businessId);
  const syncedFailedParses = await flushPendingFailedParses(businessId);
  const syncedMappings = await flushPendingRecipientMappings(businessId);

  return { syncedTransactions, syncedFailedParses, syncedMappings };
}

export async function pullRemoteTransactionsToLocal(businessId) {
  await initLocalDatabase();

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('business_id', businessId)
    .order('timestamp', { ascending: false });

  if (error) throw error;

  const rows = (data || [])
    .filter((row) => row.sms_hash || row.id)
    .map((row) => ({
      id: row.id,
      business_id: row.business_id,
      type: row.type,
      amount: Number(row.amount),
      sender_name: row.sender_name,
      sender_phone: row.sender_phone,
      account_ref: row.account_ref,
      mpesa_code: row.mpesa_code,
      sms_hash: row.sms_hash || row.id,
      timestamp: row.timestamp,
      source: row.source || 'sms',
      shortcode: row.shortcode,
      balance: row.balance == null ? null : Number(row.balance),
      note: row.note,
      created_at: row.created_at || new Date().toISOString(),
      synced_at: new Date().toISOString(),
      sync_status: 'synced',
      flow: row.flow || 'in',
      network: row.network || 'mpesa',
      fuliza_amount: row.fuliza_amount == null ? null : Number(row.fuliza_amount),
      outstanding_fuliza: row.outstanding_fuliza == null ? null : Number(row.outstanding_fuliza),
    }));

  await upsertLocalTransactions(rows, 'synced');
  return rows.length;
}

export async function pullRemoteMappingsToLocal(businessId) {
  await initLocalDatabase();

  const { data, error } = await supabase
    .from('recipient_mappings')
    .select('*')
    .eq('business_id', businessId);

  if (error) throw error;

  for (const row of (data || [])) {
    await saveLocalRecipientMapping({
      businessId: row.business_id,
      recipient: row.recipient,
      customName: row.custom_name,
      category: row.category,
    }, 'synced');
  }
  return (data || []).length;
}

export { getLocalDashboardData, queryLocalTransactions };

async function flushPendingTransactions(businessId) {
  const pending = await listPendingTransactions(businessId);
  if (!pending.length) return 0;

  const remoteRows = pending.map(toRemoteTransaction);

  const { data, error } = await supabase
    .from('transactions')
    .upsert(remoteRows, { onConflict: 'sms_hash' })
    .select('id, sms_hash');

  if (error) {
    await markTransactionsSyncError(pending, error.message || JSON.stringify(error));
    return 0;
  }

  await markTransactionsSynced(data || pending);
  return pending.length;
}

async function flushPendingFailedParses(businessId) {
  const pending = await listPendingFailedParses(businessId);
  if (!pending.length) return 0;

  const remoteRows = pending.map(toRemoteFailedParse);

  const { data, error } = await supabase
    .from('failed_parses')
    .upsert(remoteRows, { onConflict: 'sms_hash' })
    .select('id, sms_hash');

  if (error) {
    await markFailedParsesSyncError(pending, error.message || JSON.stringify(error));
    return 0;
  }

  await markFailedParsesSynced(data || pending);
  return pending.length;
}

async function flushPendingRecipientMappings(businessId) {
  const pending = await listPendingRecipientMappings(businessId);
  if (!pending.length) return 0;

  const remoteRows = pending.map(row => ({
    business_id: row.business_id,
    recipient: row.recipient,
    custom_name: row.custom_name,
    category: row.category,
  }));

  const { data, error } = await supabase
    .from('recipient_mappings')
    .upsert(remoteRows, { onConflict: 'business_id,recipient' })
    .select('recipient');

  if (error) {
    return 0;
  }

  await markRecipientMappingsSynced(data || pending);
  return pending.length;
}

function toLocalTransaction(tx, businessId, smsHash) {
  const now = new Date().toISOString();

  return {
    business_id: businessId,
    type: tx.type,
    amount: tx.amount,
    sender_name: tx.senderName,
    sender_phone: tx.senderPhone,
    account_ref: tx.accountRef,
    mpesa_code: tx.mpesaCode,
    timestamp: tx.timestamp.toISOString(),
    balance: tx.balance,
    source: 'sms',
    sms_hash: smsHash,
    created_at: now,
    flow: tx.flow || 'in',
    network: tx.network || 'mpesa',
    fuliza_amount: tx.fuliza_amount ?? null,
    outstanding_fuliza: tx.outstanding_fuliza ?? null,
  };
}

function toLocalFailedParse(sms, businessId, smsHash) {
  const now = new Date().toISOString();
  const receivedAt = sms.date ? new Date(Number(sms.date)).toISOString() : now;

  return {
    business_id: businessId,
    sender: sms.address || sms.sender || null,
    raw_sms: sms.body || sms.rawSms || '',
    sms_hash: smsHash,
    received_at: receivedAt,
    parser_version: PARSER_VERSION,
    error: 'No enabled parser matched an SMS from monitored senders.',
    created_at: now,
  };
}

function toRemoteTransaction(row) {
  return {
    business_id: row.business_id,
    type: row.type,
    amount: row.amount,
    sender_name: row.sender_name,
    sender_phone: row.sender_phone,
    account_ref: row.account_ref,
    mpesa_code: row.mpesa_code,
    timestamp: row.timestamp,
    balance: row.balance,
    source: 'sms',
    shortcode: row.shortcode,
    note: row.note,
    sms_hash: row.sms_hash,
    flow: row.flow || 'in',
    network: row.network || 'mpesa',
    fuliza_amount: row.fuliza_amount ?? null,
    outstanding_fuliza: row.outstanding_fuliza ?? null,
  };
}

function toRemoteFailedParse(row) {
  return {
    business_id: row.business_id,
    sender: row.sender,
    raw_sms: row.raw_sms,
    sms_hash: row.sms_hash,
    received_at: row.received_at,
    parser_version: row.parser_version,
    error: row.error,
  };
}

function isMonitoredSender(sender = '') {
  const norm = String(sender).trim().toUpperCase();
  return norm.includes('MPESA') || norm.includes('M-PESA');
}

async function hashSms(rawSms) {
  return sha256String(rawSms);
}
