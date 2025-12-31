import mongoose from 'mongoose';

export interface IEntry extends mongoose.Document {
    user: string;
    type: 'MEMORY' | 'WISH';
    content: string;
    year: number;
    createdAt: Date;
}

const EntrySchema = new mongoose.Schema<IEntry>({
    user: {
        type: String,
        required: [true, 'Please specify the user'],
    },
    type: {
        type: String,
        enum: ['MEMORY', 'WISH'],
        required: [true, 'Please specify the type'],
    },
    content: {
        type: String,
        required: [true, 'Please provide content'],
    },
    year: {
        type: Number,
        required: [true, 'Please specify the year'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Entry || mongoose.model<IEntry>('Entry', EntrySchema);
