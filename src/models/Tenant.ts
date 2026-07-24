import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITenant extends Document {
  name: string;
  logoUrl?: string;
  brandColor?: string;
  subscriptionStatus: "active" | "inactive" | "canceled" | "trial";
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: "" },
    brandColor: { type: String, default: "#3b82f6" },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "canceled", "trial"],
      default: "trial",
      required: true,
    },
  },
  { timestamps: true }
);

export const Tenant: Model<ITenant> =
  mongoose.models.Tenant || mongoose.model<ITenant>("Tenant", TenantSchema);

export default Tenant;
