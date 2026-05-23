import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'wiktrack.db';

let dbPromise;

export function getDatabase() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return dbPromise;
}

export async function initLocalDatabase() {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS local_transactions (
      local_id INTEGER PRIMARY KEY AUTOINCREMENT,
      id TEXT,
      business_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      sender_name TEXT,
      sender_phone TEXT,
      account_ref TEXT,
      mpesa_code TEXT,
      sms_hash TEXT NOT NULL UNIQUE,
      timestamp TEXT NOT NULL,
      source TEXT DEFAULT 'sms',
      shortcode TEXT,
      balance REAL,
      note TEXT,
      created_at TEXT NOT NULL,
      synced_at TEXT,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      sync_error TEXT,
      last_sync_attempt_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_local_transactions_business_timestamp
      ON local_transactions (business_id, timestamp DESC);

    CREATE INDEX IF NOT EXISTS idx_local_transactions_sync
      ON local_transactions (business_id, sync_status);

    CREATE TABLE IF NOT EXISTS local_failed_parses (
      local_id INTEGER PRIMARY KEY AUTOINCREMENT,
      id TEXT,
      business_id TEXT,
      sender TEXT,
      raw_sms TEXT NOT NULL,
      sms_hash TEXT NOT NULL UNIQUE,
      received_at TEXT,
      parser_version TEXT NOT NULL,
      error TEXT,
      created_at TEXT NOT NULL,
      synced_at TEXT,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      sync_error TEXT,
      last_sync_attempt_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_local_failed_parses_sync
      ON local_failed_parses (business_id, sync_status);

    CREATE TABLE IF NOT EXISTS local_recipient_mappings (
      local_id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id TEXT NOT NULL,
      recipient TEXT NOT NULL UNIQUE,
      custom_name TEXT,
      category TEXT,
      created_at TEXT NOT NULL,
      synced_at TEXT,
      sync_status TEXT NOT NULL DEFAULT 'pending'
    );

    CREATE INDEX IF NOT EXISTS idx_local_recipient_mappings_sync
      ON local_recipient_mappings (business_id, sync_status);
  `);

  // Run SQLite migrations to add columns if they do not exist
  try {
    await db.execAsync("ALTER TABLE local_transactions ADD COLUMN flow TEXT NOT NULL DEFAULT 'in';");
  } catch (e) {
    // Column already exists
  }
  try {
    await db.execAsync("ALTER TABLE local_transactions ADD COLUMN network TEXT NOT NULL DEFAULT 'mpesa';");
  } catch (e) {
    // Column already exists
  }
  try {
    await db.execAsync("ALTER TABLE local_transactions ADD COLUMN fuliza_amount REAL;");
  } catch (e) {
    // Column already exists
  }
  try {
    await db.execAsync("ALTER TABLE local_transactions ADD COLUMN outstanding_fuliza REAL;");
  } catch (e) {
    // Column already exists
  }
}

export async function upsertLocalTransactions(transactions, syncStatus = 'pending') {
  if (!transactions.length) return;

  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const transaction of transactions) {
      await tx.runAsync(
        `
          INSERT INTO local_transactions (
            id, business_id, type, amount, sender_name, sender_phone, account_ref,
            mpesa_code, sms_hash, timestamp, source, shortcode, balance, note,
            created_at, synced_at, sync_status, sync_error, last_sync_attempt_at,
            flow, network, fuliza_amount, outstanding_fuliza
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(sms_hash) DO UPDATE SET
            id = COALESCE(excluded.id, local_transactions.id),
            business_id = excluded.business_id,
            type = excluded.type,
            amount = excluded.amount,
            sender_name = excluded.sender_name,
            sender_phone = excluded.sender_phone,
            account_ref = excluded.account_ref,
            mpesa_code = excluded.mpesa_code,
            timestamp = excluded.timestamp,
            source = excluded.source,
            shortcode = excluded.shortcode,
            balance = excluded.balance,
            note = excluded.note,
            synced_at = COALESCE(excluded.synced_at, local_transactions.synced_at),
            sync_status = CASE
              WHEN local_transactions.sync_status = 'synced' AND excluded.sync_status = 'pending'
                THEN local_transactions.sync_status
              ELSE excluded.sync_status
            END,
            sync_error = excluded.sync_error,
            last_sync_attempt_at = excluded.last_sync_attempt_at,
            flow = excluded.flow,
            network = excluded.network,
            fuliza_amount = excluded.fuliza_amount,
            outstanding_fuliza = excluded.outstanding_fuliza
        `,
        [
          transaction.id || null,
          transaction.business_id,
          transaction.type,
          transaction.amount,
          transaction.sender_name || null,
          transaction.sender_phone || null,
          transaction.account_ref || null,
          transaction.mpesa_code || null,
          transaction.sms_hash,
          transaction.timestamp,
          transaction.source || 'sms',
          transaction.shortcode || null,
          transaction.balance ?? null,
          transaction.note || null,
          transaction.created_at || now,
          transaction.synced_at || (syncStatus === 'synced' ? now : null),
          transaction.sync_status || syncStatus,
          transaction.sync_error || null,
          transaction.last_sync_attempt_at || null,
          transaction.flow || 'in',
          transaction.network || 'mpesa',
          transaction.fuliza_amount ?? null,
          transaction.outstanding_fuliza ?? null,
        ]
      );
    }
  });
}

export async function upsertLocalFailedParses(failedParses, syncStatus = 'pending') {
  if (!failedParses.length) return;

  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const failedParse of failedParses) {
      await tx.runAsync(
        `
          INSERT INTO local_failed_parses (
            id, business_id, sender, raw_sms, sms_hash, received_at, parser_version,
            error, created_at, synced_at, sync_status, sync_error, last_sync_attempt_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(sms_hash) DO UPDATE SET
            id = COALESCE(excluded.id, local_failed_parses.id),
            business_id = COALESCE(excluded.business_id, local_failed_parses.business_id),
            sender = excluded.sender,
            raw_sms = excluded.raw_sms,
            received_at = excluded.received_at,
            parser_version = excluded.parser_version,
            error = excluded.error,
            synced_at = COALESCE(excluded.synced_at, local_failed_parses.synced_at),
            sync_status = CASE
              WHEN local_failed_parses.sync_status = 'synced' AND excluded.sync_status = 'pending'
                THEN local_failed_parses.sync_status
              ELSE excluded.sync_status
            END,
            sync_error = excluded.sync_error,
            last_sync_attempt_at = excluded.last_sync_attempt_at
        `,
        [
          failedParse.id || null,
          failedParse.business_id || null,
          failedParse.sender || null,
          failedParse.raw_sms,
          failedParse.sms_hash,
          failedParse.received_at || null,
          failedParse.parser_version,
          failedParse.error || null,
          failedParse.created_at || now,
          failedParse.synced_at || (syncStatus === 'synced' ? now : null),
          failedParse.sync_status || syncStatus,
          failedParse.sync_error || null,
          failedParse.last_sync_attempt_at || null,
        ]
      );
    }
  });
}

export async function listPendingTransactions(businessId) {
  const db = await getDatabase();
  return db.getAllAsync(
    `
      SELECT * FROM local_transactions
      WHERE business_id = ? AND sync_status != 'synced'
      ORDER BY timestamp ASC
      LIMIT 100
    `,
    [businessId]
  );
}

export async function listPendingFailedParses(businessId) {
  const db = await getDatabase();
  return db.getAllAsync(
    `
      SELECT * FROM local_failed_parses
      WHERE business_id = ? AND sync_status != 'synced'
      ORDER BY created_at ASC
      LIMIT 100
    `,
    [businessId]
  );
}

export async function markTransactionsSynced(rows) {
  if (!rows.length) return;

  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const row of rows) {
      await tx.runAsync(
        `
          UPDATE local_transactions
          SET id = COALESCE(?, id),
              sync_status = 'synced',
              synced_at = ?,
              sync_error = NULL,
              last_sync_attempt_at = ?
          WHERE sms_hash = ?
        `,
        [row.id || null, now, now, row.sms_hash]
      );
    }
  });
}

export async function markFailedParsesSynced(rows) {
  if (!rows.length) return;

  const db = await getDatabase();
  const now = new Date().toISOString();

  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const row of rows) {
      await tx.runAsync(
        `
          UPDATE local_failed_parses
          SET id = COALESCE(?, id),
              sync_status = 'synced',
              synced_at = ?,
              sync_error = NULL,
              last_sync_attempt_at = ?
          WHERE sms_hash = ?
        `,
        [row.id || null, now, now, row.sms_hash]
      );
    }
  });
}

export async function markTransactionsSyncError(rows, errorMessage) {
  if (!rows.length) return;

  const db = await getDatabase();
  const now = new Date().toISOString();
  const hashes = rows.map((row) => row.sms_hash);
  const placeholders = hashes.map(() => '?').join(',');

  await db.runAsync(
    `
      UPDATE local_transactions
      SET sync_status = 'error',
          sync_error = ?,
          last_sync_attempt_at = ?
      WHERE sms_hash IN (${placeholders})
    `,
    [errorMessage, now, ...hashes]
  );
}

export async function markFailedParsesSyncError(rows, errorMessage) {
  if (!rows.length) return;

  const db = await getDatabase();
  const now = new Date().toISOString();
  const hashes = rows.map((row) => row.sms_hash);
  const placeholders = hashes.map(() => '?').join(',');

  await db.runAsync(
    `
      UPDATE local_failed_parses
      SET sync_status = 'error',
          sync_error = ?,
          last_sync_attempt_at = ?
      WHERE sms_hash IN (${placeholders})
    `,
    [errorMessage, now, ...hashes]
  );
}

export async function queryLocalTransactions({
  businessId,
  filter = 'all',
  flow = 'all',
  searchQuery = '',
  dateRange = null,
  limit = null,
}) {
  const db = await getDatabase();
  const where = ['lt.business_id = ?'];
  const params = [businessId];

  if (filter !== 'all') {
    where.push('lt.type = ?');
    params.push(filter);
  }

  if (flow !== 'all') {
    where.push('lt.flow = ?');
    params.push(flow);
  }

  if (dateRange?.start) {
    where.push('lt.timestamp >= ?');
    params.push(dateRange.start);
  }

  if (dateRange?.end) {
    where.push('lt.timestamp <= ?');
    params.push(dateRange.end);
  }

  if (searchQuery.trim()) {
    const term = `%${searchQuery.trim()}%`;
    where.push(
      '(lt.sender_name LIKE ? OR lt.sender_phone LIKE ? OR lt.account_ref LIKE ? OR lt.mpesa_code LIKE ? OR m.custom_name LIKE ?)'
    );
    params.push(term, term, term, term, term);
  }

  const limitClause = limit ? ` LIMIT ${Number(limit)}` : '';

  return db.getAllAsync(
    `
      SELECT
        COALESCE(lt.id, lt.sms_hash) AS id,
        lt.business_id,
        lt.type,
        lt.amount,
        COALESCE(m.custom_name, lt.sender_name) AS sender_name,
        lt.sender_phone,
        lt.account_ref,
        lt.mpesa_code,
        lt.sms_hash,
        lt.timestamp,
        lt.source,
        lt.shortcode,
        lt.balance,
        lt.note,
        lt.created_at,
        lt.sync_status,
        lt.flow,
        lt.network,
        lt.fuliza_amount,
        lt.outstanding_fuliza,
        m.custom_name AS custom_recipient_name,
        m.category AS custom_category
      FROM local_transactions lt
      LEFT JOIN local_recipient_mappings m 
        ON (
          (lt.sender_phone IS NOT NULL AND lt.sender_phone = m.recipient) OR
          (lt.account_ref IS NOT NULL AND lt.account_ref = m.recipient) OR
          (lt.sender_name IS NOT NULL AND lt.sender_name = m.recipient)
        )
      WHERE ${where.join(' AND ')}
      ORDER BY lt.timestamp DESC
      ${limitClause}
    `,
    params
  );
}

export async function getLocalDashboardData(businessId) {
  const db = await getDatabase();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - mondayOffset);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartISO = weekStart.toISOString();

  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekStartISO = lastWeekStart.toISOString();

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  const [
    todayIncome, todayExpense,
    weekIncome, weekExpense,
    lastWeekIncome, lastWeekExpense,
    monthIncome, monthExpense,
    lastMonthIncome, lastMonthExpense,
    recent,
    chartRows
  ] = await Promise.all([
    sumAndCountFlow(db, businessId, 'in', 'timestamp >= ?', [todayStart]),
    sumAndCountFlow(db, businessId, 'out', 'timestamp >= ?', [todayStart]),
    sumAndCountFlow(db, businessId, 'in', 'timestamp >= ?', [weekStartISO]),
    sumAndCountFlow(db, businessId, 'out', 'timestamp >= ?', [weekStartISO]),
    sumAndCountFlow(db, businessId, 'in', 'timestamp >= ? AND timestamp < ?', [
      lastWeekStartISO,
      weekStartISO,
    ]),
    sumAndCountFlow(db, businessId, 'out', 'timestamp >= ? AND timestamp < ?', [
      lastWeekStartISO,
      weekStartISO,
    ]),
    sumAndCountFlow(db, businessId, 'in', 'timestamp >= ?', [monthStart]),
    sumAndCountFlow(db, businessId, 'out', 'timestamp >= ?', [monthStart]),
    sumAndCountFlow(db, businessId, 'in', 'timestamp >= ? AND timestamp <= ?', [
      lastMonthStart,
      lastMonthEnd,
    ]),
    sumAndCountFlow(db, businessId, 'out', 'timestamp >= ? AND timestamp <= ?', [
      lastMonthStart,
      lastMonthEnd,
    ]),
    queryLocalTransactions({ businessId, limit: 5 }),
    db.getAllAsync(
      `
        SELECT amount, timestamp, flow FROM local_transactions
        WHERE business_id = ? AND timestamp >= ?
        ORDER BY timestamp ASC
      `,
      [businessId, sevenDaysAgoISO]
    ),
  ]);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyIncomeTotals = new Array(7).fill(0);
  const dailyExpenseTotals = new Array(7).fill(0);

  for (let i = 0; i < 7; i += 1) {
    const dayDate = new Date(sevenDaysAgo);
    dayDate.setDate(sevenDaysAgo.getDate() + i);
    const dayStr = dayDate.toISOString().slice(0, 10);

    chartRows.forEach((tx) => {
      if (tx.timestamp.slice(0, 10) === dayStr) {
        if (tx.flow === 'out') {
          dailyExpenseTotals[i] += Number(tx.amount);
        } else {
          dailyIncomeTotals[i] += Number(tx.amount);
        }
      }
    });
  }

  return {
    todayIncome: Number(todayIncome.total || 0),
    todayIncomeCount: Number(todayIncome.count || 0),
    todayExpense: Number(todayExpense.total || 0),
    todayExpenseCount: Number(todayExpense.count || 0),

    weekIncome: Number(weekIncome.total || 0),
    weekExpense: Number(weekExpense.total || 0),

    lastWeekIncome: Number(lastWeekIncome.total || 0),
    lastWeekExpense: Number(lastWeekExpense.total || 0),

    monthIncome: Number(monthIncome.total || 0),
    monthExpense: Number(monthExpense.total || 0),

    lastMonthIncome: Number(lastMonthIncome.total || 0),
    lastMonthExpense: Number(lastMonthExpense.total || 0),

    recentTransactions: recent,
    weeklyIncomeData: dailyIncomeTotals.map((total, i) => ({
      label: dayLabels[(sevenDaysAgo.getDay() + i - 1 + 7) % 7] || dayLabels[i],
      value: total,
    })),
    weeklyExpenseData: dailyExpenseTotals.map((total, i) => ({
      label: dayLabels[(sevenDaysAgo.getDay() + i - 1 + 7) % 7] || dayLabels[i],
      value: total,
    })),
  };
}

async function sumAndCountFlow(db, businessId, flow, condition, values) {
  return db.getFirstAsync(
    `
      SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
      FROM local_transactions
      WHERE business_id = ? AND flow = ? AND ${condition}
    `,
    [businessId, flow, ...values]
  );
}

// Recipient Mappings Database CRUD Helpers
export async function saveLocalRecipientMapping({ businessId, recipient, customName, category }, syncStatus = 'pending') {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `
      INSERT INTO local_recipient_mappings (
        business_id, recipient, custom_name, category, created_at, sync_status
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(recipient) DO UPDATE SET
        custom_name = excluded.custom_name,
        category = excluded.category,
        sync_status = CASE
          WHEN local_recipient_mappings.sync_status = 'synced' AND excluded.sync_status = 'pending'
            THEN 'pending'
          ELSE excluded.sync_status
        END
    `,
    [businessId, recipient, customName || null, category || null, now, syncStatus]
  );
}

export async function getLocalRecipientMappings(businessId) {
  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT * FROM local_recipient_mappings WHERE business_id = ?`,
    [businessId]
  );
}

export async function listPendingRecipientMappings(businessId) {
  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT * FROM local_recipient_mappings WHERE business_id = ? AND sync_status != 'synced'`,
    [businessId]
  );
}

export async function markRecipientMappingsSynced(rows) {
  if (!rows.length) return;
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const row of rows) {
      await tx.runAsync(
        `UPDATE local_recipient_mappings SET sync_status = 'synced', synced_at = ? WHERE recipient = ?`,
        [now, row.recipient]
      );
    }
  });
}
