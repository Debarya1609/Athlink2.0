import admin from 'firebase-admin';

// Initialize Firebase (Requires FIREBASE_SERVICE_ACCOUNT in env)
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized');
  } else {
    console.warn('Firebase Admin skipped: No FIREBASE_SERVICE_ACCOUNT provided');
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin', error);
}

export const sendPushNotification = async (fcmToken: string, payload: any, type: 'DM' | 'Group' | 'E2EE') => {
  if (!admin.apps.length) return;

  let priority: 'high' | 'normal' = 'normal';
  let messageData = { ...payload };

  if (type === 'DM') {
    priority = 'high';
  } else if (type === 'E2EE') {
    priority = 'normal';
    messageData = { title: 'New Message', body: 'You received an encrypted message' };
  }

  const message = {
    token: fcmToken,
    data: { payload: JSON.stringify(messageData) },
    android: { priority },
    apns: {
      headers: {
        'apns-priority': priority === 'high' ? '10' : '5'
      }
    }
  };

  try {
    await admin.messaging().send(message);
  } catch (error) {
    console.error('Push delivery failed', error);
  }
};
