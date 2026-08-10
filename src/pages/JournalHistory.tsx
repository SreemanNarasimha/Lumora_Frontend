import React, { useState } from 'react';
import { JournalEntry } from './Journal';
import { Smile, Meh, Frown, Trash2, Calendar, List } from 'lucide-react';

interface HistoryProps {
  entries: JournalEntry[];
  onDelete: (id: number) => void;
}

const getMoodIcon = (mood: string) => {
  switch (mood) {
    case 'great': return <Smile size={16} />;
    case 'okay': return <Meh size={16} />;
    case 'rough': return <Frown size={16} />;
    default: return null;
  }
};

const formatDate = (isoString: string) => {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return isoString;
  }
};

export const JournalHistory: React.FC<HistoryProps> = ({ entries, onDelete }) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  if (entries.length === 0) {
    return (
      <div className="journal-empty-state">
        <div className="empty-icon-wrapper">
          <Calendar size={32} />
        </div>
        <h3 className="text-h3">No entries yet</h3>
        <p className="text-body">Your reflections will appear here once you write your first entry.</p>
      </div>
    );
  }

  return (
    <div className="journal-history">
      <div className="history-controls">
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            <List size={18} />
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
            aria-label="Calendar view"
          >
            <Calendar size={18} />
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="entry-list">
          {entries.map(entry => (
            <article key={entry.id} className="journal-entry-card glass-card">
              <header className="entry-header">
                <time className="entry-date text-label">
                  {formatDate(entry.createdAt)}
                </time>
                <div className="entry-actions">
                  {entry.mood && (
                    <span className="entry-mood" title={`Mood: ${entry.mood}`}>
                      {getMoodIcon(entry.mood)}
                    </span>
                  )}
                  <button 
                    className="entry-delete-btn"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this entry?')) {
                        onDelete(entry.id);
                      }
                    }}
                    aria-label="Delete entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </header>
              <p className="entry-content text-body">{entry.content}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="calendar-view-placeholder">
          {/* Calendar view is complex, using a placeholder for this phase */}
          <div className="journal-empty-state" style={{ padding: 'var(--space-8)' }}>
            <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
            <h3 className="text-h3">Calendar View</h3>
            <p className="text-body">Calendar visualization will be enabled in a future update. For now, please use the List view.</p>
          </div>
        </div>
      )}
    </div>
  );
};
