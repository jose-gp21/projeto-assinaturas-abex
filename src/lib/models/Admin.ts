// src/lib/models/Admin.ts
import mongoose from 'mongoose';

export interface IAdmin extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  accessLevel: string; // Ex: 'Super Admin', 'Content Manager', 'Finance Manager'
}

const AdminSchema = new mongoose.Schema<IAdmin>({
  name: {
    type: String,
    required: [true, 'Please provide a name for the admin.'],
    maxlength: [60, 'Name cannot exceed 60 characters.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email for the admin.'],
    unique: true,
    match: [/.+@.+\..+/, 'Please provide a valid email.'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password for the admin.'],
    minlength: [6, 'Password must be at least 6 characters long.'],
  },
  accessLevel: {
    type: String,
    enum: ['Super Admin', 'Content Manager', 'Finance Manager'], // Example of access levels
    default: 'Content Manager',
  },
});

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);