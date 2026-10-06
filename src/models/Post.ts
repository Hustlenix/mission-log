import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPost extends Document {
  slug: string;
  title: string;
  subtitle?: string;
  contentType: string;
  topicIds: string[];
  coverAlt?: string;
  imageCredit?: string;
  sources: { title: string; url: string }[];
  editorialNote?: string;
  seoTitle?: string;
  seoDescription?: string;
  scheduledAt?: Date;
  excerpt: string;
  content: string;
  project: string;
  tags: string[];
  coverImage?: string;
  featured: boolean;
  status: "draft" | "review" | "scheduled" | "published";
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
    subtitle: { type: String, maxlength: 500 },
    contentType: {
      type: String,
      default: "mission-log",
      enum: [
        "story",
        "news",
        "explainer",
        "deep-dive",
        "daily-brief",
        "guide",
        "timeline",
        "profile",
        "list",
        "mission-log",
        "data-story",
        "opinion",
        "interactive",
      ],
    },
    topicIds: { type: [String], default: [], index: true },
    coverAlt: { type: String, maxlength: 500 },
    imageCredit: { type: String, maxlength: 500 },
    sources: {
      type: [{ title: String, url: String, _id: false }],
      default: [],
    },
    editorialNote: { type: String, maxlength: 1000 },
    seoTitle: { type: String, maxlength: 200 },
    seoDescription: { type: String, maxlength: 500 },
    scheduledAt: Date,
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
      enum: ["draft", "review", "scheduled", "published"],
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
  },
);

PostSchema.index({
  title: "text",
  excerpt: "text",
  content: "text",
  project: "text",
  tags: "text",
});
PostSchema.index({ status: 1, publishedAt: -1 });

export const Post: Model<IPost> =
  (mongoose.models.Post as Model<IPost>) ||
  mongoose.model<IPost>("Post", PostSchema);
