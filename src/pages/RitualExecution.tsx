import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { X, Check, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';
import { Ritual, RitualStep } from './Rituals';
import api from '../api/axios';
import { useWellnessStore } from '../store/useWellnessStore';
import './RitualExecution.css';

export const RitualExecution: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ritual, setRitual] = useState<Ritual | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  
  const incrementRitualsCompleted = useWellnessStore(state => state.incrementRitualsCompleted);

  // Fallback data if API fails or is not ready
  const DUMMY_RITUAL = {
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
  };

  useEffect(() => {
    const fetchRitual = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/rituals/${id}`);
        setRitual(response.data);
      } catch (err) {
        console.error('Failed to fetch ritual, using dummy data', err);
        setRitual(DUMMY_RITUAL);
      } finally {
        setLoading(false);
      }
    };
    fetchRitual();
  }, [id]);

  // Setup timer when step changes
  useEffect(() => {
    if (ritual && ritual.steps.length > 0 && currentStepIndex < ritual.steps.length) {
      setTimeLeft(ritual.steps[currentStepIndex].durationSeconds);
      setIsActive(false); // start paused
    }
  }, [ritual, currentStepIndex]);

  // Timer countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Auto-advance or wait for user? Let's wait for user for mindfulness.
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    if (ritual) {
      setIsActive(false);
      setTimeLeft(ritual.steps[currentStepIndex].durationSeconds);
    }
  };

  const nextStep = async () => {
    if (!ritual) return;
    
    if (currentStepIndex < ritual.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Complete ritual
      try {
        await api.post(`/rituals/${ritual.id}/complete`);
      } catch (e) {
        console.error('Failed to log completion on backend', e);
      }
      incrementRitualsCompleted();
      setCompleted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <PageWrapper hideNav>
        <div className="ritual-execution-loading">
          <div className="spinner"></div>
        </div>
      </PageWrapper>
    );
  }

  if (!ritual) return null;

  if (completed) {
    return (
      <PageWrapper hideNav>
        <div className="ritual-completed-screen">
          <div className="completion-icon-wrapper">
            <Check size={48} />
          </div>
          <h2 className="text-h2">Ritual Complete</h2>
          <p className="text-body tag-line">Thank you for taking this time for yourself.</p>
          <button className="btn-primary" onClick={() => navigate('/rituals')}>
            Return to Rituals
          </button>
        </div>
      </PageWrapper>
    );
  }

  const currentStep = ritual.steps[currentStepIndex];
  const progress = ((currentStepIndex) / ritual.steps.length) * 100;
  const timeProgress = 100 - ((timeLeft / currentStep.durationSeconds) * 100);

  return (
    <PageWrapper hideNav>
      <div className="ritual-execution-page">
        {/* Top Bar */}
        <header className="execution-header">
          <button className="icon-btn close-btn" onClick={() => navigate('/rituals')} aria-label="End Ritual">
            <X size={24} />
          </button>
          <span className="execution-title text-label">{ritual.title}</span>
          <span className="step-counter text-label">
            Step {currentStepIndex + 1} of {ritual.steps.length}
          </span>
        </header>

        {/* Overall Progress Bar */}
        <div className="overall-progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Main Content */}
        <main className="execution-main">
          <div className="step-content">
            <h2 className="step-instruction">{currentStep.instruction}</h2>
          </div>

          <div className="timer-section">
            {/* Circular Timer Visualization (simplified as a ring with conic-gradient via JS/CSS) */}
            <div className="timer-circle" style={{
              background: `conic-gradient(var(--accent-sage) ${timeProgress}%, var(--border-general) ${timeProgress}%)`
            }}>
              <div className="timer-circle-inner">
                <span className="time-display">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="timer-controls">
              <button className="icon-btn" onClick={resetTimer} aria-label="Reset Timer">
                <RotateCcw size={20} />
              </button>
              
              <button className="timer-toggle-btn" onClick={toggleTimer}>
                {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>
              
              <div style={{ width: 44 }}></div> {/* spacer to balance controls */}
            </div>
          </div>
        </main>

        {/* Bottom Bar */}
        <footer className="execution-footer">
          <button className="btn-primary next-step-btn" onClick={nextStep}>
            {currentStepIndex === ritual.steps.length - 1 ? (
              <>Complete <Check size={18} /></>
            ) : (
              <>Next Step <ArrowRight size={18} /></>
            )}
          </button>
        </footer>
      </div>
    </PageWrapper>
  );
};
