import mongoose, { Document, Schema } from 'mongoose';

export interface IChannel extends Document {
  channelId: string;
  title: string;
  description: string;
  thumbnail: string;
  subscribedSince: Date;
}

const ChannelSchema = new Schema<IChannel>({
  channelId: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String },
  subscribedSince: { type: Date },
});

export const Channel = mongoose.model<IChannel>('Channel', ChannelSchema); 