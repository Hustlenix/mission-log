import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
const bookmarkSchema = new Schema(
  {
    userId: { type: String, required: true },
    type: { type: String, required: true },
    itemId: { type: String, required: true },
    title: { type: String, required: true },
    href: { type: String, required: true },
  },
  { timestamps: true },
);
bookmarkSchema.index({ userId: 1, type: 1, itemId: 1 }, { unique: true });
const followSchema = new Schema(
  {
    userId: { type: String, required: true },
    type: {
      type: String,
      enum: ["topic", "asteroid"] as string[],
      required: true,
    },
    itemId: { type: String, required: true },
    title: String,
    href: String,
  },
  { timestamps: true },
);
followSchema.index({ userId: 1, type: 1, itemId: 1 }, { unique: true });
const collectionSchema = new Schema(
  {
    userId: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true, maxlength: 100 },
    visibility: {
      type: String,
      enum: ["private", "unlisted", "public"],
      default: "private",
    },
  },
  { timestamps: true },
);
const itemSchema = new Schema(
  {
    userId: { type: String, required: true },
    collectionId: { type: String, required: true },
    bookmarkId: { type: String, required: true },
  },
  { timestamps: true },
);
itemSchema.index({ collectionId: 1, bookmarkId: 1 }, { unique: true });
const profileSchema = new Schema(
  {
    userId: { type: String, unique: true, required: true },
    role: {
      type: String,
      enum: ["user", "author", "editor", "admin"],
      default: "user",
    },
    recordHistory: { type: Boolean, default: false },
  },
  { timestamps: true },
);
const historySchema = new Schema(
  {
    userId: { type: String, required: true },
    slug: { type: String, required: true },
    title: String,
    progress: { type: Number, min: 0, max: 100 },
    completed: Boolean,
    lastReadAt: Date,
  },
  { timestamps: true },
);
historySchema.index({ userId: 1, slug: 1 }, { unique: true });
export const Bookmark =
  (mongoose.models.Bookmark as Model<InferSchemaType<typeof bookmarkSchema>>) ||
  mongoose.model("Bookmark", bookmarkSchema);
export const Follow =
  (mongoose.models.Follow as Model<InferSchemaType<typeof followSchema>>) ||
  mongoose.model("Follow", followSchema);
export const ReaderCollection =
  (mongoose.models.ReaderCollection as Model<
    InferSchemaType<typeof collectionSchema>
  >) || mongoose.model("ReaderCollection", collectionSchema);
export const CollectionItem =
  (mongoose.models.CollectionItem as Model<
    InferSchemaType<typeof itemSchema>
  >) || mongoose.model("CollectionItem", itemSchema);
export const ReaderProfile =
  (mongoose.models.ReaderProfile as Model<
    InferSchemaType<typeof profileSchema>
  >) || mongoose.model("ReaderProfile", profileSchema);
export const ReadingHistory =
  (mongoose.models.ReadingHistory as Model<
    InferSchemaType<typeof historySchema>
  >) || mongoose.model("ReadingHistory", historySchema);
