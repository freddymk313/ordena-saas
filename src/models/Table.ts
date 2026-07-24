import mongoose, { Schema, Document, Model } from "mongoose";

export type TableStatus = "free" | "occupied" | "service_requested" | "bill_requested";

export interface ITable extends Document {
  tenantId: mongoose.Types.ObjectId;
  label: string;
  qrToken: string;
  status: TableStatus;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    label: { type: String, required: true, trim: true },
    qrToken: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["free", "occupied", "service_requested", "bill_requested"],
      default: "free",
      required: true,
    },
  },
  { timestamps: true }
);

TableSchema.index({ tenantId: 1, label: 1 });

export const Table: Model<ITable> =
  mongoose.models.Table || mongoose.model<ITable>("Table", TableSchema);

export default Table;
