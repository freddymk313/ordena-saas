import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITenant extends Document {
  name: string;
  logoUrl?: string;
  brandColor?: string;
  subscriptionStatus: "active" | "inactive" | "canceled" | "trial";
  onboardingCompleted: boolean;
  currency?: string;
  address?: string;
  phone?: string;
  timezone?: string;
  taxRate?: number;
  enableMobileOrders?: boolean;
  enableCallServer?: boolean;
  enableSound?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: "" },
    brandColor: { type: String, default: "#059669" },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "canceled", "trial"],
      default: "trial",
      required: true,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
      required: true,
    },
    currency: { type: String, default: "€" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    timezone: { type: String, default: "Europe/Paris" },
    taxRate: { type: Number, default: 10 },
    enableMobileOrders: { type: Boolean, default: true },
    enableCallServer: { type: Boolean, default: true },
    enableSound: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Tenant: Model<ITenant> =
  mongoose.models.Tenant || mongoose.model<ITenant>("Tenant", TenantSchema);

export default Tenant;
