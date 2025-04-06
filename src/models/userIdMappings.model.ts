import { Schema, model, Document } from 'mongoose';

export interface UserIdMapping extends Document {
  firebaseUid: string;
  mongoDbId: string;
  identifier: string; 
}

const mappingSchema = new Schema<UserIdMapping>({
  firebaseUid: { type: String, required: true, unique: true },
  mongoDbId: { type: String, required: true },
  identifier: { type: String },
});

export const UserIdMappingModel = model<UserIdMapping>('UserIdMapping', mappingSchema);
