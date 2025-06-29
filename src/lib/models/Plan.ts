// src/lib/models/Plan.ts
import mongoose from 'mongoose';

export interface IPlan extends mongoose.Document {
  name: string;
  monthlyPrice?: number; // Optional value, if only annual 
  annualPrice?: number;  // Optional value, if only monthly 
  description: string;
  benefits: string[]; // Array of strings for the benefits 
  trialDays?: number;   // Trial days, optional 
}

const PlanSchema = new mongoose.Schema<IPlan>({
  name: {
    type: String,
    required: [true, 'Please provide the plan name.'],
    unique: true,
  },
  monthlyPrice: {
    type: Number,
    min: 0,
  },
  annualPrice: {
    type: Number,
    min: 0,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for the plan.'],
  },
  benefits: {
    type: [String], // Array of strings
    default: [],
  },
  trialDays: {
    type: Number,
    min: 0,
  },
});

export default mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);