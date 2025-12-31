import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

interface Reaction {
    id: string;
    emoji: string;
    user: { name: string };
}

interface FloatingCardProps {
    id: string;
    type: 'MEMORY' | 'WISH';
    content: string;
    index: number;
    year: number;
    imageUrl?: string;
    lockedUntil?: string;
    reactions?: Reaction[];
    currentUser: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onReact: (id: string, emoji: string) => void;
}

export default function FloatingCard({
    id,
    type,
    content,
    index,
    year,
    imageUrl,
    lockedUntil,
    reactions = [],
    currentUser,
    onEdit,
    onDelete,
    onReact
}: FloatingCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Randomize initial position and duration slightly for natural feel
    const randomX = useMemo(() => Math.random() * 80 + 10, []);
    const duration = useMemo(() => Math.random() * 20 + 20, []);
    const delay = useMemo(() => Math.random() * 5, []);
    const rotate = useMemo(() => Math.random() * 10 - 5, []); // Softer rotation

    const isMemory = type === 'MEMORY';
    const isLocked = lockedUntil && new Date(lockedUntil) > new Date();

    const reactionCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        reactions.forEach(r => {
            counts[r.emoji] = (counts[r.emoji] || 0) + 1;
        });
        return counts;
    }, [reactions]);

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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            // Pause animation on hover
            style={{ animationPlayState: isHovered ? 'paused' : 'running' }}
            className={`absolute w-72 p-4 rounded-sm shadow-lg pointer-events-auto cursor-pointer font-hand tracking-wider group
                ${isMemory
                    ? 'bg-[#F0F4F8] text-slate-700 border-t-8 border-blue-200/50'
                    : 'bg-[#FFF9EA] text-stone-700 border-t-8 border-pink-200/50'
                } transition-transform duration-300 hover:scale-110 hover:z-50`}
        >
            {/* Context Menu (Edit/Delete) */}
            <div className={`absolute top-2 right-2 flex space-x-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <button onClick={(e) => { e.stopPropagation(); onEdit(id); }} className="p-1 hover:bg-black/5 rounded text-stone-400 hover:text-stone-600" title="Edit">
                    ✎
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(id); }} className="p-1 hover:bg-black/5 rounded text-stone-400 hover:text-red-500" title="Delete">
                    ×
                </button>
            </div>

            {/* Header Year */}
            <div className="text-xs font-sans font-bold uppercase tracking-widest opacity-40 mb-3 block text-right">
                {year} {isMemory ? 'Memory' : 'Wish'}
            </div>

            {/* Content / Locked State */}
            {isLocked ? (
                <div className="flex flex-col items-center justify-center py-8 opacity-60">
                    <span className="text-4xl mb-2">🔒</span>
                    <p className="text-sm font-sans">Locked until New Year</p>
                </div>
            ) : (
                <>
                    {/* Polaroid Image */}
                    {imageUrl && (
                        <div className="mb-4 p-2 bg-white shadow-sm rotate-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imageUrl} alt="Memory" className="w-full h-40 object-cover grayscale-[20%] sepia-[20%] contrast-110" />
                        </div>
                    )}
                    <p className="text-xl leading-relaxed whitespace-pre-wrap">{content}</p>
                </>
            )}

            {/* Reactions Bar */}
            <div className={`mt-4 pt-3 border-t border-black/5 flex flex-wrap gap-2 transition-opacity duration-300 ${isHovered || reactions.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
                {/* Existing Reactions */}
                {Object.entries(reactionCounts).map(([emoji, count]) => (
                    <span key={emoji} className="text-xs bg-white/50 px-1.5 py-0.5 rounded-full border border-black/5">
                        {emoji} {count}
                    </span>
                ))}

                {/* Add Reaction Button (only visible on hover) */}
                {isHovered && !isLocked && (
                    <div className="flex space-x-1 ml-auto">
                        {['❤️', '🤗', '😆', '🥹'].map(emoji => (
                            <button
                                key={emoji}
                                onClick={(e) => { e.stopPropagation(); onReact(id, emoji); }}
                                className="hover:scale-125 transition-transform"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
