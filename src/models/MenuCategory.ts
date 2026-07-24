import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMenuCategory extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const MenuCategorySchema = new Schema<IMenuCategory>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MenuCategorySchema.index({ tenantId: 1, order: 1 });

export const MenuCategory: Model<IMenuCategory> =
  mongoose.models.MenuCategory || mongoose.model<IMenuCategory>("MenuCategory", MenuCategorySchema);

export default MenuCategory;
