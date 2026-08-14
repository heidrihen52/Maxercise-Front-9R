import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GenderMale, GenderFemale, GenderNeuter,
  Sparkle, Lightning, TrendUp, Hourglass, Heart,
  Flame, Barbell, Butterfly, Pulse,
  Ruler, Circle, Question,
  PersonSimpleWalk, PersonSimpleRun, Trophy,
  CalendarBlank, Calendar, CalendarPlus, Infinity as InfinityIcon,
  Bandaids, ShieldCheck, WarningOctagon, Scales, Wind, Baby,
  Buildings, Person, Info, CheckCircle, RocketLaunch, ArrowLeft, Bicycle
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import questions from '../data/questions';
import './Questionnaire.css';

const iconMap = {
  male: <GenderMale size={28} weight="bold" />,
  female: <GenderFemale size={28} weight="bold" />,
  other: <GenderNeuter size={28} weight="bold" />,
  '15-20': <Sparkle size={28} weight="bold" />,
  '21-30': <Lightning size={28} weight="bold" />,
  '31-45': <TrendUp size={28} weight="bold" />,
  '46-60': <Hourglass size={28} weight="bold" />,
  '60+': <Heart size={28} weight="bold" />,
  lose_weight: <Flame size={28} weight="bold" />,
  gain_muscle: <Barbell size={28} weight="bold" />,
  stay_fit: <Pulse size={28} weight="bold" />,
  flexibility: <Butterfly size={28} weight="bold" />,
  health: <Pulse size={28} weight="bold" />,
  ectomorph: <Ruler size={28} weight="bold" />,
  mesomorph: <Barbell size={28} weight="bold" />,
  endomorph: <Circle size={28} weight="bold" />,
  mixed: <Question size={28} weight="bold" />,
  beginner: <PersonSimpleWalk size={28} weight="bold" />,
  intermediate: <PersonSimpleRun size={28} weight="bold" />,
  advanced: <Trophy size={28} weight="bold" />,
  '1-2': <CalendarBlank size={28} weight="bold" />,
  '3-4': <Calendar size={28} weight="bold" />,
  '5-6': <CalendarPlus size={28} weight="bold" />,
  '7': <InfinityIcon size={28} weight="bold" />,
  lesión_rodilla: <Bandaids size={28} weight="bold" />,
  lesión_espalda: <Bandaids size={28} weight="bold" />,
  lesión_hombro: <Bandaids size={28} weight="bold" />,
  lesión_muñeca: <Bandaids size={28} weight="bold" />,
  lesión_cuello: <Bandaids size={28} weight="bold" />,
  condición_cardiaca: <Heart size={28} weight="bold" />,
  hipertensión: <Pulse size={28} weight="bold" />,
  hernia: <WarningOctagon size={28} weight="bold" />,
  obesidad: <Scales size={28} weight="bold" />,
  asma: <Wind size={28} weight="bold" />,
  embarazo: <Baby size={28} weight="bold" />,
  ninguna: <ShieldCheck size={28} weight="bold" />,
  gym_full: <Buildings size={28} weight="bold" />,
  dumbbells: <Barbell size={28} weight="bold" />,
  barbell: <Barbell size={28} weight="bold" />,
  kettlebell: <Trophy size={28} weight="bold" />,
  resistance_bands: <InfinityIcon size={28} weight="bold" />,
  pullup_bar: <Trophy size={28} weight="bold" />,
  cardio_machine: <Bicycle size={28} weight="bold" />,
  none: <Person size={28} weight="bold" />
};

