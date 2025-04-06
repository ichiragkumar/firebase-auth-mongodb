import { Router } from 'express';
import { Types } from 'mongoose';
import { UserModel } from '../models/user.model';
import { UserIdMappingModel } from '../models/userIdMappings.model';
import { Helper } from '../Helper/helper';



const router = Router();




router.post('/create', async (req, res) => {
  try {
    const { _id, phoneNumber, status, username, email } = req.body;

    const user = new UserModel({
      _id: new Types.ObjectId(_id),
      phoneNumber,
      status,
      username,
      email,
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err });
  }
});





router.get('/get-user-details/:uid', async (req, res): Promise<any> => {
    const { uid } = req.params;

  
    let objectId: string | null = null;
  
    if (Types.ObjectId.isValid(uid)) {
      objectId = uid;
      console.log(`🔍 Using direct ObjectId: ${objectId}`);
    } else {

      const transformed = Helper.generateUid(uid);
      if (Types.ObjectId.isValid(transformed)) {
        objectId = transformed;
        console.log(`🛠️ Transformed Firebase UID to ObjectId: ${objectId}`);
      }
    }
  
    if (!objectId) {
      return res.status(400).json({ message: 'Invalid UID format' });
    }
  
    try {

      const user = await UserModel.findById(objectId);
      if (user) {
        console.log('✅ User found with _id:', objectId);
        return res.status(200).json(user);
      }
  

      const mapping = await UserIdMappingModel.findOne({ firebaseUid: uid });
      if (mapping) {
        const mainUserFromFirebase = await UserModel.findById(mapping.mongoObjectId);
        if (mainUserFromFirebase) {
          console.log(`📦 Legacy user found via mapping from Firebase UID: ${uid}`);
          return res.status(200).json(mainUserFromFirebase);
        }
      }
  
      return res.status(404).json({ message: 'User not found' });
    } catch (err) {
      console.error('❌ Error fetching user:', err);
      return res.status(500).json({ message: 'Internal server error', error: err });
    }
  });



export default router;