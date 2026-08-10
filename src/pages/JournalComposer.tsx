import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Send, RefreshCw, Smile, Meh, Frown } from 'lucide-react';
import { JournalEntry } from './Journal';

interface Prompt {
  id: number;
  text: string;
  category: string;
}

interface ComposerProps {
  onEntryAdded: (entry: JournalEntry) => void;
}

const MOODS = [
  { id: 'great', icon: <Smile size={20} />, label: 'Great' },
  { id: 'okay', icon: <Meh size={20} />, label: 'Okay' },
  { id: 'rough', icon: <Frown size={20} />, label: 'Rough' },
];

export const JournalComposer: React.FC<ComposerProps> = ({ onEntryAdded }) => {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPrompt = async () => {
    setLoadingPrompt(true);
    try {
      const response = await api.get('/journal/prompts/random');
      setPrompt(response.data);
    } catch (error) {
      console.error('Failed to load prompt', error);
    } finally {
      setLoadingPrompt(false);
    }
  };

  useEffect(() => {
    fetchPrompt();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post('/journal/entries', {
        content: content.trim(),
        mood: mood,
        promptId: prompt?.id
      });
      onEntryAdded(response.data);
      setContent('');
      setMood(null);
      fetchPrompt(); // get a new prompt for next time
    } catch (error) {
      console.error('Failed to save entry', error);
      alert('Failed to save your entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="journal-composer">
      {prompt && (
        <div className="composer-prompt">
          <span className="prompt-label">Prompt of the day</span>
          <div className="prompt-text-wrapper">
            <p className="prompt-text">{prompt.text}</p>
            <button 
              type="button" 
              className="refresh-prompt-btn" 
              onClick={fetchPrompt}
              disabled={loadingPrompt}
              aria-label="Get a different prompt"
            >
              <RefreshCw size={16} className={loadingPrompt ? 'spin' : ''} />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          className="composer-textarea"
          placeholder="What's on your mind? You can write freely or respond to the prompt..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <div className="composer-footer">
          <div className="mood-selector">
            <span className="mood-label">Mood:</span>
            {MOODS.map(m => (
              <button
                key={m.id}
                type="button"
                className={`mood-btn ${mood === m.id ? 'active' : ''}`}
                onClick={() => setMood(m.id === mood ? null : m.id)}
                title={m.label}
                aria-label={`Set mood to ${m.label}`}
              >
                {m.icon}
              </button>
            ))}
          </div>

          <button 
            type="submit" 
            className="btn-primary composer-submit"
            disabled={!content.trim() || submitting}
          >
            {submitting ? 'Saving...' : 'Save Entry'}
            {!submitting && <Send size={16} />}
          </button>
        </div>
      </form>
    </div>
  );
};
