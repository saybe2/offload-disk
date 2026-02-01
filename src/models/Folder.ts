import mongoose, { Schema } from "mongoose";

export interface FolderDoc extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  parentId?: mongoose.Types.ObjectId | null;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<FolderDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Folder", default: null, index: true },
    priority: { type: Number, default: 2 }
  },
  { timestamps: true }
);

FolderSchema.index({ userId: 1, parentId: 1, name: 1 }, { unique: true });

export const Folder = mongoose.model<FolderDoc>("Folder", FolderSchema);