export default function Questionnaire() {
  const { saveProfile, userProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  
  // Initialize with existing profile if it exists, mapping backend formats if necessary
  const [answers, setAnswers] = useState(() => {
    if (!userProfile) return {};
    return {
      gender: userProfile.gender,
      age: userProfile.age,
      goal: userProfile.goal,
      bodyType: userProfile.bodyType,
      fitnessLevel: userProfile.fitnessLevel || userProfile.fitness_level,
      daysPerWeek: userProfile.daysPerWeek,
      restrictions: userProfile.restrictions,
      equipment: userProfile.equipment,
    };
  });
  const [tooltip, setTooltip] = useState(null);

  const currentQ = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const handleSelect = (fieldId, value, type) => {
    if (type === 'multi') {
      setAnswers(prev => {
        const current = prev[fieldId] || [];
        const isNone = value === 'ninguna' || value === 'none';
        if (isNone) return { ...prev, [fieldId]: [value] };
        const withoutNone = current.filter(v => v !== 'ninguna' && v !== 'none');
        const exists = withoutNone.includes(value);
        return { ...prev, [fieldId]: exists ? withoutNone.filter(v => v !== value) : [...withoutNone, value] };
      });
    } else {
      setAnswers(prev => ({ ...prev, [fieldId]: value }));
    }
  };

  const isSelected = (fieldId, value, type) => {
    if (type === 'multi') return (answers[fieldId] || []).includes(value);
    return answers[fieldId] === value;
  };

  const canProceed = currentQ.fields.every(f => {
    if (f.type === 'multi') return (answers[f.id] || []).length > 0;
    return !!answers[f.id];
  });

  const handleNext = () => {
    if (step < questions.length - 1) setStep(p => p + 1);
    else {
      const profile = {
        gender: answers.gender,
        age: answers.age,
        goal: answers.goal,
        bodyType: answers.bodyType,
        fitnessLevel: answers.fitnessLevel,
        daysPerWeek: answers.daysPerWeek,
        restrictions: answers.restrictions || ['ninguna'],
        equipment: answers.equipment || ['none'],
      };
      saveProfile(profile);
      navigate('/home');
    }
  };

  return (
    <div className="questionnaire-page">
      <div className="q-bg" />
      <div className="q-container">
        <div className="q-header">
          <div className="q-logo"><Barbell size={24} color="var(--blue-primary)" weight="fill"/> <span>maxercise</span></div>
          <div className="q-progress-wrap">
            <div className="q-progress-bar">
              <div className="q-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="q-progress-label">Paso {step + 1} de {questions.length}</span>
          </div>
        </div>

        <div className="q-card">
          <div className="q-step-header">
            <div className="q-step-badge">{step + 1}</div>
            <div>
              <h2 className="q-title">{currentQ.title}</h2>
              <p className="q-subtitle">{currentQ.subtitle}</p>
            </div>
          </div>

          {currentQ.fields.map(field => (
            <div key={field.id} className="q-field">
              <div className="q-field-label-row">
                <h3 className="q-field-label">{field.label}</h3>
                {field.why && (
                  <button
                    className="q-info-btn"
                    type="button"
                    aria-label="¿Por qué preguntamos esto?"
                    onClick={() => setTooltip(tooltip === field.id ? null : field.id)}
                  >
                    <Info size={18} weight="fill" />
                  </button>
                )}
              </div>
              {tooltip === field.id && field.why && (
                <div className="q-tooltip">
                  <strong>¿Por qué te preguntamos esto?</strong>
                  <p>{field.why}</p>
                </div>
              )}
              {field.type === 'multi' && (
                <p className="q-multi-hint">Puedes seleccionar varias opciones</p>
              )}
              <div className={`q-options ${field.options.length > 4 ? 'q-options-grid' : 'q-options-row'}`}>
                {field.options.map(opt => (
                  <button
                    key={opt.value}
                    className={`q-option ${isSelected(field.id, opt.value, field.type) ? 'selected' : ''}`}
                    onClick={() => handleSelect(field.id, opt.value, field.type)}
                    type="button"
                  >
                    <div className="q-opt-icon-wrap">
                      {iconMap[opt.value] || <Activity size={28} weight="bold" />}
                      {isSelected(field.id, opt.value, field.type) && (
                        <div className="q-opt-check-bubble">
                          <CheckCircle size={18} weight="fill" />
                        </div>
                      )}
                    </div>
                    <div className="q-opt-label">{opt.label}</div>
                    {opt.description && <div className="q-opt-desc">{opt.description}</div>}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="q-actions">
            <div style={{ display: 'flex', gap: '8px' }}>
              {userProfile?.gender && (
                <button className="btn btn-ghost" onClick={() => navigate('/home')}>
                  Cancelar
                </button>
              )}
              {step > 0 && (
                <button className="btn btn-secondary" onClick={() => setStep(p => p - 1)}>
                  ← Anterior
                </button>
              )}
            </div>
            <button
              className="btn btn-primary q-next-btn"
              onClick={handleNext}
              disabled={!canProceed}
            >
              {step === questions.length - 1 ? (
                <span style={{display:'flex', alignItems:'center', gap:'6px'}}>
                  <RocketLaunch size={18} weight="bold" /> 
                  {userProfile?.gender ? 'Guardar Cambios' : 'Completar y entrar'}
                </span>
              ) : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
