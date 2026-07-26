import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "super_admin" | "restaurant_admin" | "server" | "kitchen";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  tenantId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "restaurant_admin", "server", "kitchen"],
      default: "restaurant_admin",
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
