// smsParser.js — Parses all M-Pesa and Airtel Money SMS formats into structured JSON

export const SMS_TYPES = {
  TILL: 'till',
  PAYBILL: 'paybill',
  POCHI: 'pochi',
  P2P: 'p2p',
  WITHDRAWAL: 'withdrawal',
  FULIZA: 'fuliza',
  REPAYMENT: 'repayment',
};

// Shared helpers
const parseAmount = (str) => {
  if (!str) return 0;
  return parseFloat(str.replace(/,/g, ''));
};

const parseCode = (smsBody) => {
  // Matches typical 10-char M-Pesa transaction codes (e.g., UELCT57MG7)
  const codeMatch = smsBody.match(/^([A-Z0-9]{8,12})\s+Confirmed/i) || 
                    smsBody.match(/Transaction\s+ID:\s*([A-Z0-9]{8,15})/i) ||
                    smsBody.match(/^([A-Z0-9]{10})\s+withdrawn/i) ||
                    smsBody.match(/^([A-Z0-9]{10})\s+paid/i);
  return codeMatch?.[1] || null;
};

const parseDate = (d, t) => {
  if (!d) return new Date();
  const [day, month, yr] = d.split('/');
  const year = parseInt(yr) + 2000;
  
  if (!t) {
    return new Date(year, parseInt(month) - 1, parseInt(day));
  }

  const timeMatch = t.match(/^(\d{1,2}):(\d{2})\s+([AP]M)$/i);
  if (!timeMatch) {
    return new Date(year, parseInt(month) - 1, parseInt(day));
  }

  let hour = parseInt(timeMatch[1], 10);
  const minute = parseInt(timeMatch[2], 10);
  const meridiem = timeMatch[3].toUpperCase();

  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;

  return new Date(year, parseInt(month, 10) - 1, parseInt(day, 10), hour, minute, 0);
};

// ============================================================
// REGEX PATTERNS - INCOME (flow: 'in')
// ============================================================
const TILL_INCOME_REGEX = /Confirmed\.\s+Ksh([\d,]+(?:\.\d+)?)\s+received from\s+(.+?)\s+(\d{10})\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.\s+New Till balance is Ksh([\d,]+(?:\.\d+)?)/i;

const PAYBILL_INCOME_REGEX = /Confirmed\.\s+Ksh([\d,]+(?:\.\d+)?)\s+received from\s+(.+?)\s+(\d{10})\s+for account\s+(\S+)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.\s+New Paybill balance is Ksh([\d,]+(?:\.\d+)?)/i;

const POCHI_INCOME_REGEX = /Confirmed\.\s+Ksh([\d,]+(?:\.\d+)?)\s+received from\s+(.+?)\s+(\d{10})\s+via Pochi la Biashara\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.\s+New Pochi balance is Ksh([\d,]+(?:\.\d+)?)/i;

const P2P_INCOME_REGEX = /Confirmed\.\s+Ksh([\d,]+(?:\.\d+)?)\s+received from\s+(\d{10})\s+(.+?)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.\s+New M-PESA balance is Ksh([\d,]+(?:\.\d+)?)/i;

const P2P_MASKED_INCOME_REGEX = /Confirmed\.?\s*You have received\s+Ksh([\d,]+(?:\.\d+)?)\s+from\s+(.+?)\s+([\d*]{10})\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\s+New M-PESA balance is Ksh([\d,]+(?:\.\d+)?)/i;

// Captures generic deposits like Airtel-to-Mpesa, Bank transfers, Saccos (matches solution sacco with missing space: "Confirmed.You have received")
const B2C_INCOME_REGEX = /Confirmed\.?\s*You have received\s+Ksh\s*([\d,]+(?:\.\d+)?)\s+from\s+(.+?)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\s*New M-PESA balance is Ksh\s*([\d,]+(?:\.\d+)?)/i;

// ============================================================
// REGEX PATTERNS - EXPENSES / OUTGOING (flow: 'out')
// ============================================================
const TILL_EXPENSE_REGEX = /Confirmed\.\s+Ksh\s*([\d,]+(?:\.\d+)?)\s+(?:paid|sent) to\s+(.+?)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.?\s+New M-PESA balance is Ksh\s*([\d,]+(?:\.\d+)?)/i;

