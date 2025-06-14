import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
  videoId: string;
  channelId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: Date;
}

const VideoSchema = new Schema<IVideo>({
  videoId: { type: String, unique: true, required: true },
  channelId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String },
  publishedAt: { type: Date },
});

export const Video = mongoose.model<IVideo>('Video', VideoSchema); 