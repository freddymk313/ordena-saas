import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenuItem extends Document {
  tenantId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  photoUrl?: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    photoUrl: { type: String, default: "" },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MenuItemSchema.index({ tenantId: 1, categoryId: 1 });

export const MenuItem: Model<IMenuItem> =
  mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);

export default MenuItem;
