import { motion } from 'framer-motion';
import { useState } from 'react';

interface UserSelectProps {
    onSelect: (user: string) => void;
}

const USERS = [
    { name: '小瀚', emoji: '🧑‍💻', color: 'bg-blue-50', border: 'border-blue-200' },
    { name: '巧巧', emoji: '👩‍🎨', color: 'bg-pink-50', border: 'border-pink-200' },
];

export default function UserSelect({ onSelect }: UserSelectProps) {
    const [hoveredUser, setHoveredUser] = useState<string | null>(null);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] relative">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl font-hand font-bold text-stone-700 mb-16 tracking-wider relative z-10"
            >
                Who are you?
            </motion.h1>

            <div className="flex gap-16 relative z-10">
                {USERS.map((user, index) => (
                    <div key={user.name} className="relative group">
                        {/* Particles (Only visible on hover) */}
                        {hoveredUser === user.name && (
                            <div className="absolute inset-0 pointer-events-none">
                                {[...Array(6)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                                        animate={{ opacity: [0, 1, 0], scale: 1, x: (Math.random() - 0.5) * 100, y: -100 - Math.random() * 50 }}
                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                                        className="absolute top-1/2 left-1/2 text-xl"
                                    >
                                        {['❤️', '✨', '🌸'][i % 3]}
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? -3 : 3 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onMouseEnter={() => setHoveredUser(user.name)}
                            onMouseLeave={() => setHoveredUser(null)}
                            onClick={() => onSelect(user.name)}
                            className={`w-48 h-48 rounded-full ${user.color} border-4 ${user.border} flex flex-col items-center justify-center text-stone-600 hover:bg-white transition-all shadow-[8px_8px_0px_rgba(0,0,0,0.05)] hover:shadow-[12px_12px_0px_rgba(0,0,0,0.05)] group`}
                        >
                            <span className="text-6xl mb-2 filter grayscale group-hover:grayscale-0 transition-all duration-300">
                                {user.emoji}
                            </span>
                            <span className="text-3xl font-hand font-bold">
                                {user.name}
                            </span>
                        </motion.button>
                    </div>
                ))}
            </div>
        </div>
    );
}
