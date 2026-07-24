import mongoose, { Schema, Document, Model } from "mongoose";

export type OrderStatus = "pending" | "preparing" | "ready" | "served";

export interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IOrder extends Document {
  tenantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  customerName?: string;
  items: IOrderItem[];
  status: OrderStatus;
  estimatedReadyAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    tableId: {
      type: Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },
    customerName: { type: String, default: "" },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(val: IOrderItem[]) => val.length > 0, "Au moins un article est requis"],
    },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "served"],
      default: "pending",
      required: true,
    },
    estimatedReadyAt: { type: Date },
  },
  { timestamps: true }
);

OrderSchema.index({ tenantId: 1, status: 1 });
OrderSchema.index({ tenantId: 1, tableId: 1 });

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
