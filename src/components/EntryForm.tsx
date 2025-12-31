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

    // For file input
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

            // 1. Upload image if exists
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
                    // Decide if we should continue or block? Let's continue without image for now but warn
                    // alert("Image upload failed, saving without image.");
                }
            }

            // 2. Calculate lockedUntil
            // If locked, set to 2026-01-01 00:00:00 local time? Or UTC?
            // Simple approach: New Year's Day of the wish year
            const lockedUntilDate = isLocked ? '2026-01-01T00:00:00.000Z' : null;

            // 3. Submit Entry
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

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#FFFCF5] p-6 md:p-8 rounded-sm w-full max-w-lg shadow-2xl border-2 border-[#EAE0D5] relative max-h-[90vh] overflow-y-auto"
        >
            {/* Decorative tape element */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#E6D5B8]/40 rotate-1 backdrop-blur-sm transform skew-x-12" />

            <h2 className="text-3xl font-hand font-bold text-stone-700 mb-6 text-center">
                {type === 'MEMORY' ? 'Review 2025' : 'Wish for 2026'}
            </h2>

            {/* Type Toggle */}
            <div className="flex bg-[#EFE9E0] rounded-full p-1 mb-6">
                <button
                    onClick={() => setType('MEMORY')}
                    className={`flex-1 py-2 rounded-full transition-all text-sm font-bold tracking-wide ${type === 'MEMORY' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    2025 Memory
                </button>
                <button
                    onClick={() => setType('WISH')}
                    className={`flex-1 py-2 rounded-full transition-all text-sm font-bold tracking-wide ${type === 'WISH' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    2026 Wish
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Content Area */}
                <div className="relative">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={type === 'MEMORY' ? "What's a core memory from this year?" : "What do you hope for next year?"}
                        className="w-full h-40 bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] bg-[#FFF] border border-[#EAE0D5] rounded-md p-4 text-xl text-stone-700 placeholder-stone-300 font-hand leading-9 focus:outline-none focus:ring-2 focus:ring-[#E6D5B8] resize-none shadow-inner"
                    />
                </div>

                {/* Controls: Photo & Lock */}
                <div className="flex items-center justify-between px-2">
                    {/* Photo Upload */}
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center space-x-2 text-stone-500 hover:text-stone-700 transition-colors text-sm font-sans"
                        >
                            <span className="text-lg">📷</span>
                            <span>{imagePreview ? 'Change Photo' : 'Add Photo'}</span>
                        </button>
                    </div>

                    {/* Lock Toggle (Only for Wishes) */}
                    {type === 'WISH' && (
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-sans text-stone-500">Lock until 2026?</span>
                            <button
                                type="button"
                                onClick={() => setIsLocked(!isLocked)}
                                className={`w-10 h-6 rounded-full flex items-center p-1 duration-300 transition-colors ${isLocked ? 'bg-[#E6B8B8]' : 'bg-gray-200'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 transition-transform ${isLocked ? 'translate-x-4' : ''}`} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Photo Preview */}
                {imagePreview && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors font-sans font-medium"
                    >
                        Close
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !content.trim()}
                        className={`flex-1 py-3 rounded-full font-bold tracking-wide transition-all flex items-center justify-center space-x-2
                           ${isSubmitting || !content.trim()
                                ? 'bg-stone-300 text-stone-400 cursor-not-allowed shadow-sm'
                                : 'bg-[#E07070] text-white hover:bg-[#D05050] transform hover:-translate-y-0.5 shadow-lg'
                            }`}
                    >
                        {isSubmitting ? (
                            <span>{initialData ? 'Updating...' : 'Flying...'}</span>
                        ) : (
                            <>
                                <span>{initialData ? 'Update Note' : 'Send to Sky'}</span>
                                <span>{initialData ? '✏️' : '✈️'}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
