import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPost extends Document {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  project: string;
  tags: string[];
  coverImage?: string;
  featured: boolean;
  status: "draft" | "published";
  publishedAt?: Date;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: true,
    },
    project: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    coverImage: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    publishedAt: {
      type: Date,
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

PostSchema.index({ title: "text", excerpt: "text", content: "text", project: "text", tags: "text" });

export const Post: Model<IPost> =
  (mongoose.models.Post as Model<IPost>) || mongoose.model<IPost>("Post", PostSchema);
