import { Router } from 'express';
import { Types } from 'mongoose';
import { UserModel } from '../models/user.model';
import { UserIdMappingModel } from '../models/userIdMappings.model';


const router = Router();



// Create user with custom _id
router.post('/create', async (req, res) => {
  try {
    const { _id, phoneNumber, status, username, email } = req.body;

    const user = new UserModel({
      _id: new Types.ObjectId(_id),
      phoneNumber,
      status,
      username,
      email,
      signUpProcessed: true,
      notificationSettings: {
        cart: ['push'],
        prizes: ['push'],
        coupons: ['push'],
        business: ['push'],
        invites: ['push'],
        tickets: ['push'],
        wallet: ['push'],
      },
      grandDrawBalances: { EGP: 0 },
      activeGrandDrawBalance: { EGP: 0 },
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Error creating user', error: err });
  }
});


router.get('/get-user-details/:uid', async (req, res): Promise<any> => {
    const { uid } = req.params;
  
    let objectId: string | null = null;
  
    // Case 1: Is valid ObjectId already
    if (Types.ObjectId.isValid(uid)) {
      objectId = uid;
    } else {
      // Case 2: Try to transform Firebase UID to Mongo ObjectId
      const transformed = await helperService.getMongoDbId(uid);
      if (Types.ObjectId.isValid(transformed)) {
        objectId = transformed;
      }
    }
  
    if (!objectId) {
      return res.status(400).json({ message: 'Invalid UID format' });
    }
  
    try {
      const user = await UserModel.findById(objectId);
      if (user) return res.status(200).json(user);
  
      return res.status(404).json({ message: 'User not found' });
    } catch (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ message: 'Internal error', error: err });
    }
  });