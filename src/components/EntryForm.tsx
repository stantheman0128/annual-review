import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface EntryFormProps {
    user: string;
    initialData?: any;
    onAdd: (entry: any) => Promise<void>;
    onCancel: () => void;
}

export default function EntryForm({ user, initialData, onAdd, onCancel }: EntryFormProps) {
    const [content, setContent] = useState(initialData?.content || '');
    const [type, setType] = useState<'MEMORY' | 'WISH'>(initialData?.type || 'MEMORY');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
    const [isLocked, setIsLocked] = useState(!!initialData?.lockedUntil);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            let imageUrl = null;

            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                const uploadData = await uploadRes.json();
                if (uploadData.success && uploadData.data?.url) {
                    imageUrl = uploadData.data.url;
                } else {
                    console.error('Upload failed:', uploadData.error);
                }
            }

            const lockedUntilDate = isLocked ? '2026-01-01T00:00:00.000Z' : null;

            await onAdd({
                user,
                type,
                content,
                year: type === 'MEMORY' ? 2025 : 2026,
                imageUrl,
                lockedUntil: lockedUntilDate
            });

            setContent('');
            setImageFile(null);
            setImagePreview(null);
        } catch (error) {
            console.error('Error submitting entry:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Common button style
    const iconBtnClass = "w-9 h-9 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 transition-all duration-200";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#FFFCF5] p-6 md:p-8 rounded-xl w-full max-w-lg shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto"
        >
            {/* Top right buttons: Add Photo + Close */}
            <div className="absolute top-3 right-3 flex items-center space-x-1">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                />
                <motion.button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={iconBtnClass}
                    title="Add photo"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v8M8 12h8" strokeLinecap="round" />
                    </svg>
                </motion.button>
                <motion.button
                    type="button"
                    onClick={onCancel}
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.05)' }}
                    whileTap={{ scale: 0.9 }}
                    className={iconBtnClass}
                    title="Close"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                </motion.button>
            </div>

            <h2 className="text-2xl font-hand font-bold text-stone-700 mb-5 text-center">
                {type === 'MEMORY' ? 'Review 2025' : 'Wish for 2026'}
            </h2>

            {/* Type Toggle */}
            <div className="flex bg-stone-100 rounded-full p-1 mb-5">
                <button
                    type="button"
                    onClick={() => setType('MEMORY')}
                    className={`flex-1 py-2 rounded-full transition-all text-sm font-medium ${type === 'MEMORY' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    2025 Memory
                </button>
                <button
                    type="button"
                    onClick={() => setType('WISH')}
                    className={`flex-1 py-2 rounded-full transition-all text-sm font-medium ${type === 'WISH' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    2026 Wish
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Content Area - Notebook style */}
                <div className="relative">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={type === 'MEMORY' ? "What's a core memory from this year?" : "What do you hope for next year?"}
                        className="w-full h-40 bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] bg-white border border-[#EAE0D5] rounded-md p-4 text-xl text-stone-700 placeholder-stone-300 font-hand leading-9 focus:outline-none focus:ring-2 focus:ring-[#E6D5B8] resize-none shadow-inner"
                    />
                </div>

                {/* Photo Preview */}
                {imagePreview && (
                    <div className="relative w-full h-28 bg-stone-100 rounded-lg overflow-hidden group">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <motion.button
                            type="button"
                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                            </svg>
                        </motion.button>
                    </div>
                )}

                {/* Lock Toggle (Only for Wishes) */}
                {type === 'WISH' && (
                    <div className="flex items-center justify-between px-1">
                        <span className="text-sm text-stone-500">Lock until 2026?</span>
                        <button
                            type="button"
                            onClick={() => setIsLocked(!isLocked)}
                            className={`w-10 h-6 rounded-full flex items-center p-0.5 duration-300 transition-colors ${isLocked ? 'bg-stone-600' : 'bg-stone-200'}`}
                        >
                            <motion.div
                                className="bg-white w-5 h-5 rounded-full shadow-md"
                                animate={{ x: isLocked ? 16 : 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                    <motion.button
                        type="button"
                        onClick={onCancel}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-3 rounded-full border border-stone-300 text-stone-500 hover:bg-stone-100 transition-all font-sans text-sm"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        whileHover={!isSubmitting && content.trim() ? { scale: 1.02, y: -2 } : {}}
                        whileTap={!isSubmitting && content.trim() ? { scale: 0.98 } : {}}
                        className={`flex-1 py-3 rounded-full font-sans text-sm font-medium transition-all
                           ${isSubmitting || !content.trim()
                                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                : 'bg-stone-800 text-white hover:bg-stone-700 shadow-md hover:shadow-lg'
                            }`}
                    >
                        {isSubmitting ? 'Sending...' : (initialData ? 'Update' : 'Send to Sky')}
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
}
