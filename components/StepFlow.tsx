'use client';

import { useEffect, useRef, useState } from 'react';
import { SimulatorState } from '@/types/simulator';
import StepAge from './steps/StepAge';
import StepStartAmount from './steps/StepStartAmount';
import StepFrequency from './steps/StepFrequency';
import StepContribution from './steps/StepContribution';
import StepYears from './steps/StepYears';
import StepRisk from './steps/StepRisk';
import StepEmail from './steps/StepEmail';
import StepBrokers from './steps/StepBrokers';

interface StepFlowProps {
  state: SimulatorState;
  currentStep: number;
  onUpdate: (updates: Partial<SimulatorState>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Total content steps (1-indexed): 1=Age, 2=StartAmount, 3=Frequency, 4=Contribution, 5=Years, 6=Risk, 7=Email, 8=Brokers
const TOTAL_STEPS = 8;
// Progress dots show steps 1-6 only (email and brokers are post-flow)
const PROGRESS_STEPS = 6;

export default function StepFlow({
  state,
  currentStep,
  onUpdate,
  onNext,
  onBack,
}: StepFlowProps) {
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animKey, setAnimKey] = useState(0);
  const prevStep = useRef(currentStep);
  const overflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentStep !== prevStep.current) {
      setDirection(currentStep > prevStep.current ? 'forward' : 'back');
      setAnimKey((k) => k + 1);
      prevStep.current = currentStep;
    }
  }, [currentStep]);

  // Reset scrollLeft that browsers auto-set when translateX animation overflows
  useEffect(() => {
    if (overflowRef.current) overflowRef.current.scrollLeft = 0;
  }, [animKey]);

  const animClass =
    direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left';

  function renderStep() {
    switch (currentStep) {
      case 1:
        return <StepAge state={state} onUpdate={onUpdate} onNext={onNext} />;
      case 2:
        return <StepStartAmount state={state} onUpdate={onUpdate} onNext={onNext} />;
      case 3:
        return <StepFrequency state={state} onUpdate={onUpdate} onNext={onNext} />;
      case 4:
        return <StepContribution state={state} onUpdate={onUpdate} onNext={onNext} />;
      case 5:
        return <StepYears state={state} onUpdate={onUpdate} onNext={onNext} />;
      case 6:
        return <StepRisk state={state} onUpdate={onUpdate} onNext={onNext} />;
      case 7:
        return <StepEmail state={state} onNext={onNext} />;
      case 8:
        return <StepBrokers state={state} />;
      default:
        return null;
    }
  }

  const showBackButton = currentStep > 1 && currentStep <= 7;
  const showProgress = currentStep <= PROGRESS_STEPS;

  return (
    <div className="flex flex-col">
      {/* Top bar: back button + progress dots */}
      <div className="flex items-center justify-between mb-8">
        <div className="w-8">
          {showBackButton && (
            <button
              onClick={onBack}
              className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-[#111] transition-colors"
              aria-label="Go back"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        {showProgress && (
          <div className="flex items-center gap-2">
            {Array.from({ length: PROGRESS_STEPS }, (_, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === currentStep;
              const isCompleted = stepNum < currentStep;

              return (
                <div
                  key={stepNum}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: isActive ? '24px' : '6px',
                    height: '6px',
                    backgroundColor: isActive
                      ? '#00C896'
                      : isCompleted
                      ? '#00C896'
                      : '#e5e7eb',
                    opacity: isCompleted ? 0.5 : 1,
                  }}
                />
              );
            })}
          </div>
        )}

        <div className="w-8" />
      </div>

      {/* Step content with slide animation */}
      <div ref={overflowRef} className="overflow-hidden">
        <div key={animKey} className={animClass}>
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
