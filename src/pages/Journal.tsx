import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { JournalComposer } from './JournalComposer';
import { JournalHistory } from './JournalHistory';
import { useWellnessStore } from '../store/useWellnessStore';
import api from '../api/axios';
import './Journal.css';
import { Flame } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';

export interface JournalEntry {
  id: number;
  content: string;
  mood: string;
  promptId?: number;
  createdAt: string;
  updatedAt: string;
}

export const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const journalStreak = useWellnessStore((state) => state.journalStreak);
  const incrementJournalStreak = useWellnessStore((state) => state.incrementJournalStreak);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/journal/entries');
      setEntries(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load journal entries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleEntryAdded = (newEntry: JournalEntry) => {
    setEntries([newEntry, ...entries]);
    
    // Simplistic streak logic: increment on first entry of session/day
    // In a real app, this would verify calendar dates.
    incrementJournalStreak();
  };

  const handleEntryDeleted = async (id: number) => {
    try {
      await api.delete(`/journal/entries/${id}`);
      setEntries(entries.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Failed to delete entry', err);
      alert('Failed to delete entry');
    }
  };

  return (
    <PageWrapper>
      <div className="journal-page">
        <header className="journal-header">
          <div style={{ marginBottom: '16px' }}><BackButton /></div>
          <div className="journal-header-content">
            <h1 className="text-h1">Journal</h1>
            <p className="text-body tag-line">Your private space for reflection and daily logging.</p>
          </div>
          <div className="journal-streak-badge">
            <Flame size={20} className={journalStreak > 0 ? "streak-active" : "streak-inactive"} />
            <span className="streak-count">{journalStreak} {journalStreak === 1 ? 'Day' : 'Days'}</span>
          </div>
        </header>

        <main className="journal-main">
          <section className="composer-section">
            <JournalComposer onEntryAdded={handleEntryAdded} />
          </section>

          <section className="history-section">
            <h2 className="text-h3 history-title">Past Entries</h2>
            
            {loading ? (
              <div className="journal-loading">
                <div className="skeleton skeleton-card" />
                <div className="skeleton skeleton-card" />
              </div>
            ) : error ? (
              <div className="journal-error">
                <p>{error}</p>
                <button className="btn-primary" onClick={fetchEntries}>Retry</button>
              </div>
            ) : (
              <JournalHistory entries={entries} onDelete={handleEntryDeleted} />
            )}
          </section>
        </main>
      </div>
    </PageWrapper>
  );
};
