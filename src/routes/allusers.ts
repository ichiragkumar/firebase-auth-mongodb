
import { Router } from 'express';
import * as admin from 'firebase-admin';


import { Helper } from '../Helper/helper';
import { Types } from 'mongoose';
import { UserModel } from '../models/user.model';
import { MongoClient, ObjectId } from 'mongodb';



const firebaseAllUsersRouter = Router();


firebaseAllUsersRouter.get("/getAllUsers", async (req, res) =>{

    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

    if (!serviceAccountBase64) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_BASE64 in environment variables');
    }

    const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');

    admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
    });




    const allUsers = [];
    let nextPageToken: string | undefined = undefined;

    do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    allUsers.push(...result.users);
    nextPageToken = result.pageToken;
    } while (nextPageToken);


    const allUsersIDs : string[] = allUsers.map((user: any) => {
            return user.uid;
    });



    const existingUsers : string[] = [];
    const newUsers : string[] = [];

    const transformed:any[] = allUsersIDs.map((id: string) => {

        // check weather this user is 
        // already transformed and made it to valid mongo object id
        const checkIsIdValidAsObjectId = Types.ObjectId.isValid(id);
        if (checkIsIdValidAsObjectId) {
            console.log(`🔍 Using direct ObjectId: ${id}`);
            newUsers.push(id);
        }

        const transformedId =Helper.generateUid(id);
        if (Types.ObjectId.isValid(transformedId)) {
                console.log(`🛠️ Transformed Firebase UID to ObjectId: ${transformedId}`);
        }
        existingUsers.push(transformedId);


    
        
    


    });


    // now let's verifying the existing users to our migrated DB
    const mongoUri = process.env.MAIN_DB_URL;
    if (!mongoUri) {
    throw new Error('Missing MONGO_URI in environment variables');
    }
    const client = new MongoClient(mongoUri);
    await client.connect();

    console.log("connected to Migrated DB")
    const users= client.db('main').collection('users').find({}).toArray;
    if(!users){
        console.log("No users found in Migrated DB")
    }


    // const users =  client.db('main').collection('users').find(existingUsers.map(id => ({ _id: new ObjectId(id) }))).toArray;

    

   res.status(200).json({
    transformedid:transformed,
    transformedLengthis:transformed.length,
    listOfUsers:allUsersIDs.length,
    newUsersLength:newUsers.length,
    newUsers:newUsers,
    existingUsers:existingUsers.length,
    usersIFound:users.length
   });

})


export default firebaseAllUsersRouter;