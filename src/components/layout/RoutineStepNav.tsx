import React from 'react';
import './RoutineStepNav.css';

const steps = [
  "Cleanse", "Tone", "Essence", "Serum", "Ampoule", "Moisturize", "Protect", "Mask"
];

interface RoutineStepNavProps {
  activeStep?: string;
  onStepChange?: (step: string) => void;
}

export const RoutineStepNav: React.FC<RoutineStepNavProps> = ({ activeStep = "Cleanse", onStepChange }) => {
  return (
    <nav className="routine-nav">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div 
            className={`routine-step text-label ${activeStep === step ? 'active' : ''}`}
            onClick={() => onStepChange?.(step)}
          >
            {step}
          </div>
          {index < steps.length - 1 && <div className="routine-connector" />}
        </React.Fragment>
      ))}
    </nav>
  );
};
