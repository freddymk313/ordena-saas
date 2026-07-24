import mongoose, { Schema, Document, Model } from "mongoose";

export type BillStatus = "pending" | "bill_delivered" | "paid";

export interface IBill extends Document {
  tenantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  orderIds: mongoose.Types.ObjectId[];
  totalAmount: number;
  status: BillStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema = new Schema<IBill>(
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
    orderIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "bill_delivered", "paid"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true }
);

BillSchema.index({ tenantId: 1, status: 1 });

export const Bill: Model<IBill> =
  mongoose.models.Bill || mongoose.model<IBill>("Bill", BillSchema);

export default Bill;
