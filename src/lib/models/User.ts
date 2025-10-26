import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  subscriptionStatus?: "active" | "inactive" | "cancelled" | "expired";
  role: "admin" | "member";
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailVerified: {
      type: Date,
    },
    image: {
      type: String,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "cancelled", "expired"],
      default: "inactive", // ✅ padronizado em minúsculas
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
  },
  {
    timestamps: true,
  }
);

// Índices para performance e consultas
UserSchema.index({ email: 1 });
UserSchema.index({ subscriptionStatus: 1 });

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