const PAYBILL_EXPENSE_REGEX = /Confirmed\.\s+Ksh\s*([\d,]+(?:\.\d+)?)\s+(?:paid|sent) to\s+(.+?)\s+for account\s+(\S+)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.?\s+New M-PESA balance is Ksh\s*([\d,]+(?:\.\d+)?)/i;

const P2P_EXPENSE_REGEX = /Confirmed\.\s+Ksh\s*([\d,]+(?:\.\d+)?)\s+sent to\s+(.+?)(?:\s+(\d{10}))?\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.?\s+New M-PESA balance is Ksh\s*([\d,]+(?:\.\d+)?)/i;

const WITHDRAWAL_EXPENSE_REGEX = /Confirmed\.\s+Ksh\s*([\d,]+(?:\.\d+)?)\s+withdrawn from\s+(.+?)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.?\s+New M-PESA balance is Ksh\s*([\d,]+(?:\.\d+)?)/i;

// ============================================================
// REGEX PATTERNS - FULIZA (flow: 'out')
// ============================================================
const FULIZA_OVERDRAFT_REGEX = /Confirmed\.\s+Fuliza M-PESA amount is Ksh\s*([\d,]+(?:\.\d+)?)\.\s+(?:Access Fee|Interest) charged\s+Ksh\s*([\d,]+(?:\.\d+)?)\.\s+Total Fuliza M-PESA outstanding amount is Ksh\s*([\d,]+(?:\.\d+)?)\s+due on\s+(\d+\/\d+\/\d+)/i;

const FULIZA_REPAYMENT_REGEX = /Confirmed\.\s+Ksh\s*([\d,]+(?:\.\d+)?)\s+from your M-PESA has been used to (?:fully|partially) pay your outstanding Fuliza M-PESA\.\s+Available Fuliza M-PESA limit is\s+(?:Ksh\s*)?([\d,]+(?:\.\d+)?)\.\s+(?:Your\s+)?M-PESA balance is\s*(?:Ksh\s*)?([\d,]+(?:\.\d+)?)/i;

// ============================================================
// REGEX PATTERNS - AIRTIME, TRANSFERS, AND M-SHWARI
// ============================================================
const AIRTIME_EXPENSE_REGEX = /Confirmed\.?\s*You bought Ksh\s*([\d,]+(?:\.\d+)?)\s+of airtime on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.?\s*(?:Your\s+)?New M-PESA balance is Ksh\s*([\d,]+(?:\.\d+)?)/i;

const TRANSFER_EXPENSE_REGEX = /Confirmed\.\s+Ksh\s*([\d,]+(?:\.\d+)?)\s+transferr?ed from your M-PESA account to\s+(.+?)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.\s*(?:Your\s+)?(?:New\s+)?M-PESA balance is Ksh\s*([\d,]+(?:\.\d+)?)/i;

const MSHWARI_INCOME_REGEX = /Confirmed\.?\s*Ksh\s*([\d,]+(?:\.\d+)?)\s+transferred from\s+(.+?)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.?\s*.*M-PESA balance is Ksh\s*([\d,]+(?:\.\d+)?)/i;





