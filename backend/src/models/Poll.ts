import mongoose, { Document, Schema, Types } from "mongoose";

export interface IVote {
  user: Types.ObjectId;
  option: string;
}

export interface IPoll extends Document {
  title: string;
  description: string;
  options: string[];
  expiresAt: Date;
  image?: string;
  createdBy: Types.ObjectId;
  votes: IVote[];
  closed: boolean;
  createdAt: Date;
  visibility: "public" | "private";
}

const VoteSchema = new Schema<IVote>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  option: { type: String, required: true },
});

const PollSchema = new Schema<IPoll>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    options: [{ type: String, required: true }],
    expiresAt: { type: Date, required: true },
    image: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    votes: [VoteSchema],
    closed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false, // remove __v
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

export default mongoose.model<IPoll>("Poll", PollSchema);
