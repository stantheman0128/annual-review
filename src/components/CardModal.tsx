'use client';

import { motion } from 'framer-motion';

interface Reaction {
    id: string;
    emoji: string;
    user: { name: string };
}

interface CardModalProps {
    entry: {
        id: string;
        type: 'MEMORY' | 'WISH';
        content: string;
        year: number;
        imageUrl?: string;
        lockedUntil?: string;
        reactions: Reaction[];
        user: { name: string };
    };
    currentUser: string;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onToggleReact: (emoji: string, hasReacted: boolean) => void;
}

export default function CardModal({ entry, currentUser, onClose, onEdit, onDelete, onToggleReact }: CardModalProps) {
    const isMemory = entry.type === 'MEMORY';
    const isLocked = entry.lockedUntil && new Date(entry.lockedUntil) > new Date();
    const isOwner = entry.user.name === currentUser;

    // Count reactions and check if current user reacted
    const reactionCounts: Record<string, number> = {};
    const myReactions: Set<string> = new Set();
    entry.reactions.forEach(r => {
        reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
        if (r.user.name === currentUser) {
            myReactions.add(r.emoji);
        }
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-md p-6 rounded-lg shadow-2xl font-hand tracking-wider
                    ${isMemory
                        ? 'bg-[#F0F4F8] text-slate-700 border-t-8 border-blue-300'
                        : 'bg-[#FFF9EA] text-stone-700 border-t-8 border-pink-300'
                    }`}
            >
                {/* Close Button - Large hitbox */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 w-12 h-12 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-200/50 rounded-full text-2xl transition-all hover:scale-110"
                >
                    ✕
                </button>

                {/* Header: Year + Author */}
                <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-sans font-bold uppercase tracking-widest opacity-50">
                        {entry.year} {isMemory ? 'Memory' : 'Wish'}
                    </div>
                    <div className="text-sm font-sans text-stone-500">
                        by <span className="font-medium text-stone-600">{entry.user.name}</span>
                    </div>
                </div>

                {/* Content */}
                {isLocked ? (
                    <div className="flex flex-col items-center justify-center py-12 opacity-60">
                        <span className="text-5xl mb-3">🔒</span>
                        <p className="text-lg font-sans">Locked until New Year</p>
                    </div>
                ) : (
                    <>
                        {/* Photo */}
                        {entry.imageUrl && (
                            <div className="mb-4 p-2 bg-white shadow-md rotate-1 inline-block">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={entry.imageUrl} alt="Memory" className="max-w-full max-h-64 object-contain" />
                            </div>
                        )}
                        <p className="text-2xl leading-relaxed whitespace-pre-wrap mb-6">{entry.content}</p>
                    </>
                )}

                {/* Reactions Bar */}
                <div className="pt-4 border-t border-black/10 flex flex-wrap gap-2 items-center">
                    {/* Existing Reactions */}
                    {Object.entries(reactionCounts).map(([emoji, count]) => (
                        <span key={emoji} className="text-sm bg-white/70 px-2 py-1 rounded-full border border-black/5 shadow-sm">
                            {emoji} {count}
                        </span>
                    ))}

                    {/* Toggle Reaction Buttons */}
                    {!isLocked && (
                        <div className="flex space-x-1 ml-auto">
                            {['❤️', '🤗', '😆', '🥹'].map(emoji => {
                                const hasReacted = myReactions.has(emoji);
                                return (
                                    <button
                                        key={emoji}
                                        onClick={() => onToggleReact(emoji, hasReacted)}
                                        className={`text-xl transition-all p-2 rounded-full
                                            ${hasReacted
                                                ? 'bg-pink-100 scale-110 ring-2 ring-pink-300'
                                                : 'hover:scale-125 hover:bg-white/50'
                                            }`}
                                    >
                                        {emoji}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Action Buttons - Only show if owner */}
                {!isLocked && isOwner && (
                    <div className="mt-6 flex space-x-3">
                        <button
                            onClick={onEdit}
                            className="flex-1 py-3 rounded-full border-2 border-stone-300 text-stone-600 hover:bg-stone-100 transition-all font-sans text-sm font-medium hover:-translate-y-1 hover:shadow-md"
                        >
                            ✏️ Edit
                        </button>
                        <button
                            onClick={onDelete}
                            className="flex-1 py-3 rounded-full border-2 border-red-200 text-red-400 hover:bg-red-50 hover:text-red-500 transition-all font-sans text-sm font-medium hover:-translate-y-1 hover:shadow-md"
                        >
                            🗑 Delete
                        </button>
                    </div>
                )}

                {/* Not owner hint */}
                {!isLocked && !isOwner && (
                    <div className="mt-4 text-center text-sm text-stone-400 font-sans">
                        This is {entry.user.name}&apos;s note ✨
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
