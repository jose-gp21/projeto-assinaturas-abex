// src/lib/models/Subscription.ts
import mongoose from 'mongoose';

export interface ISubscription extends mongoose.Document {
  type: string;           // Ex: 'Monthly', 'Annual' 
  startDate: Date;
  endDate: Date;
  status: string;         // Ex: 'Active', 'Canceled', 'Suspended' 
  trialPeriod: boolean;
  memberId: mongoose.Schema.Types.ObjectId; // Reference to the Member ID
  planId: mongoose.Schema.Types.ObjectId;   // Reference to the Plan ID
}

const SubscriptionSchema = new mongoose.Schema<ISubscription>({
  type: {
    type: String,
    enum: ['Monthly', 'Annual'], // According to your class diagram
    required: [true, 'Please specify the subscription type.'],
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide the subscription start date.'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide the subscription end date.'],
  },
  status: {
    type: String,
    enum: ['Active', 'Canceled', 'Suspended'], // According to your class diagram
    default: 'Active',
  },
  trialPeriod: {
    type: Boolean,
    default: false,
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the 'User' model
    required: [true, 'Member ID is required for the subscription.'],
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan', // References the 'Plan' model
    required: [true, 'Plan ID is required for the subscription.'],
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);