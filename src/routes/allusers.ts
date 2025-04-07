import { Router } from 'express';
import * as admin from 'firebase-admin';
import { Helper } from '../Helper/helper';
import { MongoClient, ObjectId } from 'mongodb';

const firebaseAllUsersRouter = Router();

firebaseAllUsersRouter.get("/getAllUsers", async (req, res): Promise<any> => {
  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    const MAIN_DB_URL = process.env.MAIN_DB_URL;

    if (!serviceAccountBase64 || !MAIN_DB_URL) {
      throw new Error('Missing environment variables');
    }

    const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
      });
    }


    const allUsers = [];
    let nextPageToken: string | undefined = undefined;

    do {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      allUsers.push(...result.users);
      nextPageToken = result.pageToken;
    } while (nextPageToken);

    const allUserUIDs = allUsers.map(user => user.uid);

    const transformedObjectIds: ObjectId[] = [];
    const validTransformMap: { _id: ObjectId; firebaseUid: string }[] = [];

    for (const uid of allUserUIDs) {
      if (ObjectId.isValid(uid)) {
        continue;
      }

      const transformed = Helper.generateUid(uid);

      if (ObjectId.isValid(transformed)) {
        const objectId = new ObjectId(transformed);
        transformedObjectIds.push(objectId);
        validTransformMap.push({
          _id: objectId,
          firebaseUid: uid
        });
      }
    }

    const client = new MongoClient(MAIN_DB_URL);
    await client.connect();

    const db = client.db('main');
    const usersCollection = db.collection('users');
    const mappingCollection = db.collection('mapuserauths');


    const usersFound = await usersCollection.find({
      _id: { $in: transformedObjectIds }
    }).toArray();


    for (const existingUsersInDB of validTransformMap) {
      const exists = await mappingCollection.findOne({ _id: existingUsersInDB._id });
      if (!exists) {
        await mappingCollection.insertOne(existingUsersInDB);
      }
    }

    await client.close();

    return res.status(200).json({
      firebaseTotalUsers: allUserUIDs.length,
      nonMongoIdUids: validTransformMap.length,
      existingUsersInDB: usersFound.length,
      newMappingsInserted: validTransformMap.length - usersFound.length
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

export default firebaseAllUsersRouter;
