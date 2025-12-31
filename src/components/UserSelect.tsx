'use client';

import { motion } from 'framer-motion';

interface UserSelectProps {
    onSelect: (user: string) => void;
}

export default function UserSelect({ onSelect }: UserSelectProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl font-hand font-bold text-stone-700 mb-12 tracking-wider"
            >
                Who are you?
            </motion.h1>

            <div className="flex space-x-12">
                {['小瀚', '巧巧'].map((user, index) => (
                    <motion.button
                        key={user}
                        whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? -3 : 3 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => onSelect(user)}
                        className="w-40 h-40 rounded-full bg-[#FFF9EA] border-4 border-[#E6D5B8] flex items-center justify-center text-3xl font-hand text-stone-600 hover:bg-white hover:border-[#DFA5A5] hover:text-[#DFA5A5] transition-all shadow-[8px_8px_0px_rgba(230,213,184,0.5)]"
                    >
                        {user}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
