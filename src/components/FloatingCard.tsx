'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface FloatingCardProps {
    type: 'MEMORY' | 'WISH';
    content: string;
    index: number;
}

export default function FloatingCard({ type, content, index }: FloatingCardProps) {
    // Randomize initial position and duration slightly for natural feel
    const randomX = useMemo(() => Math.random() * 80 + 10, []); // 10% to 90% screen width
    const duration = useMemo(() => Math.random() * 20 + 20, []); // 20-40s duration
    const delay = useMemo(() => Math.random() * 5, []);

    const isMemory = type === 'MEMORY';

    return (
        <motion.div
            initial={{
                y: isMemory ? '-10vh' : '110vh',
                x: `${randomX}vw`,
                opacity: 0,
                rotate: Math.random() * 20 - 10
            }}
            animate={{
                y: isMemory ? '110vh' : '-10vh',
                opacity: [0, 1, 1, 0], // Fade in, stay, fade out
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                ease: 'linear',
                delay: delay
            }}
            className={`absolute w-64 p-6 rounded-sm shadow-md pointer-events-auto cursor-pointer font-hand tracking-wider
        ${isMemory
                    ? 'bg-[#F0F4F8] text-slate-700 rotate-[-1deg] border-t-8 border-blue-200/50' // Cool white for memories
                    : 'bg-[#FFF9EA] text-stone-700 rotate-[1deg] border-t-8 border-pink-200/50' // Warm cream for wishes
                } hover:scale-105 transition-transform duration-300`}
        >
            <div className="text-xs font-sans font-bold uppercase tracking-widest opacity-40 mb-3 block text-right">
                {isMemory ? '2025 Memory' : '2026 Wish'}
            </div>
            <p className="text-xl leading-relaxed">{content}</p>
        </motion.div>
    );
}
