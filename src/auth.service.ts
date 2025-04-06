import { MongoClient, ObjectId } from 'mongodb';


const mongoClient = new MongoClient(process.env.MONGO_URI!);
mongoClient.connect();
const db = mongoClient.db(process.env.DB_NAME!);
const usersCollection = db.collection('users');
const mappingsCollection = db.collection('userIdMappings');

export async function getUserByFirebaseUid(firebaseUid: string) {
  // Check if new-style user exists where firebaseUid === _id
  try {
    const objectId = new ObjectId(firebaseUid);
    const newUser = await usersCollection.findOne({ _id: objectId });
    if (newUser) return newUser;
  } catch (e) {
    // Not a valid ObjectId — fallback to mapping
  }

  // Check in mapping collection for old users
  const mapping = await mappingsCollection.findOne({ firebaseUid });
  if (mapping) {
    return usersCollection.findOne({ _id: new ObjectId(mapping.mongoDbId) });
  }

  return null;
}
