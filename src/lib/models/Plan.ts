// src/lib/models/Plan.ts
import mongoose from 'mongoose';

export interface IPlan extends mongoose.Document {
  name: string;
  monthlyValue?: number; // Alterado de monthlyPrice para monthlyValue
  annualValue?: number;  // Alterado de annualPrice para annualValue
  description: string;
  benefits: string[];
  trialDays?: number;
  popular?: boolean;     // Adicionado campo popular
  active?: boolean;      // Adicionado campo active
}

const PlanSchema = new mongoose.Schema<IPlan>({
  name: {
    type: String,
    required: [true, 'Please provide the plan name.'],
    unique: true,
  },
  monthlyValue: {  // Alterado de monthlyPrice para monthlyValue
    type: Number,
    min: 0,
  },
  annualValue: {   // Alterado de annualPrice para annualValue
    type: Number,
    min: 0,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for the plan.'],
  },
  benefits: {
    type: [String],
    default: [],
  },
  trialDays: {
    type: Number,
    min: 0,
    default: 0,
  },
  popular: {       // Adicionado campo popular
    type: Boolean,
    default: false,
  },
  active: {        // Adicionado campo active
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
});

export default mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);