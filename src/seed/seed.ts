import { ObjectId } from "mongodb";
import { Helper } from "../Helper/helper";
import { UserIdMappingModel } from "../models/userIdMappings.model";
import { Types } from "mongoose";
import { UserModel } from "../models/user.model";

async function seedUserIdMappings() {
    const uids = [
        'gZNH3MjzyZOAF5yPkww4gXly9xg2',
        '61QtpfWKfaSf15Nriks8tFz0Xwx2',
    ];

    for (const uid of uids) {
        const mongoIdStr = Helper.generateUid(uid);
        const mongoObjectId = new ObjectId(mongoIdStr);

        await UserIdMappingModel.create({
        firebaseUid: uid,
        mongoObjectId,
        });

        console.log(`✅ Inserted mapping for ${uid} → ${mongoObjectId}`);
    }
}

async function seedUsers() {
    const users = [
      {
        _id: new Types.ObjectId(Helper.generateUid('gZNH3MjzyZOAF5yPkww4gXly9xg2')),
        email: 'user1@example.com',
        username: 'user1',
        phoneNumber: '+911234567890',
        status: 'active',
        signUpProcessed: true,
      },
      {
        _id: new Types.ObjectId(Helper.generateUid('61QtpfWKfaSf15Nriks8tFz0Xwx2')),
        email: 'user2@example.com',
        username: 'user2',
        phoneNumber: '+919876543210',
        status: 'active',
        signUpProcessed: true,
      },
    ];
  
    for (const user of users) {
      await UserModel.create(user);
      console.log(`✅ Inserted user ${user.username}`);
    }
  }