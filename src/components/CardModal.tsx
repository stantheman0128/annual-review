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
    isPinned?: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onToggleReact: (emoji: string, hasReacted: boolean) => void;
    onAddComment: (content: string) => void;
    onDeleteComment: (commentId: string) => void;
    onTogglePin?: () => void;
}

// User theme colors
const USER_THEMES: Record<string, { bg: string; border: string; ring: string; commentBg: string; avatar: string }> = {
    '小瀚': { bg: 'bg-blue-50', border: 'border-blue-400', ring: 'ring-blue-400', commentBg: 'bg-blue-100/60', avatar: 'bg-blue-400' },
    '巧巧': { bg: 'bg-pink-50', border: 'border-pink-400', ring: 'ring-pink-400', commentBg: 'bg-pink-100/60', avatar: 'bg-pink-400' },
};

const FALLBACK_THEMES = [
    { bg: 'bg-purple-50', border: 'border-purple-400', ring: 'ring-purple-400', commentBg: 'bg-purple-100/60', avatar: 'bg-purple-400' },
    { bg: 'bg-green-50', border: 'border-green-400', ring: 'ring-green-400', commentBg: 'bg-green-100/60', avatar: 'bg-green-400' },
];

const getUserTheme = (userName: string) => {
    if (USER_THEMES[userName]) return USER_THEMES[userName];
    const hash = userName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FALLBACK_THEMES[hash % FALLBACK_THEMES.length];
};

const ALL_EMOJIS = ['❤️', '🥹', '😆', '🤗', '🥺', '💪', '😮', '🎉', '🔥', '👏', '💯', '🙌', '😍', '💕', '🤔'];

