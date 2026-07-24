import mongoose, { Schema, Document, Model } from "mongoose";

export type ServiceRequestType = "call_server" | "request_bill";
export type ServiceRequestStatus = "pending" | "handled";

export interface IServiceRequest extends Document {
  tenantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  type: ServiceRequestType;
  status: ServiceRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequestSchema = new Schema<IServiceRequest>(
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
    type: {
      type: String,
      enum: ["call_server", "request_bill"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "handled"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true }
);

ServiceRequestSchema.index({ tenantId: 1, status: 1 });

export const ServiceRequest: Model<IServiceRequest> =
  mongoose.models.ServiceRequest ||
  mongoose.model<IServiceRequest>("ServiceRequest", ServiceRequestSchema);

export default ServiceRequest;
