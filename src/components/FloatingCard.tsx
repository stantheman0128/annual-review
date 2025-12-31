import { motion, AnimatePresence } from 'framer-motion';
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
    const [isExpanded, setIsExpanded] = useState(false);

    // Randomize initial position and duration slightly for natural feel
    const randomX = useMemo(() => Math.random() * 80 + 10, []);
    const duration = useMemo(() => Math.random() * 40 + 30, []); // SLOWER: 30-70s
    const delay = useMemo(() => Math.random() * 8, []);
    const rotate = useMemo(() => Math.random() * 6 - 3, []);

    const isMemory = type === 'MEMORY';
    const isLocked = lockedUntil && new Date(lockedUntil) > new Date();

    const reactionCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        reactions.forEach(r => {
            counts[r.emoji] = (counts[r.emoji] || 0) + 1;
        });
        return counts;
    }, [reactions]);

    const handleCardClick = () => {
        setIsExpanded(true);
    };

    return (
        <>
            {/* Floating Card (Small) */}
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
                onClick={handleCardClick}
                className={`absolute w-56 p-3 rounded-sm shadow-md pointer-events-auto cursor-pointer font-hand tracking-wider
                    ${isMemory
                        ? 'bg-[#F0F4F8] text-slate-700 border-t-4 border-blue-200/50'
                        : 'bg-[#FFF9EA] text-stone-700 border-t-4 border-pink-200/50'
                    } transition-transform duration-300 hover:scale-105`}
            >
                {/* Header Year */}
                <div className="text-xs font-sans font-bold uppercase tracking-widest opacity-40 mb-2 text-right">
                    {year} {isMemory ? 'Memory' : 'Wish'}
                </div>

                {/* Content Preview */}
                {isLocked ? (
                    <div className="flex items-center justify-center py-4 opacity-60">
                        <span className="text-2xl">🔒</span>
                    </div>
                ) : (
                    <p className="text-base leading-relaxed line-clamp-3">{content}</p>
                )}

                {/* Reaction Count Badge */}
                {reactions.length > 0 && (
                    <div className="mt-2 text-xs opacity-50">
                        {reactions.length} reaction{reactions.length > 1 ? 's' : ''}
                    </div>
                )}
            </motion.div>

            {/* Expanded Card Modal */}
            <AnimatePresence>
                {isExpanded && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsExpanded(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full max-w-md p-6 rounded-sm shadow-2xl font-hand tracking-wider relative
                                ${isMemory
                                    ? 'bg-[#F0F4F8] text-slate-700 border-t-8 border-blue-200'
                                    : 'bg-[#FFF9EA] text-stone-700 border-t-8 border-pink-200'
                                }`}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 text-xl"
                            >
                                ✕
                            </button>

                            {/* Header Year */}
                            <div className="text-xs font-sans font-bold uppercase tracking-widest opacity-40 mb-4">
                                {year} {isMemory ? 'Memory' : 'Wish'}
                            </div>

                            {/* Content */}
                            {isLocked ? (
                                <div className="flex flex-col items-center justify-center py-12 opacity-60">
                                    <span className="text-5xl mb-3">🔒</span>
                                    <p className="text-lg font-sans">Locked until New Year</p>
                                </div>
                            ) : (
                                <>
                                    {/* Polaroid Image */}
                                    {imageUrl && (
                                        <div className="mb-4 p-2 bg-white shadow-sm rotate-1">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={imageUrl} alt="Memory" className="w-full object-cover max-h-64 grayscale-[20%] sepia-[20%] contrast-110" />
                                        </div>
                                    )}
                                    <p className="text-2xl leading-relaxed whitespace-pre-wrap mb-6">{content}</p>
                                </>
                            )}

                            {/* Reactions Bar */}
                            <div className="pt-4 border-t border-black/10 flex flex-wrap gap-2 items-center">
                                {/* Existing Reactions */}
                                {Object.entries(reactionCounts).map(([emoji, count]) => (
                                    <span key={emoji} className="text-sm bg-white/70 px-2 py-1 rounded-full border border-black/5">
                                        {emoji} {count}
                                    </span>
                                ))}

                                {/* Add Reaction Buttons */}
                                {!isLocked && (
                                    <div className="flex space-x-2 ml-auto">
                                        {['❤️', '🤗', '😆', '🥹'].map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => onReact(id, emoji)}
                                                className="text-xl hover:scale-125 transition-transform p-1"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {!isLocked && (
                                <div className="mt-6 flex space-x-3">
                                    <button
                                        onClick={() => { setIsExpanded(false); onEdit(id); }}
                                        className="flex-1 py-2 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors font-sans text-sm"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => { setIsExpanded(false); onDelete(id); }}
                                        className="flex-1 py-2 rounded-full border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors font-sans text-sm"
                                    >
                                        🗑 Delete
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
