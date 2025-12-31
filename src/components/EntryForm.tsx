'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EntryFormProps {
    user: string;
    onAdd: (entry: any) => Promise<void>;
    onCancel: () => void;
}

export default function EntryForm({ user, onAdd, onCancel }: EntryFormProps) {
    const [content, setContent] = useState('');
    const [type, setType] = useState<'MEMORY' | 'WISH'>('MEMORY');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            console.log('Submitting entry...', { user, type, content });
            await onAdd({
                user,
                type,
                content,
                year: type === 'MEMORY' ? 2025 : 2026,
            });
            console.log('Submission successful');
            setContent('');
        } catch (error) {
            console.error('Error submitting entry:', error);
            alert('Something went wrong. Please check your connection or try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#FFFCF5] p-8 rounded-sm w-full max-w-lg shadow-2xl border-2 border-[#EAE0D5] relative"
        >
            {/* Decorative tape element */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#E6D5B8]/40 rotate-1 backdrop-blur-sm transform skew-x-12" />

            <h2 className="text-3xl font-hand font-bold text-stone-700 mb-8 text-center">
                {type === 'MEMORY' ? 'Review 2025' : 'Wish for 2026'}
            </h2>

            <div className="flex bg-[#EFE9E0] rounded-full p-1 mb-6">
                <button
                    onClick={() => setType('MEMORY')}
                    className={`flex-1 py-2 rounded-full transition-all text-sm font-bold tracking-wide ${type === 'MEMORY' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                        }`}
                >
                    2025 Memory
                </button>
                <button
                    onClick={() => setType('WISH')}
                    className={`flex-1 py-2 rounded-full transition-all text-sm font-bold tracking-wide ${type === 'WISH' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                        }`}
                >
                    2026 Wish
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={type === 'MEMORY' ? "What's a core memory from this year?" : "What do you hope for next year?"}
                    className="w-full h-48 bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] bg-[#FFF] border border-[#EAE0D5] rounded-md p-6 text-xl text-stone-700 placeholder-stone-300 font-hand leading-10 focus:outline-none focus:ring-2 focus:ring-[#E6D5B8] resize-none shadow-inner"
                />

                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors font-sans font-medium"
                    >
                        Close
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className="flex-1 py-3 rounded-full bg-[#E6B8B8] text-white font-bold tracking-wide hover:bg-[#DFA5A5] transition-colors disabled:opacity-50 shadow-md transform hover:-translate-y-0.5"
                    >
                        {isSubmitting ? 'Floating...' : 'Send to Sky'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
