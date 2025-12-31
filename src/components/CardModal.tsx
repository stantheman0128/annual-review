'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Reaction {
    id: string;
    emoji: string;
    user: { name: string };
}

interface Comment {
    id: string;
    content: string;
    createdAt: string;
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
        comments: Comment[];
        user: { name: string };
    };
    currentUser: string;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onToggleReact: (emoji: string, hasReacted: boolean) => void;
    onAddComment: (content: string) => void;
    onDeleteComment: (commentId: string) => void;
}

// User colors
const USER_COLORS: Record<string, string> = {
    '小瀚': 'ring-blue-400 bg-blue-50',
    '巧巧': 'ring-pink-400 bg-pink-50',
};

// Default emojis
const DEFAULT_EMOJIS = ['❤️', '🥹', '😆', '🤗', '🥺', '💪', '😮'];

// Extended emoji picker options
const EXTENDED_EMOJIS = ['🎉', '🔥', '👏', '💯', '🙌', '😍', '🤩', '💕', '🌟', '🎊', '💖', '😢', '😭', '🤔', '👀'];

export default function CardModal({ entry, currentUser, onClose, onEdit, onDelete, onToggleReact, onAddComment, onDeleteComment }: CardModalProps) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [commentText, setCommentText] = useState('');

    const isMemory = entry.type === 'MEMORY';
    const isLocked = entry.lockedUntil && new Date(entry.lockedUntil) > new Date();
    const isOwner = entry.user.name === currentUser;

    // Find current user's reaction (only one allowed)
    const myReaction = entry.reactions.find(r => r.user.name === currentUser)?.emoji || null;

    // Group reactions by emoji with user info
    const reactionsByEmoji: Record<string, string[]> = {};
    entry.reactions.forEach(r => {
        if (!reactionsByEmoji[r.emoji]) {
            reactionsByEmoji[r.emoji] = [];
        }
        reactionsByEmoji[r.emoji].push(r.user.name);
    });

    const handleEmojiClick = (emoji: string) => {
        const hasReacted = myReaction === emoji;
        onToggleReact(emoji, hasReacted);
        setShowEmojiPicker(false);
    };

    const handleSendComment = () => {
        if (!commentText.trim()) return;
        onAddComment(commentText);
        setCommentText('');
    };

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
                {/* Close Button */}
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
                        <p className="text-2xl leading-relaxed whitespace-pre-wrap mb-4">{entry.content}</p>
                    </>
                )}

                {/* Reactions Bar */}
                <div className="pt-4 border-t border-black/10">
                    {/* Existing Reactions with user colors */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {Object.entries(reactionsByEmoji).map(([emoji, users]) => (
                            <div key={emoji} className="flex items-center bg-white/70 px-2 py-1 rounded-full border border-black/5 shadow-sm">
                                <span className="text-lg mr-1">{emoji}</span>
                                <div className="flex -space-x-1">
                                    {users.map(userName => (
                                        <span
                                            key={userName}
                                            className={`w-5 h-5 rounded-full ring-2 flex items-center justify-center text-[10px] font-sans font-bold
                                                ${USER_COLORS[userName] || 'ring-gray-300 bg-gray-100'}`}
                                            title={userName}
                                        >
                                            {userName.charAt(0)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Emoji Selector */}
                    {!isLocked && (
                        <div className="relative">
                            <div className="flex flex-wrap gap-1 items-center">
                                {DEFAULT_EMOJIS.map(emoji => {
                                    const isSelected = myReaction === emoji;
                                    return (
                                        <button
                                            key={emoji}
                                            onClick={() => handleEmojiClick(emoji)}
                                            className={`text-xl transition-all p-2 rounded-full
                                                ${isSelected
                                                    ? `scale-110 ring-2 ${USER_COLORS[currentUser] || 'ring-gray-300 bg-gray-100'}`
                                                    : 'hover:scale-125 hover:bg-white/50'
                                                }`}
                                        >
                                            {emoji}
                                        </button>
                                    );
                                })}

                                {/* + Button for more emojis */}
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="text-xl p-2 rounded-full hover:bg-white/50 transition-all hover:scale-110 text-stone-400"
                                >
                                    ＋
                                </button>
                            </div>

                            {/* Extended Emoji Picker */}
                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-lg shadow-lg p-3 border border-stone-200"
                                    >
                                        <div className="flex flex-wrap gap-1">
                                            {EXTENDED_EMOJIS.map(emoji => {
                                                const isSelected = myReaction === emoji;
                                                return (
                                                    <button
                                                        key={emoji}
                                                        onClick={() => handleEmojiClick(emoji)}
                                                        className={`text-xl p-2 rounded-full transition-all
                                                            ${isSelected
                                                                ? `scale-110 ring-2 ${USER_COLORS[currentUser] || 'ring-gray-300'}`
                                                                : 'hover:scale-125 hover:bg-stone-100'
                                                            }`}
                                                    >
                                                        {emoji}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                {!isLocked && (
                    <div className="mt-4 pt-4 border-t border-black/10">
                        <h3 className="text-sm font-sans font-bold text-stone-500 mb-2 uppercase tracking-wide opacity-50">Comments</h3>

                        {/* Comments List */}
                        <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                            {(!entry.comments || entry.comments.length === 0) && (
                                <p className="text-xs text-stone-400 italic">No comments yet. Say something nice!</p>
                            )}

                            {entry.comments && entry.comments.map(comment => (
                                <div key={comment.id} className="group flex items-start space-x-2">
                                    <div
                                        className={`w-6 h-6 rounded-full ring-2 flex-shrink-0 flex items-center justify-center text-[10px] font-sans font-bold mt-1
                                        ${USER_COLORS[comment.user.name] || 'ring-gray-300 bg-gray-100'}`}
                                        title={comment.user.name}
                                    >
                                        {comment.user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 bg-white/50 rounded-lg p-2 tex-sm relative">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="font-bold text-xs text-stone-600">{comment.user.name}</span>
                                            <span className="text-[10px] text-stone-400">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-stone-700 text-sm whitespace-pre-wrap leading-tight">{comment.content}</p>

                                        {/* Delete Comment Button (Only Owner) */}
                                        {comment.user.name === currentUser && (
                                            <button
                                                onClick={() => onDeleteComment(comment.id)}
                                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-opacity"
                                                title="Delete comment"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Comment Input */}
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                placeholder="Add a comment..."
                                className="flex-1 bg-white/80 border border-stone-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 placeholder-stone-400"
                            />
                            <button
                                onClick={handleSendComment}
                                disabled={!commentText.trim()}
                                className="w-10 h-10 rounded-full bg-stone-800 text-white flex items-center justify-center hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                )}

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
