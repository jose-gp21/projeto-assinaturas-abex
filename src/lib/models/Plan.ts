import mongoose, { Schema, Document } from "mongoose";

export interface IPlan extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number; // ✅ compatível com PaymentService
  monthlyPrice?: number;
  annualPrice?: number;
  features: string[];
  trialDays?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0, // ✅ usado como fallback no PaymentService
    },
    monthlyPrice: {
      type: Number,
      min: 0,
    },
    annualPrice: {
      type: Number,
      min: 0,
    },
    features: [
      {
        type: String,
        required: true,
      },
    ],
    trialDays: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Plan || mongoose.model<IPlan>("Plan", PlanSchema);