// Helper to parse M-Pesa SMS
export function parseMpesaSMS(smsBody, enabledTypes = ['till', 'paybill', 'pochi', 'p2p', 'withdrawal', 'fuliza', 'repayment']) {
  let match;

  // 1. FULIZA OVERDRAFT (Access Fee logged as expense, shortfall and debt recorded)
  if (enabledTypes.includes('fuliza') && (match = smsBody.match(FULIZA_OVERDRAFT_REGEX))) {
    return {
      type: SMS_TYPES.FULIZA,
      amount: parseAmount(match[2]), // Log ONLY the access fee as expense to prevent double-counting
      senderName: 'Fuliza Access Fee',
      senderPhone: null,
      accountRef: null,
      mpesaCode: parseCode(smsBody),
      timestamp: parseDate(match[4], null), // Uses date from text, time defaults
      balance: null,
      rawSms: smsBody,
      flow: 'out',
      network: 'mpesa',
      fuliza_amount: parseAmount(match[1]), // Shortfall covered by overdraft
      outstanding_fuliza: parseAmount(match[3]), // Outstanding debt
    };
  }

  // 2. FULIZA REPAYMENT
  if (enabledTypes.includes('repayment') && (match = smsBody.match(FULIZA_REPAYMENT_REGEX))) {
    return {
      type: SMS_TYPES.REPAYMENT,
      amount: parseAmount(match[1]),
      senderName: 'Fuliza Repayment',
      senderPhone: null,
      accountRef: null,
      mpesaCode: parseCode(smsBody),
      timestamp: new Date(), // SMS timestamp fallback
      balance: parseAmount(match[3]),
      rawSms: smsBody,
      flow: 'out',
      network: 'mpesa',
      fuliza_amount: null,
      outstanding_fuliza: 0.00, // Marking outstanding Fuliza as cleared/repaid
    };
  }

  // 3. TILL INCOME
  if (enabledTypes.includes('till') && (match = smsBody.match(TILL_INCOME_REGEX))) {
    return {
      type: SMS_TYPES.TILL,
      amount: parseAmount(match[1]),
      senderName: match[2].trim(),
      senderPhone: match[3],
      accountRef: null,
      mpesaCode: parseCode(smsBody),
      timestamp: parseDate(match[4], match[5]),
      balance: parseAmount(match[6]),
      rawSms: smsBody,
      flow: 'in',
      network: 'mpesa',
    };
  }

  // 4. PAYBILL INCOME
  if (enabledTypes.includes('paybill') && (match = smsBody.match(PAYBILL_INCOME_REGEX))) {
    return {
      type: SMS_TYPES.PAYBILL,
      amount: parseAmount(match[1]),
      senderName: match[2].trim(),
      senderPhone: match[3],
      accountRef: match[4],
      mpesaCode: parseCode(smsBody),
      timestamp: parseDate(match[5], match[6]),
      balance: parseAmount(match[7]),
      rawSms: smsBody,
      flow: 'in',
      network: 'mpesa',
    };
  }

  // 5. POCHI INCOME
  if (enabledTypes.includes('pochi') && (match = smsBody.match(POCHI_INCOME_REGEX))) {
    return {
      type: SMS_TYPES.POCHI,
      amount: parseAmount(match[1]),
      senderName: match[2].trim(),
      senderPhone: match[3],
      accountRef: null,
      mpesaCode: parseCode(smsBody),
      timestamp: parseDate(match[4], match[5]),
      balance: parseAmount(match[6]),
      rawSms: smsBody,
      flow: 'in',
      network: 'mpesa',
    };
  }

  // 6. P2P INCOME
  if (enabledTypes.includes('p2p') && (match = smsBody.match(P2P_INCOME_REGEX))) {
    return {
      type: SMS_TYPES.P2P,
      amount: parseAmount(match[1]),
      senderName: match[3].trim(),
      senderPhone: match[2],
      accountRef: null,
      mpesaCode: parseCode(smsBody),
      timestamp: parseDate(match[4], match[5]),
      balance: parseAmount(match[6]),
      rawSms: smsBody,
      flow: 'in',
      network: 'mpesa',
    };
  }

  // 7. P2P MASKED INCOME
  if (enabledTypes.includes('p2p') && (match = smsBody.match(P2P_MASKED_INCOME_REGEX))) {
    return {
      type: SMS_TYPES.P2P,
      amount: parseAmount(match[1]),
      senderName: match[2].trim(),
      senderPhone: match[3],
      accountRef: null,
      mpesaCode: parseCode(smsBody),
      timestamp: parseDate(match[4], match[5]),
      balance: parseAmount(match[6]),
      rawSms: smsBody,
      flow: 'in',
      network: 'mpesa',
    };
  }

  // 8. B2C TRANSFER INCOME (Airtel-to-Mpesa / Banks / Saccos)
  if (enabledTypes.includes('p2p') && (match = smsBody.match(B2C_INCOME_REGEX))) {
    return {
      type: SMS_TYPES.P2P,
      amount: parseAmount(match[1]),
      senderName: match[2].trim(),
      senderPhone: null,
      accountRef: null,
      mpesaCode: parseCode(smsBody),
      timestamp: parseDate(match[3], match[4]),
      balance: parseAmount(match[5]),
      rawSms: smsBody,
      flow: 'in',
      network: 'mpesa', // Received into M-Pesa account
    };
  }

  // 9. TILL EXPENSE
  if (enabledTypes.includes('till') && (match = smsBody.match(TILL_EXPENSE_REGEX))) {
    return {
      type: SMS_TYPES.TILL,
      amount: parseAmount(match[1]),
      senderName: match[2].trim(),
      senderPhone: null,
      accountRef: null,
      mpesaCode: parseCode(smsBody),
      timestamp: parseDate(match[3], match[4]),
      balance: parseAmount(match[5]),
      rawSms: smsBody,
      flow: 'out',
      network: 'mpesa',
    };
  }

  // 10. PAYBILL EXPENSE
  if (enabledTypes.includes('paybill') && (match = smsBody.match(PAYBILL_EXPENSE_REGEX))) {
    return {
      type: SMS_TYPES.PAYBILL,
      amount: parseAmount(match[1]),
      senderName: match[2].trim(),
      senderPhone: null,
      accountRef: match[3],
      mpesaCode: parseCode(smsBody),
      timestamp: parseDate(match[4], match[5]),
      balance: parseAmount(match[6]),
      rawSms: smsBody,
      flow: 'out',
      network: 'mpesa',
    };
  }

  // 11. P2P EXPENSE
  if (enabledTypes.includes('p2p') && (match = smsBody.match(P2P_EXPENSE_REGEX))) {
    return {
      type: SMS_TYPES.P2P,
      amount: parseAmount(match[1]),
      senderName: match[2].trim(),
      senderPhone: match[3],
      accountRef: null,
      mpesaCode: parseCode(smsBody),
      timestamp: parseDate(match[4], match[5]),
      balance: parseAmount(match[6]),
      rawSms: smsBody,
      flow: 'out',
      network: 'mpesa',
    };
  }

  // 12. WITHDRAWAL EXPENSE
  if (enabledTypes.includes('withdrawal') && (match = smsBody.match(WITHDRAWAL_EXPENSE_REGEX))) {
    return {
      type: SMS_TYPES.WITHDRAWAL,
      amount: parseAmount(match[1]),
      senderName: match[2].trim(),
      senderPhone: null,
      accountRef: null,
      mpesaCode: parseCode(smsBody),
      timestamp: parseDate(match[3], match[4]),
      balance: parseAmount(match[5]),
      rawSms: smsBody,
      flow: 'out',
      network: 'mpesa',
    };
  }

  // 13. AIRTIME EXPENSE (categorized as paybill / Safaricom Airtime)
  if (enabledTypes.includes('paybill') && (match = smsBody.match(AIRTIME_EXPENSE_REGEX))) {
    return {
      type: SMS_TYPES.PAYBILL,
      amount: parseAmount(match[1]),
      senderName: 'Safaricom Airtime',
      senderPhone: null,
      accountRef: 'Airtime Purchase',
      mpesaCode: parseCode(smsBody),
      timestamp: parseDate(match[2], match[3]),
      balance: parseAmount(match[4]),
      rawSms: smsBody,
      flow: 'out',
      network: 'mpesa',
    };
  }

  // 14. TRANSFER EXPENSE (e.g. to KCB M-PESA Fixed Savings / M-Shwari / Bank transfer out)
  if (enabledTypes.includes('withdrawal') && (match = smsBody.match(TRANSFER_EXPENSE_REGEX))) {
    return {
      type: SMS_TYPES.WITHDRAWAL,
      amount: parseAmount(match[1]),
      senderName: match[2].trim(),
      senderPhone: null,
      accountRef: 'Fund Transfer',
      mpesaCode: parseCode(smsBody),
      timestamp: parseDate(match[3], match[4]),
      balance: parseAmount(match[5]),
      rawSms: smsBody,
      flow: 'out',
      network: 'mpesa',
    };
  }

  // 15. M-SHWARI / BANK INCOME (e.g. transfer in from M-Shwari / Bank)
  if (enabledTypes.includes('p2p') && (match = smsBody.match(MSHWARI_INCOME_REGEX))) {
    return {
      type: SMS_TYPES.P2P,
      amount: parseAmount(match[1]),
      senderName: match[2].trim(),
      senderPhone: null,
      accountRef: 'Fund Deposit',
      mpesaCode: parseCode(smsBody),
      timestamp: parseDate(match[3], match[4]),
      balance: parseAmount(match[5]),
      rawSms: smsBody,
      flow: 'in',
      network: 'mpesa',
    };
  }

  return null;
}

// Global Parser Entry Point
export function parseSMS(smsBody, address = 'MPESA', enabledTypes = ['till', 'paybill', 'pochi', 'p2p', 'withdrawal', 'fuliza', 'repayment']) {
  return parseMpesaSMS(smsBody, enabledTypes);
}
