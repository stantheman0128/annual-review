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
    index: number;
    year: number;
    imageUrl?: string;
    lockedUntil?: string;
    reactions?: Reaction[];
    comments?: Comment[];
    onClick: () => void;
}

// User theme colors
const USER_THEMES: Record<string, { bg: string; border: string }> = {
    '小瀚': { bg: 'bg-blue-50', border: 'border-blue-400' },
    '巧巧': { bg: 'bg-pink-50', border: 'border-pink-400' },
};

const FALLBACK_THEMES = [
    { bg: 'bg-purple-50', border: 'border-purple-400' },
    { bg: 'bg-green-50', border: 'border-green-400' },
    { bg: 'bg-orange-50', border: 'border-orange-400' },
    { bg: 'bg-cyan-50', border: 'border-cyan-400' },
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
    index,
    year,
    imageUrl,
    lockedUntil,
    reactions = [],
    comments = [],
    onClick,
}: FloatingCardProps) {
    const randomX = useMemo(() => Math.random() * 80 + 10, []);
    const duration = useMemo(() => Math.random() * 20 + 30, []); // 30-50s slower drift
    const delay = useMemo(() => Math.random() * 0.5, []);
    const rotate = useMemo(() => Math.random() * 6 - 3, []);

    const isMemory = type === 'MEMORY';
    const isLocked = lockedUntil && new Date(lockedUntil) > new Date();
    const theme = getUserTheme(author);

    // Memory: user theme background + dark border
    // Wish: pale yellow background + user theme dark border
    const cardBg = isMemory ? theme.bg : 'bg-[#FFF9EA]';
    const cardBorder = theme.border;

    // First comment preview (truncated)
    const firstComment = comments.length > 0 ? comments[0] : null;

    return (
        <motion.div
            initial={{
                y: isMemory ? '-20vh' : '120vh',
                x: `${randomX}vw`,
                opacity: 0,
                rotate: rotate
            }}
            animate={{
                y: isMemory ? '120vh' : '-20vh',
                opacity: [0, 1, 1, 0],
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                ease: 'linear',
                delay: delay
            }}
            onClick={onClick}
            className={`absolute w-52 p-2.5 rounded-sm shadow-md pointer-events-auto cursor-pointer font-hand tracking-wider
                ${cardBg} text-stone-700 border-t-4 ${cardBorder}
                transition-transform duration-300 hover:scale-105`}
        >
            {/* Header: Year only */}
            <div className="text-[9px] font-sans font-bold uppercase tracking-widest opacity-40 mb-1.5">
                {year} {isMemory ? 'Memory' : 'Wish'}
            </div>

            {/* Content Preview */}
            {isLocked ? (
                <div className="flex items-center justify-center py-3 opacity-60">
                    <span className="text-xl">🔒</span>
                </div>
            ) : (
                <>
                    {imageUrl && (
                        <div className="mb-1.5 w-full h-16 overflow-hidden rounded opacity-80">
                            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <p className="text-sm leading-relaxed line-clamp-3">{content}</p>
                </>
            )}

            {/* Reactions - compact emoji badges */}
            {reactions.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-0.5">
                    {reactions.slice(0, 3).map(r => {
                        const rTheme = getUserTheme(r.user.name);
                        return (
                            <span
                                key={r.id}
                                className={`text-[11px] px-1 rounded ${rTheme.bg}`}
                            >
                                {r.emoji}
                            </span>
                        );
                    })}
                    {reactions.length > 3 && (
                        <span className="text-[10px] text-stone-400">+{reactions.length - 3}</span>
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
