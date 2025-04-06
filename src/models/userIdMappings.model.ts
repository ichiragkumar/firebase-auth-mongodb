import { Schema, model, Types } from 'mongoose';

interface UserIdMapping {
    firebaseUid: string;
    mongoObjectId: Types.ObjectId;
  }
  

const mappingSchema = new Schema<UserIdMapping>({
  firebaseUid: { type: String, required: true, unique: true },
  mongoObjectId: { type: Schema.Types.ObjectId, required: true, unique: true },

});

export const UserIdMappingModel = model<UserIdMapping>('UserIdMapping', mappingSchema);
