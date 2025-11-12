import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  mpPaymentId: string;
  preferenceId?: string;
  amount: number;
  currency?: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "refunded";
  paymentMethod?: string;
  paidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: false, // assinatura pode ser criada depois
    },
    mpPaymentId: {
      type: String,
      required: true,
      unique: true, // id único do pagamento do Mercado Pago
    },
    preferenceId: {
      type: String,
      required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "BRL",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: false,
    },
    paidAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
