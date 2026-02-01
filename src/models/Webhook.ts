import mongoose, { Schema } from "mongoose";

export interface WebhookDoc extends mongoose.Document {
  url: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookSchema = new Schema<WebhookDoc>(
  {
    url: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Webhook = mongoose.model<WebhookDoc>("Webhook", WebhookSchema);
