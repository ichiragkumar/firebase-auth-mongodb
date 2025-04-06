import { connectToDb } from './dbconfig/db';
import admin from './firebase-admin-init';

export async function generateUidMappings() {
  const db = await connectToDb();
  const usersCollection = db.collection('users');
  const mappingsCollection = db.collection('userIdMappings');
  const mongoUsers = await usersCollection.find({}).toArray();
  const batch = mappingsCollection.initializeUnorderedBulkOp();

  let operationCount = 0;
  let nextPageToken: string | undefined;

  do {
    const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
    for (const firebaseUser of listUsersResult.users) {
      const firebaseUid = firebaseUser.uid;
      const matchingUser = mongoUsers.find((user: any) =>
        (firebaseUser.phoneNumber && user.phoneNumber === firebaseUser.phoneNumber) ||
        (firebaseUser.email && user.email === firebaseUser.email)
      );

      if (matchingUser) {
        batch.insert({
          firebaseUid,
          mongoDbId: matchingUser._id,
          identifier: firebaseUser.phoneNumber || firebaseUser.email,
        });
        operationCount++;

        if (operationCount >= 1000) {
          await batch.execute();
          operationCount = 0;
        }
      }
    }

    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);

  if (operationCount > 0) await batch.execute();
  console.log('✅ UID Mappings Migration Complete');
}
