import { Schema, model, Types, Document } from 'mongoose';

export interface NotificationSettings {
  cart: string[];
  prizes: string[];
  coupons: string[];
  business: string[];
  invites: string[];
  tickets: string[];
  wallet: string[];
}

export interface User extends Document {
  _id: Types.ObjectId;
  phoneNumber: string;
  status: 'active' | 'inactive' | 'banned';
  username: string;
  email: string;
  signUpProcessed: boolean;
  notificationSettings: NotificationSettings;
  grandDrawBalances: Record<string, any>;
  activeGrandDrawBalance: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSettingsSchema = new Schema<NotificationSettings>({
  cart: { type: [String], default: [] },
  prizes: { type: [String], default: [] },
  coupons: { type: [String], default: [] },
  business: { type: [String], default: [] },
  invites: { type: [String], default: [] },
  tickets: { type: [String], default: [] },
  wallet: { type: [String], default: [] },
}, { _id: false });

const userSchema = new Schema<User>({
  _id: { type: Schema.Types.ObjectId },
  phoneNumber: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
  username: { type: String, required: true },
  email: { type: String, required: true },
  signUpProcessed: { type: Boolean, default: false },
  notificationSettings: { type: notificationSettingsSchema, default: () => ({}) },
  grandDrawBalances: { type: Schema.Types.Mixed, default: () => ({}) },
  activeGrandDrawBalance: { type: Schema.Types.Mixed, default: () => ({}) },
}, {
  timestamps: true
});

export const UserModel = model<User>('User', userSchema);
