import * as admin from 'firebase-admin';

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;


if (!serviceAccountBase64) {
  throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_BASE64 in environment variables');
}

const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
});

export default admin;
