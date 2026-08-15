import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Play, Plus, Clock, ListOrdered, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { useWellnessStore } from '../store/useWellnessStore';
import { useNavigate } from 'react-router-dom';
import './Rituals.css';

export interface RitualStep {
  id: number;
  stepOrder: number;
  instruction: string;
  durationSeconds: number;
}

export interface Ritual {
  id: number;
  title: string;
  category: string;
  description: string;
  isCustom: boolean;
  steps: RitualStep[];
}

export const Rituals: React.FC = () => {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const ritualsCompleted = useWellnessStore(state => state.ritualsCompleted);

  const fetchRituals = async () => {
    setLoading(true);
    try {
      const response = await api.get('/rituals');
      if (response.data.length === 0) {
        setRituals(DUMMY_RITUALS);
      } else {
        setRituals(response.data);
      }
    } catch (err) {
      console.error(err);
      setRituals(DUMMY_RITUALS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRituals();
  }, []);

  const morningRitual = rituals.find(r => r.category === 'Morning');
  const eveningRitual = rituals.find(r => r.category === 'Evening');


  // Determine which ritual to feature based on time of day
  const hour = new Date().getHours();
  const featuredRitual = hour < 12 ? morningRitual : eveningRitual;
  const featuredTitle = hour < 12 ? "Start Your Day" : "Wind Down";

  return (
    <PageWrapper>
      <div className="rituals-page">
        <header className="rituals-header">
          <div className="rituals-header-content">
            <h1 className="text-h1">Rituals</h1>
            <p className="text-body tag-line">Guided routines to start and end your day with intention.</p>
          </div>
          <div className="rituals-stats">
            <div className="stat-card">
              <CheckCircle2 size={16} className="stat-icon" />
              <span className="stat-value">{ritualsCompleted} Completed</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="rituals-loading">
            <div className="skeleton-hero" />
          </div>
        ) : (
          <>
            {/* Today View / Home Dashboard */}
            {featuredRitual && (
              <section className="featured-ritual-section">
                <h2 className="section-title text-h3">Today</h2>
                <div className="featured-ritual-card">
                  <div className="featured-ritual-content">
                    <span className="ritual-time-context">{featuredTitle}</span>
                    <h3 className="ritual-title">{featuredRitual.title}</h3>
                    <p className="ritual-description text-body">{featuredRitual.description}</p>
                    <div className="ritual-meta">
                      <span className="meta-item"><Clock size={14} /> {Math.ceil(featuredRitual.steps.reduce((acc, step) => acc + step.durationSeconds, 0) / 60)} min</span>
                      <span className="meta-item"><ListOrdered size={14} /> {featuredRitual.steps.length} steps</span>
                    </div>
                  </div>
                  <button 
                    className="btn-primary start-ritual-btn"
                    onClick={() => navigate(`/rituals/execute/${featuredRitual.id}`)}
                  >
                    <Play size={16} fill="currentColor" /> Begin Ritual
                  </button>
                </div>
              </section>
            )}

            {/* Ritual Library */}
            <section className="ritual-library">
              <div className="library-header">
                <h2 className="section-title text-h3">Ritual Library</h2>
                <button className="btn-secondary create-ritual-btn">
                  <Plus size={16} /> Create Custom
                </button>
              </div>

              <div className="ritual-grid">
                {rituals.map(ritual => {
                  const totalMinutes = Math.ceil(ritual.steps.reduce((acc, step) => acc + step.durationSeconds, 0) / 60);
                  
                  return (
                    <div key={ritual.id} className="ritual-list-card glass-card">
                      <div className="ritual-list-content">
                        <span className="ritual-category">{ritual.category}</span>
                        <h4 className="ritual-list-title">{ritual.title}</h4>
                        <div className="ritual-meta">
                          <span className="meta-item"><Clock size={12} /> {totalMinutes}m</span>
                          <span className="meta-item"><ListOrdered size={12} /> {ritual.steps.length} steps</span>
                        </div>
                      </div>
                      <button 
                        className="start-ritual-icon"
                        onClick={() => navigate(`/rituals/execute/${ritual.id}`)}
                        aria-label={`Start ${ritual.title}`}
                      >
                        <Play size={20} fill="currentColor" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </PageWrapper>
  );
};

const DUMMY_RITUALS: Ritual[] = [
  {
    id: 1,
    title: "Morning Clarity",
    category: "Morning",
    description: "A simple routine to ground yourself before the day begins.",
    isCustom: false,
    steps: [
      { id: 101, stepOrder: 1, instruction: "Drink a glass of water.", durationSeconds: 60 },
      { id: 102, stepOrder: 2, instruction: "Write down three things you are grateful for.", durationSeconds: 180 },
      { id: 103, stepOrder: 3, instruction: "Take three deep breaths.", durationSeconds: 60 }
    ]
  },
  {
    id: 2,
    title: "Evening Wind Down",
    category: "Evening",
    description: "Prepare your mind and body for restful sleep.",
    isCustom: false,
    steps: [
      { id: 201, stepOrder: 1, instruction: "Turn off all screens.", durationSeconds: 60 },
      { id: 202, stepOrder: 2, instruction: "Reflect on one positive moment from today.", durationSeconds: 180 },
      { id: 203, stepOrder: 3, instruction: "Gentle stretching or progressive muscle relaxation.", durationSeconds: 300 }
    ]
  },
  {
    id: 3,
    title: "Mid-Day Reset",
    category: "Focus",
    description: "Clear your head during a busy afternoon.",
    isCustom: false,
    steps: [
      { id: 301, stepOrder: 1, instruction: "Step away from your desk.", durationSeconds: 60 },
      { id: 302, stepOrder: 2, instruction: "Focus on a distant object to rest your eyes.", durationSeconds: 60 },
      { id: 303, stepOrder: 3, instruction: "Box breathing: Inhale 4s, Hold 4s, Exhale 4s, Hold 4s.", durationSeconds: 240 }
    ]
  }
];
