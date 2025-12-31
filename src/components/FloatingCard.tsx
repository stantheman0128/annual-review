'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Reaction {
    id: string;
    emoji: string;
    user: { name: string };
}

interface Comment {
    id: string;
    content: string;
    user: { name: string };
}

interface FloatingCardProps {
    id: string;
    type: 'MEMORY' | 'WISH';
    content: string;
    author: string;
    currentUser: string;
    index: number;
    year: number;
    imageUrl?: string;
    lockedUntil?: string;
    reactions?: Reaction[];
    comments?: Comment[];
    onClick: () => void;
}

// User theme colors
const USER_THEMES: Record<string, { bg: string; border: string; avatar: string; tag: string }> = {
    '小瀚': { bg: 'bg-blue-50', border: 'border-blue-400', avatar: 'bg-blue-400', tag: 'bg-blue-100 text-blue-600' },
    '巧巧': { bg: 'bg-pink-50', border: 'border-pink-400', avatar: 'bg-pink-400', tag: 'bg-pink-100 text-pink-600' },
};

const FALLBACK_THEMES = [
    { bg: 'bg-purple-50', border: 'border-purple-400', avatar: 'bg-purple-400', tag: 'bg-purple-100 text-purple-600' },
    { bg: 'bg-green-50', border: 'border-green-400', avatar: 'bg-green-400', tag: 'bg-green-100 text-green-600' },
];

const getUserTheme = (userName: string) => {
    if (USER_THEMES[userName]) return USER_THEMES[userName];
    const hash = userName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FALLBACK_THEMES[hash % FALLBACK_THEMES.length];
};

export default function FloatingCard({
    id,
    type,
    content,
    author,
    currentUser,
    index,
    year,
    imageUrl,
    lockedUntil,
    reactions = [],
    comments = [],
    onClick,
}: FloatingCardProps) {
    // Improved distribution: divide into more sectors with staggered vertical start
    const sectorCount = 6;
    const sector = index % sectorCount;
    const baseX = (sector * 14) + 5; // 5%, 19%, 33%, 47%, 61%, 75%
    const randomOffset = useMemo(() => Math.random() * 8 - 4, []); // ±4% variance
    const randomX = Math.max(5, Math.min(85, baseX + randomOffset));

    const duration = useMemo(() => Math.random() * 20 + 40, []); // 40-60s very slow
    const delay = useMemo(() => (index % 4) * 0.5 + Math.random() * 0.5, []); // More staggered
    const rotate = useMemo(() => Math.random() * 4 - 2, []); // Less rotation

    const isMemory = type === 'MEMORY';
    const isLocked = lockedUntil && new Date(lockedUntil) > new Date();
    const theme = getUserTheme(author);
    const isOtherUser = author !== currentUser;

    const cardBg = isMemory ? theme.bg : 'bg-[#FFF9EA]';
    const cardBorder = theme.border;
    const firstComment = comments.length > 0 ? comments[0] : null;

    return (
        <motion.div
            initial={{
                y: isMemory ? '-15vh' : '115vh',
                x: `${randomX}vw`,
                opacity: 0,
                rotate: rotate
            }}
            animate={{
                y: isMemory ? '115vh' : '-15vh',
                opacity: [0, 1, 1, 0],
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                ease: 'linear',
                delay: delay
            }}
            onClick={onClick}
            className={`absolute w-48 p-2.5 rounded-lg shadow-md pointer-events-auto cursor-pointer font-hand tracking-wider
                ${cardBg} text-stone-700 border-l-4 ${cardBorder}
                transition-transform duration-300 hover:scale-105 hover:shadow-lg`}
        >
            {/* Header: Author tag (prominent for other user) + Year */}
            <div className="flex items-center justify-between mb-1.5">
                {isOtherUser ? (
                    <span className={`text-[10px] font-sans font-bold px-1.5 py-0.5 rounded ${theme.tag}`}>
                        {author}
                    </span>
                ) : (
                    <span className="text-[9px] font-sans uppercase tracking-widest text-stone-400">
                        {isMemory ? 'Memory' : 'Wish'}
                    </span>
                )}
                <span className="text-[9px] font-sans text-stone-400">{year}</span>
            </div>

            {/* Content Preview - preserve line breaks */}
            {isLocked ? (
                <div className="flex items-center justify-center py-3 opacity-60">
                    <span className="text-xl">🔒</span>
                </div>
            ) : (
                <>
                    {imageUrl && (
                        <div className="mb-1.5 w-full h-14 overflow-hidden rounded opacity-80">
                            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <p className="text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">{content}</p>
                </>
            )}

            {/* Reactions - show who selected which emoji */}
            {reactions.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                    {reactions.slice(0, 4).map(r => {
                        const rTheme = getUserTheme(r.user.name);
                        return (
                            <span
                                key={r.id}
                                className={`inline-flex items-center text-[10px] px-1 py-0.5 rounded ${rTheme.bg}`}
                                title={r.user.name}
                            >
                                <span className={`w-3 h-3 rounded-full ${rTheme.avatar} text-white text-[7px] flex items-center justify-center mr-0.5`}>
                                    {r.user.name.charAt(0)}
                                </span>
                                {r.emoji}
                            </span>
                        );
                    })}
                    {reactions.length > 4 && (
                        <span className="text-[9px] text-stone-400">+{reactions.length - 4}</span>
                    )}
                </div>
            )}

            {/* First Comment Preview */}
            {firstComment && !isLocked && (
                <div className="mt-1.5 pt-1.5 border-t border-stone-200/50">
                    <p className="text-[10px] text-stone-500 line-clamp-1">
                        💬 {firstComment.content}
                    </p>
                </div>
            )}
        </motion.div>
    );
}
