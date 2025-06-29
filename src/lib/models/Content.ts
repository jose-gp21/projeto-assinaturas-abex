// src/lib/models/Content.ts
import mongoose from 'mongoose';

export interface IContent extends mongoose.Document {
  title: string;
  description: string;
  publicationDate: Date;
  type: string; // Ex: 'Video', 'Article', 'Event'
  url?: string; // Content URL (if external)
  restricted: boolean; // Whether the content is exclusive to subscribers
  planId?: mongoose.Schema.Types.ObjectId; // Optional: for which plan this content is exclusive
}

const ContentSchema = new mongoose.Schema<IContent>({
  title: {
    type: String,
    required: [true, 'Please provide a title for the content.'],
    maxlength: [100, 'Title cannot exceed 100 characters.'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for the content.'],
  },
  publicationDate: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['Video', 'Article', 'Event', 'Other'], // Content types
    required: [true, 'Please provide the content type.'],
  },
  url: {
    type: String,
  },
  restricted: {
    type: Boolean,
    default: true, // By default, content is restricted
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan', // References the 'Plan' model
    // This field is optional because content can be restricted but not exclusive to a specific plan
    // Or it can be for multiple plans. For simplicity, we leave it like this.
  },
});

export default mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);