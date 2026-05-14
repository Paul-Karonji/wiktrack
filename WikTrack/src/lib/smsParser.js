// smsParser.js — Parses all 4 M-Pesa SMS formats into structured JSON

export const SMS_TYPES = {
  TILL: 'till',
  PAYBILL: 'paybill',
  POCHI: 'pochi',
  P2P: 'p2p',
};

// Shared helpers
const parseAmount = (str) => parseFloat(str.replace(/,/g, ''));
const parseCode = (smsBody) => smsBody.match(/^([A-Z0-9]{8,12})\s+Confirmed/i)?.[1] || null;
const parseDate = (d, t) => {
  const [day, month, yr] = d.split('/');
  const year = parseInt(yr) + 2000;
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

// REGEX PATTERNS — one per SMS type
const TILL_REGEX = /Confirmed\.\s+Ksh([\d,]+(?:\.\d+)?)\s+received from\s+(.+?)\s+(\d{10})\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.\s+New Till balance is Ksh([\d,]+(?:\.\d+)?)/i;

const PAYBILL_REGEX = /Confirmed\.\s+Ksh([\d,]+(?:\.\d+)?)\s+received from\s+(.+?)\s+(\d{10})\s+for account\s+(\S+)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.\s+New Paybill balance is Ksh([\d,]+(?:\.\d+)?)/i;

const POCHI_REGEX = /Confirmed\.\s+Ksh([\d,]+(?:\.\d+)?)\s+received from\s+(.+?)\s+(\d{10})\s+via Pochi la Biashara\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.\s+New Pochi balance is Ksh([\d,]+(?:\.\d+)?)/i;

// P2P: phone number comes BEFORE name in this format
const P2P_REGEX = /Confirmed\.\s+Ksh([\d,]+(?:\.\d+)?)\s+received from\s+(\d{10})\s+(.+?)\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\.\s+New M-PESA balance is Ksh([\d,]+(?:\.\d+)?)/i;

const P2P_MASKED_REGEX = /Confirmed\.?\s*You have received\s+Ksh([\d,]+(?:\.\d+)?)\s+from\s+(.+?)\s+([\d*]{10})\s+on\s+(\d+\/\d+\/\d+)\s+at\s+([\d:]+\s+[AP]M)\s+New M-PESA balance is Ksh([\d,]+(?:\.\d+)?)/i;

export function parseMpesaSMS(smsBody, enabledTypes = ['till', 'paybill', 'pochi', 'p2p']) {
  let match;

  if (enabledTypes.includes('till') && (match = smsBody.match(TILL_REGEX))) {
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
    };
  }

  if (enabledTypes.includes('paybill') && (match = smsBody.match(PAYBILL_REGEX))) {
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
    };
  }

  if (enabledTypes.includes('pochi') && (match = smsBody.match(POCHI_REGEX))) {
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
    };
  }

  if (enabledTypes.includes('p2p') && (match = smsBody.match(P2P_REGEX))) {
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
    };
  }

  if (enabledTypes.includes('p2p') && (match = smsBody.match(P2P_MASKED_REGEX))) {
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
    };
  }

  return null; // not an M-Pesa received transaction
}
