'use client';

import { useState, useEffect } from 'react';
import UserSelect from '@/components/UserSelect';
import FloatingCard from '@/components/FloatingCard';
import EntryForm from '@/components/EntryForm';
import { AnimatePresence, motion } from 'framer-motion';

interface Entry {
  id: string;
  user: { id: string; name: string };
  type: 'MEMORY' | 'WISH';
  content: string;
  year: number;
  imageUrl?: string;
  lockedUntil?: string;
  reactions?: any[];
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Fetch entries when user is selected
  useEffect(() => {
    if (currentUser) {
      fetchEntries();
    }
  }, [currentUser]);

  const fetchEntries = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/entries?user=${encodeURIComponent(currentUser)}`);
      const data = await res.json();
      if (data.success) {
        setEntries(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch entries', error);
    }
  };

  const handleAddEntry = async (entryData: any) => {
    try {
      // Convert 'user' to 'userName' for new API
      const payload = {
        userName: entryData.user,
        type: entryData.type,
        content: entryData.content,
        year: entryData.year,
        imageUrl: entryData.imageUrl || null,
        lockedUntil: entryData.lockedUntil || null,
      };

      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setEntries((prev) => [data.data, ...prev]);
        setShowForm(false);
      } else {
        throw new Error(data.error || 'Failed to save data');
      }
    } catch (error) {
      console.error('Failed to add entry', error);
      throw error;
    }
  };

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-[#FEF9E7] overflow-hidden relative flex flex-col items-center justify-center">
        <UserSelect onSelect={setCurrentUser} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FEF9E7] overflow-hidden relative font-sans text-stone-700">
      {/* Background Texture (optional CSS pattern) */}
      <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-50">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentUser(null)}
            className="text-stone-400 hover:text-stone-600 transition-colors font-hand text-xl"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-hand font-bold text-stone-700">
            {currentUser}'s 2025 & 2026
          </h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-8 py-3 rounded-full bg-stone-800 text-[#FEF9E7] hover:bg-stone-700 transition-all font-bold tracking-wide shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          + Add Note
        </button>
      </header>

      {/* Floating Cards Area */}
      <div className="relative w-full h-screen overflow-hidden pointer-events-none">
        {entries.map((entry, index) => (
          <FloatingCard
            key={entry.id}
            type={entry.type}
            content={entry.content}
            index={index}
          />
        ))}
      </div>

      {/* Entry Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <EntryForm
              user={currentUser}
              onAdd={handleAddEntry}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Empty State Hint */}
      {entries.length === 0 && !showForm && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-stone-300 text-2xl font-hand rotate-[-5deg]">It's quiet here... Add a memory or wish.</p>
        </div>
      )}
    </main>
  );
}
