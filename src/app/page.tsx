'use client';

import { useState, useEffect } from 'react';
import UserSelect from '@/components/UserSelect';
import FloatingCard from '@/components/FloatingCard';
import CardModal from '@/components/CardModal';
import EntryForm from '@/components/EntryForm';
import { AnimatePresence } from 'framer-motion';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string };
}

interface Entry {
  id: string;
  user: { id: string; name: string };
  type: 'MEMORY' | 'WISH';
  content: string;
  year: number;
  imageUrl?: string;
  lockedUntil?: string;
  reactions: any[];
  comments: Comment[];
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<Entry | null>(null);

  // Fetch entries when user is selected
  useEffect(() => {
    if (currentUser) {
      fetchEntries();
    }
  }, [currentUser]);

  const fetchEntries = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/entries');
      const data = await res.json();
      if (data.success) {
        setEntries(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch entries', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEntry = async (entryData: any) => {
    try {
      // payload preparation
      const payload = {
        userName: entryData.user,
        type: entryData.type,
        content: entryData.content,
        year: entryData.year,
        imageUrl: entryData.imageUrl || null,
        lockedUntil: entryData.lockedUntil || null,
      };

      let url = '/api/entries';
      let method = 'POST';

      if (editingEntry) {
        url = `/api/entries/${editingEntry.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data.success) {
        // Refresh list
        await fetchEntries();
        setShowForm(false);
        setEditingEntry(null);
      } else {
        throw new Error(data.error || 'Failed to save data');
      }
    } catch (error) {
      console.error('Failed to save entry', error);
      throw error;
    }
  };

  const handleCardClick = (entry: Entry) => {
    setExpandedEntry(entry);
  };

  const handleEdit = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      setExpandedEntry(null);
      setEditingEntry(entry);
      setShowForm(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      setEntries(prev => prev.filter(e => e.id !== id));
      setExpandedEntry(null);
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleToggleReact = async (id: string, emoji: string, hasReacted: boolean) => {
    try {
      // Find if user already has a different reaction on this entry
      const entry = entries.find(e => e.id === id);
      const existingReaction = entry?.reactions.find(r => r.user.name === currentUser);
      const oldEmoji = existingReaction?.emoji;

      if (hasReacted) {
        // Remove reaction - same emoji clicked again
        setEntries(prev => prev.map(e => {
          if (e.id === id) {
            return {
              ...e,
              reactions: e.reactions.filter(r => !(r.emoji === emoji && r.user.name === currentUser))
            };
          }
          return e;
        }));

        if (expandedEntry && expandedEntry.id === id) {
          setExpandedEntry(prev => prev ? {
            ...prev,
            reactions: prev.reactions.filter(r => !(r.emoji === emoji && r.user.name === currentUser))
          } : null);
        }

        await fetch(`/api/reactions?entryId=${id}&userName=${encodeURIComponent(currentUser!)}&emoji=${encodeURIComponent(emoji)}`, {
          method: 'DELETE'
        });
      } else {
        // If user has existing reaction with different emoji, remove it first
        if (oldEmoji && oldEmoji !== emoji) {
          // Remove old reaction (optimistic)
          setEntries(prev => prev.map(e => {
            if (e.id === id) {
              return {
                ...e,
                reactions: e.reactions.filter(r => !(r.user.name === currentUser))
              };
            }
            return e;
          }));

          if (expandedEntry && expandedEntry.id === id) {
            setExpandedEntry(prev => prev ? {
              ...prev,
              reactions: prev.reactions.filter(r => !(r.user.name === currentUser))
            } : null);
          }

          // Delete old reaction from server
          await fetch(`/api/reactions?entryId=${id}&userName=${encodeURIComponent(currentUser!)}&emoji=${encodeURIComponent(oldEmoji)}`, {
            method: 'DELETE'
          });
        }

        // Add new reaction - optimistic update
        setEntries(prev => prev.map(e => {
          if (e.id === id) {
            return {
              ...e,
              reactions: [...e.reactions.filter(r => r.user.name !== currentUser), { id: 'temp-' + Date.now(), emoji, user: { name: currentUser! } }]
            };
          }
          return e;
        }));

        if (expandedEntry && expandedEntry.id === id) {
          setExpandedEntry(prev => prev ? {
            ...prev,
            reactions: [...prev.reactions.filter(r => r.user.name !== currentUser), { id: 'temp-' + Date.now(), emoji, user: { name: currentUser! } }]
          } : null);
        }

        await fetch('/api/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entryId: id, userName: currentUser, emoji })
        });
      }
      // Re-fetch to sync
      fetchEntries();
    } catch (error) {
      console.error('React failed', error);
    }
  };

  const handleAddComment = async (id: string, content: string) => {
    try {
      // Optimistic update
      const tempId = 'temp-' + Date.now();
      const newComment = {
        id: tempId,
        content,
        createdAt: new Date().toISOString(),
        user: { name: currentUser! }
      };

      setEntries(prev => prev.map(e => {
        if (e.id === id) {
          return { ...e, comments: [...(e.comments || []), newComment] };
        }
        return e;
      }));

      // Update expanded entry
      if (expandedEntry && expandedEntry.id === id) {
        setExpandedEntry(prev => prev ? {
          ...prev,
          comments: [...(prev.comments || []), newComment]
        } : null);
      }

      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: id, userName: currentUser, content })
      });
      // Re-fetch to sync
      fetchEntries();
    } catch (error) {
      console.error('Add comment failed', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      // Optimistic update
      setEntries(prev => prev.map(e => {
        if (e.id === expandedEntry?.id) {
          return { ...e, comments: e.comments.filter(c => c.id !== commentId) };
        }
        return e;
      }));

      if (expandedEntry) {
        setExpandedEntry(prev => prev ? {
          ...prev,
          comments: prev.comments.filter(c => c.id !== commentId)
        } : null);
      }

      await fetch(`/api/comments?id=${commentId}&userName=${encodeURIComponent(currentUser!)}`, { method: 'DELETE' });
      fetchEntries();
    } catch (error) {
      console.error('Delete comment failed', error);
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
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex items-center space-x-4 pointer-events-auto">
          <button
            onClick={() => setCurrentUser(null)}
            className="text-stone-400 hover:text-stone-600 transition-colors font-hand text-xl"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-hand font-bold text-stone-700">
            {currentUser}&apos;s 2025 &amp; 2026
          </h1>
        </div>
        <button
          onClick={() => { setEditingEntry(null); setShowForm(true); }}
          className="pointer-events-auto px-8 py-3 rounded-full bg-stone-800 text-[#FEF9E7] hover:bg-stone-700 transition-all font-bold tracking-wide shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          + Add Note
        </button>
      </header>

      {/* Floating Cards Area */}
      <div className="relative w-full h-screen overflow-hidden pointer-events-none">
        {entries.map((entry, index) => (
          <FloatingCard
            key={entry.id}
            id={entry.id}
            type={entry.type}
            content={entry.content}
            author={entry.user.name}
            year={entry.year}
            imageUrl={entry.imageUrl}
            lockedUntil={entry.lockedUntil}
            reactions={entry.reactions}
            comments={entry.comments}
            index={index}
            onClick={() => handleCardClick(entry)}
          />
        ))}
      </div>

      {/* Card Detail Modal - Rendered at page level! */}
      <AnimatePresence>
        {expandedEntry && (
          <CardModal
            entry={expandedEntry}
            currentUser={currentUser}
            onClose={() => setExpandedEntry(null)}
            onEdit={() => handleEdit(expandedEntry.id)}
            onDelete={() => handleDelete(expandedEntry.id)}
            onToggleReact={(emoji, hasReacted) => handleToggleReact(expandedEntry.id, emoji, hasReacted)}
            onAddComment={(content) => handleAddComment(expandedEntry.id, content)}
            onDeleteComment={(commentId) => handleDeleteComment(commentId)}
          />
        )}
      </AnimatePresence>

      {/* Entry Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <EntryForm
              user={currentUser}
              initialData={editingEntry}
              onAdd={handleSubmitEntry}
              onCancel={() => { setShowForm(false); setEditingEntry(null); }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Empty State Hint - only show after loading complete */}
      {!isLoading && entries.length === 0 && !showForm && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-stone-300 text-2xl font-hand rotate-[-5deg]">It&apos;s quiet here... Add a memory or wish.</p>
        </div>
      )}
    </main>
  );
}
