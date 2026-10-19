import { v4 as uuid } from 'uuid';

/**
 * Parse Caisse d'Épargne alert email to extract transaction info
 *
 * Expected email format:
 * "Paiement CB de 47,50€ chez AMAZON EUROPE S.A. le 18/10/2026 à 14:32"
 * "Virement de 150€ le 18/10/2026"
 * "Prélèvement de 25,99€ le 18/10/2026"
 */
export function parseEmailTransaction(emailText) {
  if (!emailText) return null;

  const lines = emailText.split('\n');
  let transactionLine = '';

  // Find the transaction line
  for (const line of lines) {
    if (line.includes('€') && (
      line.includes('Paiement CB') ||
      line.includes('Virement') ||
      line.includes('Prélèvement') ||
      line.includes('Chèque')
    )) {
      transactionLine = line;
      break;
    }
  }

  if (!transactionLine) {
    console.log('Could not find transaction line in email');
    return null;
  }

  try {
    // Extract amount (e.g., "47,50€" or "150€")
    const amountMatch = transactionLine.match(/(\d+[.,]\d{2}|\d+)€/);
    if (!amountMatch) {
      console.log('Could not extract amount');
      return null;
    }

    const amountStr = amountMatch[1].replace(',', '.');
    const amount = parseFloat(amountStr);

    // Extract merchant/description
    let merchant = 'Unknown';

    if (transactionLine.includes('Paiement CB')) {
      const merchantMatch = transactionLine.match(/chez\s+([A-Z0-9\s]+)(?:\s+le|\s*$)/);
      if (merchantMatch) {
        merchant = merchantMatch[1].trim();
      }
    } else if (transactionLine.includes('Virement')) {
      merchant = 'Virement';
    } else if (transactionLine.includes('Prélèvement')) {
      merchant = 'Prélèvement';
    } else if (transactionLine.includes('Chèque')) {
      merchant = 'Chèque';
    }

    // Extract date (e.g., "le 18/10/2026 à 14:32" or "le 18/10/2026")
    const dateMatch = transactionLine.match(/le\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    let date = new Date().toISOString();

    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      date = new Date(year, parseInt(month) - 1, day).toISOString();
    }

    return {
      amount,
      merchant,
      date,
      emailId: uuid() // Simple unique ID based on content
    };
  } catch (err) {
    console.error('Error parsing transaction:', err);
    return null;
  }
}
