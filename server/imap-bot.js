import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { v4 as uuid } from 'uuid';
import { dbRun, dbGet, dbAll } from './db.js';
import { parseEmailTransaction } from './email-parser.js';

let imapConnection;
let isConnected = false;

export async function startImapBot() {
  const imapConfig = {
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASSWORD,
    host: process.env.IMAP_HOST || 'imap.gmail.com',
    port: parseInt(process.env.IMAP_PORT) || 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  };

  imapConnection = new Imap(imapConfig);

  imapConnection.on('ready', () => {
    console.log('✅ IMAP connection ready');
    isConnected = true;

    imapConnection.openBox('INBOX', false, (err, mailbox) => {
      if (err) {
        console.error('❌ Error opening inbox:', err);
        return;
      }
      console.log('📧 INBOX opened, watching for new emails...');
      startMonitoring();
    });
  });

  imapConnection.on('error', (err) => {
    console.error('❌ IMAP error:', err.message);
    isConnected = false;
  });

  imapConnection.on('end', () => {
    console.log('IMAP connection ended');
    isConnected = false;
  });

  imapConnection.on('mail', async (numNewMails) => {
    console.log(`📬 ${numNewMails} new email(s) detected`);
    await checkNewEmails();
  });

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      imapConnection.connect();
      setTimeout(resolve, 2000);
    }, 500);
  });
}

async function startMonitoring() {
  // Check for new emails every 5 minutes
  setInterval(async () => {
    if (isConnected) {
      await checkNewEmails();
    }
  }, 5 * 60 * 1000);

  // Initial check
  await checkNewEmails();
}

async function checkNewEmails() {
  if (!imapConnection || !isConnected) return;

  try {
    const imap = imapConnection;

    imap.search(['UNSEEN'], (err, results) => {
      if (err) {
        console.error('Search error:', err);
        return;
      }

      if (results.length === 0) {
        console.log('No new unread emails');
        return;
      }

      const f = imap.fetch(results, { bodies: '' });

      f.on('message', (msg, seqno) => {
        let emailText = '';
        let emailFrom = '';
        let emailSubject = '';

        msg.on('body', (stream, info) => {
          stream.on('data', (chunk) => {
            emailText += chunk.toString();
          });
        });

        msg.on('attributes', (attrs) => {
          // Extract headers
          const headers = attrs.struct;
        });

        msg.on('end', async () => {
          try {
            // Simple regex to extract from and subject
            const fromMatch = emailText.match(/From:\s*([^\n]+)/);
            const subjectMatch = emailText.match(/Subject:\s*([^\n]+)/);

            emailFrom = fromMatch ? fromMatch[1] : '';
            emailSubject = subjectMatch ? subjectMatch[1] : '';

            // Check if from Caisse d'Épargne
            if (!emailFrom.toLowerCase().includes('caisseepargne')) {
              console.log('Skipping email from:', emailFrom);
              return;
            }

            console.log(`📧 Processing email: ${emailSubject}`);

            // Parse transaction from email
            const transaction = parseEmailTransaction(emailText);

            if (transaction) {
              await saveTransaction(transaction);
            }
          } catch (err) {
            console.error('Error processing email:', err);
          }
        });
      });

      f.on('error', (err) => {
        console.error('Fetch error:', err);
      });

      f.on('end', () => {
        // Mark as read
        imap.setFlags(results, ['\\Seen'], (err) => {
          if (err) console.error('Flag error:', err);
        });
      });
    });
  } catch (err) {
    console.error('Error checking emails:', err);
  }
}

async function saveTransaction(transactionData) {
  try {
    // Check if already exists
    const existing = await dbGet(
      'SELECT id FROM transactions WHERE email_id = ?',
      [transactionData.emailId]
    );

    if (existing) {
      console.log('Transaction already exists, skipping');
      return;
    }

    // Get or create default user
    let user = await dbGet('SELECT id FROM users LIMIT 1');
    if (!user) {
      const userId = uuid();
      await dbRun(
        'INSERT INTO users (id, email) VALUES (?, ?)',
        [userId, 'default-user@app']
      );
      user = { id: userId };
    }

    // Insert transaction
    const transactionId = uuid();
    await dbRun(
      `INSERT INTO transactions (id, user_id, amount, merchant, transaction_date, email_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        transactionId,
        user.id,
        transactionData.amount,
        transactionData.merchant,
        transactionData.date,
        transactionData.emailId
      ]
    );

    console.log(`✅ Transaction saved: ${transactionData.merchant} - ${transactionData.amount}€`);
  } catch (err) {
    console.error('Error saving transaction:', err);
  }
}

export function isImapConnected() {
  return isConnected;
}
