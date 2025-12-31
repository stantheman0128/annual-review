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

// All emojis for hover picker
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

    // Format timestamp
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

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
                className={`relative w-full max-w-md p-5 rounded-lg shadow-2xl font-hand tracking-wider ${modalBg} text-stone-700 border-t-8 ${borderColor}`}
            >
                {/* Top buttons: Pin + Close */}
                <div className="absolute top-1 right-1 flex space-x-1">
                    {onTogglePin && (
                        <button
                            onClick={onTogglePin}
                            className={`w-10 h-10 flex items-center justify-center rounded-full text-xl transition-all
                                ${isPinned
                                    ? 'text-amber-500 bg-amber-100'
                                    : 'text-stone-400 hover:text-amber-500 hover:bg-stone-200/50'
                                }`}
                            title={isPinned ? 'Unpin' : 'Pin to sidebar'}
                        >
                            📌
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-200/50 rounded-full text-xl transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Header */}
                <div className="text-xs font-sans font-bold uppercase tracking-widest opacity-50 mb-3">
                    {entry.year} {isMemory ? 'Memory' : 'Wish'}
                </div>

                {/* Content */}
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

                {/* Emoji Reaction - Hover style trigger */}
                {!isLocked && (
                    <div className="relative pt-3 border-t border-black/10">
                        {/* Reaction trigger button */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={`flex items-center space-x-1 px-3 py-1.5 rounded-full border border-stone-200 text-sm transition-all
                                    ${showEmojiPicker ? 'bg-stone-100' : 'hover:bg-stone-50'}`}
                            >
                                <span>{myReaction || '😊'}</span>
                                <span className="text-stone-400 text-xs">React</span>
                            </button>

                            {/* Show existing reactions as colored badges */}
                            {entry.reactions.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {entry.reactions.map(r => {
                                        const rTheme = getUserTheme(r.user.name);
                                        return (
                                            <span
                                                key={r.id}
                                                className={`text-sm px-1.5 py-0.5 rounded-full ${rTheme.bg} ring-1 ${rTheme.ring}`}
                                                title={r.user.name}
                                            >
                                                {r.emoji}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Emoji picker dropdown */}
                        <AnimatePresence>
                            {showEmojiPicker && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg p-2 border border-stone-200 z-10"
                                >
                                    <div className="flex flex-wrap gap-1 max-w-[280px]">
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

                {/* Comments Section - with avatar and timestamp */}
                {!isLocked && (
                    <div className="mt-3 pt-3 border-t border-black/10">
                        <div className="space-y-2 mb-3 max-h-36 overflow-y-auto">
                            {entry.comments && entry.comments.map(comment => {
                                const cTheme = getUserTheme(comment.user.name);
                                return (
                                    <div key={comment.id} className="group flex items-start space-x-2">
                                        {/* Avatar */}
                                        <div
                                            className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold ${cTheme.avatar}`}
                                            title={comment.user.name}
                                        >
                                            {comment.user.name.charAt(0)}
                                        </div>
                                        {/* Comment bubble */}
                                        <div className={`flex-1 rounded-lg px-2 py-1.5 text-sm ${cTheme.commentBg} relative`}>
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <span className="text-[10px] font-bold text-stone-600">{comment.user.name}</span>
                                                <span className="text-[9px] text-stone-400">{formatTime(comment.createdAt)}</span>
                                            </div>
                                            <p className="text-stone-700 whitespace-pre-wrap leading-snug">{comment.content}</p>
                                            {comment.user.name === currentUser && (
                                                <button
                                                    onClick={() => onDeleteComment(comment.id)}
                                                    className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-opacity text-xs"
                                                >
                                                    ✕
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
                                placeholder="Say something..."
                                className="flex-1 bg-white/80 border border-stone-200 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-stone-300 placeholder-stone-300"
                            />
                            <button
                                onClick={handleSendComment}
                                disabled={!commentText.trim()}
                                className="w-8 h-8 rounded-full bg-stone-700 text-white flex items-center justify-center text-sm hover:bg-stone-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                )}

                {/* Action Buttons - only for owner */}
                {!isLocked && isOwner && (
                    <div className="mt-4 flex space-x-2">
                        <button
                            onClick={onEdit}
                            className="flex-1 py-2 rounded-full border border-stone-300 text-stone-500 hover:bg-stone-100 transition-all font-sans text-xs"
                        >
                            ✏️ Edit
                        </button>
                        <button
                            onClick={onDelete}
                            className="flex-1 py-2 rounded-full border border-red-200 text-red-400 hover:bg-red-50 transition-all font-sans text-xs"
                        >
                            🗑 Delete
                        </button>
                    </div>
                )}

                {/* Not owner hint */}
                {!isLocked && !isOwner && (
                    <div className="mt-3 text-center text-xs text-stone-400 font-sans">
                        {entry.user.name}&apos;s note ✨
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