export default function CardModal({
    entry, currentUser, isPinned = false,
    onClose, onEdit, onDelete, onToggleReact, onAddComment, onDeleteComment, onTogglePin
}: CardModalProps) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [commentText, setCommentText] = useState('');

    const isMemory = entry.type === 'MEMORY';
    const isLocked = entry.lockedUntil && new Date(entry.lockedUntil) > new Date();
    const isOwner = entry.user.name === currentUser;

    const authorTheme = getUserTheme(entry.user.name);
    const currentUserTheme = getUserTheme(currentUser);
    const myReaction = entry.reactions.find(r => r.user.name === currentUser)?.emoji || null;

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

    const modalBg = isMemory ? authorTheme.bg : 'bg-[#FFF9EA]';
    const borderColor = authorTheme.border;

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    // Instagram-style icon button classes
    const iconBtnClass = "w-9 h-9 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 transition-all duration-200 cursor-pointer";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-md p-5 rounded-xl shadow-2xl font-hand tracking-wider ${modalBg} text-stone-700 border-t-4 ${borderColor}`}
            >
                {/* Top buttons: Pin + Close - larger hitbox */}
                <div className="absolute top-2 right-2 flex items-center space-x-1 z-10">
                    {onTogglePin && (
                        <motion.button
                            onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
                            whileTap={{ scale: 0.9 }}
                            className={iconBtnClass}
                            title={isPinned ? 'Unpin' : 'Pin'}
                        >
                            {/* SVG Pin icon - outline or filled */}
                            <svg
                                width="18" height="18" viewBox="0 0 24 24"
                                fill={isPinned ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                                className={`transition-all duration-200 ${isPinned ? 'text-stone-600' : ''}`}
                            >
                                <path d="M12 2L12 12M12 12L8 8M12 12L16 8M5 21L12 14L19 21" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </motion.button>
                    )}
                    <motion.button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={iconBtnClass}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                        </svg>
                    </motion.button>
                </div>

                {/* Header with React button on the right of first line */}
                <div className="flex items-center justify-between mb-3 pr-20">
                    <div className="text-xs font-sans font-bold uppercase tracking-widest opacity-50">
                        {entry.year} {isMemory ? 'Memory' : 'Wish'}
                    </div>

                    {/* React button - Instagram style */}
                    {!isLocked && (
                        <div className="relative">
                            <motion.button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center space-x-1 px-2.5 py-1 rounded-full border border-stone-200 text-xs text-stone-500 hover:bg-stone-100 transition-all"
                            >
                                <span>{myReaction || '♡'}</span>
                                <span>React</span>
                            </motion.button>

                            {/* Emoji picker dropdown */}
                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                        className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg p-2 border border-stone-200 z-20"
                                    >
                                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                                            {ALL_EMOJIS.map(emoji => {
                                                const isSelected = myReaction === emoji;
                                                return (
                                                    <button
                                                        key={emoji}
                                                        onClick={() => handleEmojiClick(emoji)}
                                                        className={`text-lg p-1.5 rounded-full transition-all
                                                            ${isSelected
                                                                ? `scale-110 ring-2 ${currentUserTheme.ring} ${currentUserTheme.bg}`
                                                                : 'hover:scale-110 hover:bg-stone-100'
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

                {/* Content - preserve line breaks */}
                {isLocked ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-60">
                        <span className="text-4xl mb-2">🔒</span>
                        <p className="text-sm font-sans">Locked until New Year</p>
                    </div>
                ) : (
                    <>
                        {entry.imageUrl && (
                            <div className="mb-3 p-1.5 bg-white shadow-md rotate-1 inline-block">
                                <img src={entry.imageUrl} alt="Memory" className="max-w-full max-h-56 object-contain" />
                            </div>
                        )}
                        <p className="text-xl leading-relaxed whitespace-pre-wrap mb-3">{entry.content}</p>
                    </>
                )}

                {/* Reactions display - show who reacted */}
                {!isLocked && entry.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3 pt-3 border-t border-black/10">
                        {entry.reactions.map(r => {
                            const rTheme = getUserTheme(r.user.name);
                            return (
                                <span
                                    key={r.id}
                                    className={`inline-flex items-center text-sm px-2 py-0.5 rounded-full ${rTheme.bg} ring-1 ${rTheme.ring}`}
                                    title={r.user.name}
                                >
                                    <span className={`w-4 h-4 rounded-full ${rTheme.avatar} text-white text-[8px] flex items-center justify-center mr-1`}>
                                        {r.user.name.charAt(0)}
                                    </span>
                                    {r.emoji}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Comments Section */}
                {!isLocked && (
                    <div className="pt-3 border-t border-black/10">
                        <div className="space-y-2 mb-3 max-h-36 overflow-y-auto">
                            {entry.comments && entry.comments.map(comment => {
                                const cTheme = getUserTheme(comment.user.name);
                                return (
                                    <div key={comment.id} className="group flex items-start space-x-2">
                                        <div
                                            className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold ${cTheme.avatar}`}
                                            title={comment.user.name}
                                        >
                                            {comment.user.name.charAt(0)}
                                        </div>
                                        <div className={`flex-1 rounded-lg px-2.5 py-1.5 text-sm ${cTheme.commentBg} relative`}>
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <span className="text-[10px] font-bold text-stone-600">{comment.user.name}</span>
                                                <span className="text-[9px] text-stone-400">{formatTime(comment.createdAt)}</span>
                                            </div>
                                            <p className="text-stone-700 whitespace-pre-wrap leading-snug">{comment.content}</p>
                                            {comment.user.name === currentUser && (
                                                <button
                                                    onClick={() => onDeleteComment(comment.id)}
                                                    className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-all rounded-full hover:bg-red-50"
                                                >
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Comment Input */}
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                                placeholder="Add a comment..."
                                className="flex-1 bg-white/80 border border-stone-200 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-stone-300 placeholder-stone-300"
                            />
                            <motion.button
                                onClick={handleSendComment}
                                disabled={!commentText.trim()}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-1.5 rounded-full bg-stone-700 text-white text-sm hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Send
                            </motion.button>
                        </div>
                    </div>
                )}

                {/* Action Buttons - Instagram style, gray, no emoji */}
                {!isLocked && isOwner && (
                    <div className="mt-4 flex space-x-2">
                        <motion.button
                            onClick={onEdit}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 py-2 rounded-full border border-stone-300 text-stone-500 hover:bg-stone-100 transition-all font-sans text-xs"
                        >
                            Edit
                        </motion.button>
                        <motion.button
                            onClick={onDelete}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 py-2 rounded-full border border-stone-300 text-stone-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all font-sans text-xs"
                        >
                            Delete
                        </motion.button>
                    </div>
                )}

                {/* Not owner hint */}
                {!isLocked && !isOwner && (
                    <div className="mt-3 text-center text-xs text-stone-400 font-sans">
                        {entry.user.name}&apos;s note
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
