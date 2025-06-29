// src/lib/models/User.ts
import mongoose from 'mongoose';

// Define an interface for typing (optional, but recommended with TypeScript)
export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  subscriptionStatus: string; // Ex: 'Active', 'Inactive', 'Pending'
  registrationDate: Date;
  lastAccess: Date;
}

// Define the Mongoose Schema
const UserSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
    maxlength: [60, 'Name cannot exceed 60 characters.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true, // Ensures emails are unique
    match: [/.+@.+\..+/, 'Please provide a valid email.'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: [6, 'Password must be at least 6 characters long.'],
    // In a real project, you should NOT store the password in plain text.
    // It should be hashed (e.g., with bcrypt) before being saved.
    // For now, we can leave it like this, but remember this for production.
  },
  subscriptionStatus: {
    type: String,
    enum: ['Active', 'Canceled', 'Suspended', 'Pending', 'Inactive'], // Enum of possible statuses
    default: 'Inactive',
  },
  registrationDate: {
    type: Date,
    default: Date.now, // Automatically set creation date
  },
  lastAccess: {
    type: Date,
    default: Date.now, // Updated on login
  },
});

// Check if the model has already been compiled to avoid recompilation during hot-reload
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);