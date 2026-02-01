import mongoose, { Schema } from "mongoose";

export interface SettingDoc extends mongoose.Document {
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<SettingDoc>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: String, required: true }
  },
  { timestamps: true }
);

export const Setting = mongoose.model<SettingDoc>("Setting", SettingSchema);
