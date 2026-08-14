import { useState } from 'react';
import { Heart, Warning, X, ArrowLeft, Brain, Timer, Heartbeat } from '@phosphor-icons/react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { aiAPI } from '../../services/api';
import './Modals.css';

const diffLabel = { beginner:'Principiante', intermediate:'Intermedio', advanced:'Avanzado' };
const muscleLabel = { chest:'Pecho', back:'Espalda', legs:'Piernas', shoulders:'Hombros', arms:'Brazos', glutes:'Glúteos', core:'Core', cardio:'Cardio', full:'Cuerpo completo' };
const areaLabel = {
  upper: 'Tren superior',
  lower: 'Tren inferior',
  core: 'Core',
  full_body: 'Cuerpo completo',
  cardio: 'Cardio',
  split: 'Rutina dividida (Split)',
  mobility: 'Movilidad'
};

export function ExerciseModal({ exercise, onClose, isDrilled = false }) {
  const { toggleFavorite, isFavorite } = useData();
  const [imgErr, setImgErr] = useState(false);
  if (!exercise) return null;
  const fav = isFavorite(exercise.id, 'exercises');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {isDrilled && (
          <div style={{ padding: '12px 20px 0', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blue-primary)', fontWeight: 700 }}>
              <ArrowLeft size={16} weight="bold" /> Volver a la rutina
            </button>
          </div>
        )}
        <div className="modal-img-wrap">
          <img
            src={imgErr ? `https://picsum.photos/seed/${exercise.id}/800/450` : exercise.image}
            alt={exercise.name}
            className="modal-img"
            onError={() => setImgErr(true)}
          />
          <button className="modal-close-btn" onClick={onClose}><X size={18} weight="bold" /></button>
          {!exercise.isSafe && (
            <div className="modal-alert-strip">
              <Warning size={16} weight="fill" /> Este ejercicio puede no ser adecuado para tus condiciones físicas
            </div>
          )}
        </div>
        <div className="modal-content">
          <div className="modal-meta">
            <span className={`badge badge-${exercise.difficulty === 'beginner' ? 'green' : exercise.difficulty === 'intermediate' ? 'yellow' : 'red'}`}>
              {diffLabel[exercise.difficulty]}
            </span>
            <span className="badge badge-blue">{muscleLabel[exercise.muscleGroup] || exercise.muscleGroup}</span>
            <span className="badge badge-gray">{areaLabel[exercise.bodyArea] || exercise.bodyArea}</span>
          </div>
          <h2 className="modal-title">{exercise.name}</h2>
          <p className="modal-desc">{exercise.description}</p>

          <div className="modal-section">
            <h4>Equipo necesario</h4>
            <p>{exercise.equipment || 'Ninguno'}</p>
          </div>

          <div className="modal-section">
            <h4>Pasos</h4>
            <ol className="modal-steps">
              {exercise.steps?.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>

          {exercise.videoUrl && (
            <div className="modal-section">
              <h4>Video de demostración</h4>
              <div className="modal-video-wrap">
                <iframe
                  src={`${exercise.videoUrl}?rel=0&modestbranding=1`}
                  title={`Demo: ${exercise.name}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="modal-video"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {exercise.tags?.length > 0 && (
            <div className="modal-tags">
              {exercise.tags.map(t => <span key={t} className="badge badge-gray">{t}</span>)}
            </div>
          )}

          <button
            className={`btn btn-full mt-4 ${fav ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => toggleFavorite(exercise.id, 'exercises')}
          >
            <Heart size={16} weight={fav ? 'fill' : 'regular'} />
            {fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RoutineModal({ routine, onClose }) {
  const { exercises, toggleFavorite, isFavorite } = useData();
  const { currentUser, userProfile } = useAuth();
  const [imgErr, setImgErr] = useState(false);
  const [drillExercise, setDrillExercise] = useState(null);
  const [averageWeight, setAverageWeight] = useState(10);
  const [proposedHr, setProposedHr] = useState(140);
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [isWatchLinked, setIsWatchLinked] = useState(() => !!userProfile?.hasWearable);

  if (!routine) return null;
  const fav = isFavorite(routine.id, 'routines');
  
  const routineExercises = (routine.exercises || [])
    .map(item => {
      const exId = item.exercise_id || item.exerciseId || item;
      const ex = exercises.find(e => e.id === exId);
      if (!ex) return null;
      return {
        ...ex,
        reps: item.reps,
        sets: item.sets,
        day_number: item.day_number,
        order: item.order
      };
    })
    .filter(Boolean);

  const totalReps = routineExercises.reduce((acc, curr) => acc + (curr.sets * curr.reps), 0);
  const calculatedVolume = totalReps * averageWeight;

  if (drillExercise) {
    return (
      <ExerciseModal
        exercise={{ ...drillExercise, isSafe: true }}
        onClose={() => setDrillExercise(null)}
        isDrilled={true}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-img-wrap">
          <img
            src={imgErr ? `https://picsum.photos/seed/${routine.id}/800/450` : routine.image}
            alt={routine.name}
            className="modal-img"
            onError={() => setImgErr(true)}
          />
          <button className="modal-close-btn" onClick={onClose}><X size={18} weight="bold" /></button>
          {!routine.isSafe && (
            <div className="modal-alert-strip">
              <Warning size={16} weight="fill" /> Esta rutina puede no ser adecuada para tus condiciones físicas
            </div>
          )}
        </div>
        <div className="modal-content">
          <div className="modal-meta">
            <span className={`badge badge-${routine.level === 'beginner' ? 'green' : routine.level === 'intermediate' ? 'yellow' : 'red'}`}>
              {diffLabel[routine.level] || routine.level}
            </span>
            {routine.category && (
              <span className="badge badge-blue">
                {areaLabel[routine.category] || routine.category}
              </span>
            )}
            {routine.duration && <span className="badge badge-blue">{routine.duration}</span>}
            {routine.frequency && <span className="badge badge-gray">{routine.frequency}</span>}
          </div>
          <h2 className="modal-title">{routine.name}</h2>
          <p className="modal-desc">{routine.description}</p>

          {routineExercises.length > 0 && (
            <div className="modal-section">
              <h4>Ejercicios incluidos ({routineExercises.length}) <span className="drill-hint">— toca uno para ver detalles</span></h4>
              <div className="routine-exercise-list">
                {routineExercises.map(ex => (
                  <div
                    key={ex.id}
                    className="routine-ex-item clickable"
                    onClick={() => setDrillExercise(ex)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setDrillExercise(ex)}
                  >
                    <img src={ex.image} alt="" onError={e => e.target.src=`https://picsum.photos/seed/${ex.id}/80/80`} />
                    <div className="routine-ex-info">
                      <div className="routine-ex-name">{ex.name}</div>
                      <div className="routine-ex-muscle">
                        {muscleLabel[ex.muscleGroup] || ex.muscleGroup}
                        {ex.sets && ex.reps && ` · ${ex.sets} series x ${ex.reps} reps`}
                        {ex.day_number && ` · Día ${ex.day_number}`}
                      </div>
                    </div>
                    <span className="drill-arrow"><ArrowLeft size={16} weight="bold" style={{ transform:'rotate(180deg)' }} /></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🧠 Detección Preventiva de Sobreesfuerzo por IA */}
          <div className="ai-overexertion-panel" style={{
            marginTop: '20px',
            padding: '16px',
            background: 'var(--gray-50)',
            border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-md)'
          }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 12px 0', color: 'var(--blue-primary)', fontSize: '0.95rem', fontWeight: 700 }}>
              <Brain size={18} weight="fill" /> Chequeo de Sobreesfuerzo (IA)
            </h4>

            {/* Toggle de Sincronización de Reloj */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⌚ Reloj inteligente (wearable)
              </span>
              <button
                type="button"
                className={`btn btn-xs ${isWatchLinked ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '2px 10px', fontSize: '0.75rem', height: '24px', display: 'flex', alignItems: 'center' }}
                onClick={() => setIsWatchLinked(!isWatchLinked)}
              >
                {isWatchLinked ? '⚡ Vinculado' : '🔌 Vincular'}
              </button>
            </div>

            {!isWatchLinked ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: '0', textAlign: 'center', padding: '8px 0', lineHeight: '1.4' }}>
                Vincula tu reloj inteligente desde la aplicación del wearable para sincronizar tu ritmo cardíaco y analizar tu fatiga.
              </p>
            ) : (
              <>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                  Simula tu entrenamiento proyectado para comprobar si la intensidad es segura para tu condición actual.
                </p>
                
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: '4px' }}>
                      Peso Promedio p/ Serie (kg)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', padding: '4px 8px' }}>
                      <Timer size={14} style={{ color: 'var(--gray-400)', marginRight: '6px' }} />
                      <select
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', background: 'transparent' }}
                        value={averageWeight}
                        onChange={e => setAverageWeight(parseInt(e.target.value) || 10)}
                      >
                        <option value={5}>5 kg (Ligero / Mancuernas pequeñas)</option>
                        <option value={10}>10 kg (Moderado bajo)</option>
                        <option value={15}>15 kg (Moderado)</option>
                        <option value={20}>20 kg (Moderado / Barra vacía)</option>
                        <option value={30}>30 kg (Moderado alto)</option>
                        <option value={40}>40 kg (Pesado)</option>
                        <option value={65}>65 kg (Muy pesado)</option>
                        <option value={90}>90 kg (Elite)</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: '4px' }}>
                      Ritmo Cardíaco (BPM)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', padding: '4px 8px' }}>
                      <Heartbeat size={14} style={{ color: 'var(--gray-400)', marginRight: '6px' }} />
                      <input
                        type="number"
                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                        value={proposedHr}
                        min={60}
                        max={220}
                        onChange={e => setProposedHr(parseInt(e.target.value) || 140)}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: '12px', background: 'white', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Repeticiones Totales: <strong>{totalReps}</strong></span>
                  <span>Volumen Proyectado: <strong>{calculatedVolume} kg</strong></span>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm btn-full"
                  disabled={checking}
                  onClick={() => {
                    setChecking(true);
                    aiAPI.checkOverexertion(currentUser?.id, calculatedVolume, proposedHr)
                      .then(res => setCheckResult(res))
                      .catch(() => console.error("Error checking overexertion"))
                      .finally(() => setChecking(false));
                  }}
                >
                  {checking ? 'Analizando...' : 'Analizar Sesión con IA'}
                </button>

                {checkResult && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${checkResult.risk_level === 'Alto' ? '#fecaca' : checkResult.risk_level === 'Moderado' ? '#fef3c7' : '#d1fae5'}`,
                    background: checkResult.risk_level === 'Alto' ? '#fef2f2' : checkResult.risk_level === 'Moderado' ? '#fffbeb' : '#ecfdf5'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: checkResult.risk_level === 'Alto' ? '#ef4444' : checkResult.risk_level === 'Moderado' ? '#d97706' : '#059669' }}>
                        Riesgo {checkResult.risk_level}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-800)', marginBottom: '8px', lineHeight: '1.4' }}>
                      <strong>Diagnóstico:</strong> {checkResult.reason}
                    </div>
                    {checkResult.recommendations && checkResult.recommendations.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                        <strong style={{ display: 'block', marginBottom: '4px' }}>Recomendaciones:</strong>
                        <ul style={{ paddingLeft: '14px', margin: 0 }}>
                          {checkResult.recommendations.map((rec, i) => (
                            <li key={i} style={{ marginBottom: '2px' }}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <button
            className={`btn btn-full mt-4 ${fav ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => toggleFavorite(routine.id, 'routines')}
          >
            <Heart size={16} weight={fav ? 'fill' : 'regular'} />
            {fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function WarningModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="warning-modal" onClick={e => e.stopPropagation()}>
        <div className="warning-icon"><Warning size={56} weight="fill" color="#f59e0b" /></div>
        <h2>Contenido con advertencia</h2>
        <p>
          Al mostrar todos los ejercicios y rutinas, verás contenido que puede no ser
          adecuado para tus condiciones físicas. Los ejercicios no recomendados
          para ti serán marcados con el ícono <Warning size={14} weight="fill" color="#f59e0b" />.
        </p>
        <p>Consulta siempre con un profesional de la salud antes de iniciar cualquier rutina.</p>
        <div className="warning-actions">
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Entendido, mostrar todo</button>
        </div>
      </div>
    </div>
  );
}
