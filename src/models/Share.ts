import mongoose, { Schema } from "mongoose";

export type ShareType = "archive" | "folder";

export interface ShareDoc extends mongoose.Document {
  token: string;
  userId: mongoose.Types.ObjectId;
  type: ShareType;
  archiveId?: mongoose.Types.ObjectId | null;
  folderId?: mongoose.Types.ObjectId | null;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ShareSchema = new Schema<ShareDoc>(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["archive", "folder"], required: true },
    archiveId: { type: Schema.Types.ObjectId, ref: "Archive", default: null },
    folderId: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
    expiresAt: { type: Date, default: null }
  },
  { timestamps: true }
);

ShareSchema.index({ userId: 1, createdAt: -1 });

export const Share = mongoose.model<ShareDoc>("Share", ShareSchema);
