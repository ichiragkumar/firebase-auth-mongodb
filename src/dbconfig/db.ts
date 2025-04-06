import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let db: Db;

export async function connectToDb(): Promise<Db> {
  if (!db) {
    const client = await MongoClient.connect(process.env.MONGO_URI!, {
      maxPoolSize: 10,
    });
    db = client.db(process.env.DB_NAME!);
  }
  return db;
}
