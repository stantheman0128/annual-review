'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Reaction {
    id: string;
    emoji: string;
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
    onClick: () => void;
}

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
    onClick,
}: FloatingCardProps) {
    // Randomize initial position and duration
    const randomX = useMemo(() => Math.random() * 80 + 10, []);
    const duration = useMemo(() => Math.random() * 15 + 20, []); // 20-35s
    const delay = useMemo(() => Math.random() * 2, []); // 0-2s quick start
    const rotate = useMemo(() => Math.random() * 6 - 3, []);

    const isMemory = type === 'MEMORY';
    const isLocked = lockedUntil && new Date(lockedUntil) > new Date();

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
            className={`absolute w-56 p-3 rounded-sm shadow-md pointer-events-auto cursor-pointer font-hand tracking-wider
                ${isMemory
                    ? 'bg-[#F0F4F8] text-slate-700 border-t-4 border-blue-200/50'
                    : 'bg-[#FFF9EA] text-stone-700 border-t-4 border-pink-200/50'
                } transition-transform duration-300 hover:scale-105`}
        >
            {/* Header: Year + Author */}
            <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-40">
                    {year} {isMemory ? 'Memory' : 'Wish'}
                </div>
                <div className="text-[10px] font-sans text-stone-400">
                    {author}
                </div>
            </div>

            {/* Content Preview */}
            {isLocked ? (
                <div className="flex items-center justify-center py-4 opacity-60">
                    <span className="text-2xl">🔒</span>
                </div>
            ) : (
                <>
                    {imageUrl && (
                        <div className="mb-2 w-full h-20 overflow-hidden rounded opacity-80">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <p className="text-base leading-relaxed line-clamp-3">{content}</p>
                </>
            )}

            {/* Reaction Count Badge */}
            {reactions.length > 0 && (
                <div className="mt-2 text-xs opacity-50">
                    {reactions.length} ❤️
                </div>
            )}
        </motion.div>
    );
}
