import { JSONFilePreset } from 'lowdb/node';

// Define the schema
export interface Entry {
    _id: string; // lowdb doesn't auto-gen IDs by default, we'll simple-gen them
    user: string;
    type: 'MEMORY' | 'WISH';
    content: string;
    year: number;
    createdAt: string; // ISO string
}

export interface Data {
    entries: Entry[];
}

// Initialize the database
const defaultData: Data = { entries: [] };
const db = await JSONFilePreset<Data>('db.json', defaultData);

export default db;

// Helper to generate IDs
export const generateId = () => Math.random().toString(36).substr(2, 9);
