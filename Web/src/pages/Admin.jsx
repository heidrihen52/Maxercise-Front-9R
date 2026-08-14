import { useState, useEffect } from 'react';
import { Plus, Notebook, Barbell, FolderOpen, PencilSimpleLine, Users, ShieldCheck,
         BookOpen, PencilLine, Trash, X, Check, Eye, House, SignOut, CaretRight,
         ListBullets, Rows, Brain, HeartBreak, Pulse } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { adminAPI, aiAPI } from '../services/api';
import './Admin.css';

const ROUTINE_CATS = [
  { id:'upper', label:'Tren superior' }, { id:'lower', label:'Tren inferior' },
  { id:'core', label:'Core' }, { id:'full_body', label:'Cuerpo completo' },
  { id:'cardio', label:'Cardio' }, { id:'mobility', label:'Movilidad' },
];

const emptyEx = { name:'', description:'', instructions:'', muscleGroup:'chest', bodyArea:'upper', difficulty:'beginner', equipment:'', image:'' };
const emptyRt = { name:'', description:'', level:'beginner', duration:'', frequency:'', category:'full_body', image:'', selectedExercises:[] };

// ─── Inline Edit Form ─────────────────────────────────────────

function EditExerciseForm({ item, onSave, onCancel }) {
  const { metadata } = useData();
  const MUSCLE_GROUPS = metadata?.muscleGroups || [];
  const DIFFICULTY_LEVELS = metadata?.difficultyLevels || [];

  const [form, setForm] = useState({
    name: item.name || item.title || '',
    description: item.description || '',
    instructions: item.instructions || (item.steps ? item.steps[0] : ''),
    muscleGroup: item.muscleGroup || item.muscle_group || 'chest',
    bodyArea: item.bodyArea || item.body_area || 'upper',
    difficulty: item.difficulty || 'beginner',
    equipment: item.equipment || '',
    image: item.image || '',
  });
  return (
    <div className="admin-edit-form">
      <div className="form-group"><label className="form-label">Nombre *</label>
        <input className="form-input" value={form.name} onChange={e => setForm(p => ({...p, name:e.target.value}))} /></div>
      <div className="form-group"><label className="form-label">Descripción *</label>
        <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(p => ({...p, description:e.target.value}))} /></div>
      <div className="form-group"><label className="form-label">Instrucciones *</label>
        <textarea className="form-input" rows={2} value={form.instructions} onChange={e => setForm(p => ({...p, instructions:e.target.value}))} /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Grupo muscular</label>
          <select className="form-input" value={form.muscleGroup} onChange={e => setForm(p => ({...p, muscleGroup:e.target.value}))}>
            {MUSCLE_GROUPS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select></div>
        <div className="form-group"><label className="form-label">Dificultad</label>
          <select className="form-input" value={form.difficulty} onChange={e => setForm(p => ({...p, difficulty:e.target.value}))}>
            {DIFFICULTY_LEVELS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select></div>
      </div>
      <div className="form-group"><label className="form-label">Equipo</label>
        <input className="form-input" value={form.equipment} onChange={e => setForm(p => ({...p, equipment:e.target.value}))} /></div>
      <div className="form-group"><label className="form-label">URL imagen</label>
        <input className="form-input" value={form.image} onChange={e => setForm(p => ({...p, image:e.target.value}))} /></div>
      <div className="admin-edit-actions">
        <button className="btn btn-primary btn-sm" onClick={() => onSave(form)}>
          <Check size={14} weight="bold" /> Guardar cambios
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>
          <X size={14} weight="bold" /> Cancelar
        </button>
      </div>
    </div>
  );
}

function EditRoutineForm({ item, associationRules = [], onSave, onCancel }) {
  const { exercises, metadata } = useData();
  const DIFFICULTY_LEVELS = metadata?.difficultyLevels || [];
  const allExercises = exercises || [];

  const [form, setForm] = useState({
    name: item.name || '',
    description: item.description || '',
    level: item.level || 'beginner',
    duration: item.duration || '',
    frequency: item.frequency || '',
    category: item.category || 'full_body',
    image: item.image || '',
    selectedExercises: (item.exercises || []).map(re => {
      const ex = allExercises.find(e => e.id === (re.exercise_id || re.exerciseId || re));
      return {
        exercise_id: re.exercise_id || re.exerciseId || re,
        name: ex ? ex.name : 'Ejercicio no encontrado',
        reps: re.reps || 10,
        sets: re.sets || 3,
        day_number: re.day_number || 1
      };
    })
  });
  return (
    <div className="admin-edit-form">
      <div className="form-group"><label className="form-label">Nombre *</label>
        <input className="form-input" value={form.name} onChange={e => setForm(p => ({...p, name:e.target.value}))} /></div>
      <div className="form-group"><label className="form-label">Descripción *</label>
        <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm(p => ({...p, description:e.target.value}))} /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Nivel</label>
          <select className="form-input" value={form.level} onChange={e => setForm(p => ({...p, level:e.target.value}))}>
            {DIFFICULTY_LEVELS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select></div>
        <div className="form-group"><label className="form-label">Categoría</label>
          <select className="form-input" value={form.category} onChange={e => setForm(p => ({...p, category:e.target.value}))}>
            {ROUTINE_CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Duración</label>
          <input className="form-input" value={form.duration} onChange={e => setForm(p => ({...p, duration:e.target.value}))} placeholder="Ej: 45 min" /></div>
        <div className="form-group"><label className="form-label">Frecuencia</label>
          <input className="form-input" value={form.frequency} onChange={e => setForm(p => ({...p, frequency:e.target.value}))} placeholder="Ej: 3x/semana" /></div>
      </div>
      <div className="form-group"><label className="form-label">URL imagen</label>
        <input className="form-input" value={form.image} onChange={e => setForm(p => ({...p, image:e.target.value}))} /></div>
      
      <div className="form-group" style={{ marginTop: '0.75rem' }}>
        <label className="form-label">Ejercicios en esta rutina ({form.selectedExercises.length})</label>
        <select
          className="form-input"
          defaultValue=""
          onChange={(e) => {
            const exId = parseInt(e.target.value);
            if (exId) {
              const ex = allExercises.find(ex => ex.id === exId);
              if (ex && !form.selectedExercises.some(se => se.exercise_id === exId)) {
                setForm(p => ({
                  ...p,
                  selectedExercises: [
                    ...p.selectedExercises,
                    { exercise_id: exId, name: ex.name, reps: 10, sets: 3, day_number: 1 }
                  ]
                }));
              }
              e.target.value = "";
            }
          }}
        >
          <option value="" disabled>-- Selecciona un ejercicio para añadir --</option>
          {allExercises.map(ex => (
            <option key={ex.id} value={ex.id} disabled={form.selectedExercises.some(se => se.exercise_id === ex.id)}>
              {ex.name}
            </option>
          ))}
        </select>

        {/* 💡 Sugerencias de IA (Market Basket / Reglas de Asociación) */}
        {associationRules.length > 0 && (
          <div className="ai-suggestions-panel" style={{
            marginTop: '10px',
            padding: '12px',
            background: 'var(--blue-pale)',
            border: '1px dashed var(--blue-primary)',
            borderRadius: 'var(--radius-md)'
          }}>
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--blue-primary)', margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700 }}>
              <Brain size={16} weight="fill" /> Sugerencias de Asociación (IA)
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {associationRules
                .filter(rule => {
                  if (form.selectedExercises.length === 0) return true;
                  return form.selectedExercises.some(se => se.exercise_id === rule.antecedent_id);
                })
                .slice(0, 3)
                .map((rule, index) => {
                  const ant = allExercises.find(e => e.id === rule.antecedent_id);
                  const cons = allExercises.find(e => e.id === rule.consequent_id);
                  if (!ant || !cons) return null;
                  const isAlreadySelected = form.selectedExercises.some(se => se.exercise_id === cons.id);

                  return (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'white',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(26, 111, 212, 0.15)',
                      fontSize: '0.8rem'
                    }}>
                      <span style={{ color: 'var(--gray-700)' }}>
                        Frecuente con <strong>{ant?.name}</strong>: <strong>{cons?.name}</strong> (Confianza: {Math.round(rule.confidence * 100)}%)
                      </span>
                      {!isAlreadySelected && (
                        <button
                          type="button"
                          className="btn btn-primary btn-xs"
                          style={{ padding: '2px 8px', fontSize: '0.75rem', height: '24px', display: 'flex', alignItems: 'center' }}
                          onClick={() => {
                            setForm(p => ({
                              ...p,
                              selectedExercises: [
                                ...p.selectedExercises,
                                { exercise_id: cons.id, name: cons.name, reps: 10, sets: 3, day_number: 1 }
                              ]
                            }));
                          }}
                        >
                          + Añadir
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {form.selectedExercises.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--gray-50)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', marginTop: '8px' }}>
            {form.selectedExercises.map((se, idx) => (
              <div key={se.exercise_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: 'white', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-100)', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', flex: 1, minWidth: '130px' }}>{se.name}</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Sets:</span>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '45px', padding: '4px', fontSize: '0.8rem', textAlign: 'center' }}
                      value={se.sets}
                      min={1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setForm(p => {
                          const updated = [...p.selectedExercises];
                          updated[idx] = { ...updated[idx], sets: val };
                          return { ...p, selectedExercises: updated };
                        });
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Reps:</span>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '45px', padding: '4px', fontSize: '0.8rem', textAlign: 'center' }}
                      value={se.reps}
                      min={1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setForm(p => {
                          const updated = [...p.selectedExercises];
                          updated[idx] = { ...updated[idx], reps: val };
                          return { ...p, selectedExercises: updated };
                        });
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Día:</span>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '45px', padding: '4px', fontSize: '0.8rem', textAlign: 'center' }}
                      value={se.day_number}
                      min={1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setForm(p => {
                          const updated = [...p.selectedExercises];
                          updated[idx] = { ...updated[idx], day_number: val };
                          return { ...p, selectedExercises: updated };
                        });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)', padding: '2px 4px', fontSize: '0.75rem' }}
                    onClick={() => {
                      setForm(p => ({
                        ...p,
                        selectedExercises: p.selectedExercises.filter(item => item.exercise_id !== se.exercise_id)
                      }));
                    }}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-edit-actions">
        <button className="btn btn-primary btn-sm" onClick={() => onSave(form)}>
          <Check size={14} weight="bold" /> Guardar cambios
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>
          <X size={14} weight="bold" /> Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function Admin() {
  const { exercises, routines, metadata, saveAdminItem, deleteAdminItem, updateAdminItem } = useData();
  const MUSCLE_GROUPS = metadata?.muscleGroups || [];
  const BODY_AREAS = metadata?.bodyAreas || [];
  const DIFFICULTY_LEVELS = metadata?.difficultyLevels || [];
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('create-exercise');
  const [exForm, setExForm] = useState(emptyEx);
  const [rtForm, setRtForm] = useState(emptyRt);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [churnData, setChurnData] = useState([]);
  const [anomaliesData, setAnomaliesData] = useState([]);
  const [associationRules, setAssociationRules] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [editingId, setEditingId] = useState(null); // id del item en edición

  const flash = (m, type = 'success') => { setMsg(m); setMsgType(type); setTimeout(() => setMsg(''), 3500); };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    adminAPI.getUsers()
      .then(data => setUsers(Array.isArray(data) ? data : (data.users || [])))
      .catch(() => flash('Error cargando usuarios', 'error'))
      .finally(() => setLoadingUsers(false));
  }, []);

  useEffect(() => {
    if (tab === 'churn') {
      Promise.resolve().then(() => setLoadingAI(true));
      aiAPI.getChurnPrediction()
        .then(data => setChurnData(data.predictions || []))
        .catch(() => flash('Error cargando predicciones de deserción', 'error'))
        .finally(() => setLoadingAI(false));
    }
    if (tab === 'anomalies') {
      Promise.resolve().then(() => setLoadingAI(true));
      aiAPI.getBiometricAnomalies()
        .then(data => setAnomaliesData(data.anomalies || []))
        .catch(() => flash('Error cargando anomalías biométricas', 'error'))
        .finally(() => setLoadingAI(false));
    }
    if ((tab === 'create-routine' || tab === 'my-routines') && associationRules.length === 0) {
      aiAPI.getAssociationRules()
        .then(data => setAssociationRules(data.rules || []))
        .catch(() => console.error('Error loading association rules'));
    }
  }, [tab, associationRules.length]);

  const saveEx = async (e) => {
    e.preventDefault();
    if (!exForm.name || !exForm.description || !exForm.instructions) return;
    try {
      await saveAdminItem({ ...exForm, title: exForm.name, muscleIds: !isNaN(parseInt(exForm.muscleGroup)) ? JSON.stringify([parseInt(exForm.muscleGroup)]) : "[]", restrictions: "[]", tags: [], steps: [exForm.instructions], isSafe: true }, 'exercises');
      setExForm(emptyEx);
      flash('Ejercicio creado y guardado en la base de datos');
    } catch (err) { flash(err.message, 'error'); }
  };

  const saveRt = async (e) => {
    e.preventDefault();
    if (!rtForm.name || !rtForm.description) return;
    
    const difficultyMap = { beginner: 'PRINCIPIANTE', intermediate: 'INTERMEDIO', advanced: 'AVANZADO' };
    const bodyTypeMap = { full_body: 'MESOMORFO', split: 'ECTOMORFO', upper: 'ENDOMORFO', lower: 'MESOMORFO', hiit: 'ECTOMORFO' };
    
    try {
      await saveAdminItem({ 
        ...rtForm, 
        title: rtForm.name,
        difficulty: difficultyMap[rtForm.level] || 'PRINCIPIANTE',
        body_type: bodyTypeMap[rtForm.category] || 'MESOMORFO',
        exercises: JSON.stringify(rtForm.selectedExercises.map((se, idx) => ({
          exercise_id: se.exercise_id,
          reps: se.reps,
          sets: se.sets,
          day_number: se.day_number,
          order: idx + 1
        }))), 
        restrictions: [], 
        tags: [], 
        muscleGroups: [], 
        isSafe: true 
      }, 'routines');
      setRtForm(emptyRt);
      flash('Rutina creada y guardada en la base de datos');
    } catch (err) { flash(err.message, 'error'); }
  };

  const handleUpdateEx = async (id, form) => {
    try {
      await updateAdminItem(id, { ...form, title: form.name, muscleIds: !isNaN(parseInt(form.muscleGroup)) ? JSON.stringify([parseInt(form.muscleGroup)]) : "[]", restrictions: "[]", steps: [form.instructions] }, 'exercises');
      setEditingId(null);
      flash('Ejercicio actualizado correctamente');
    } catch (err) { flash(err.message, 'error'); }
  };

  const handleUpdateRt = async (id, form) => {
    const difficultyMap = { beginner: 'PRINCIPIANTE', intermediate: 'INTERMEDIO', advanced: 'AVANZADO' };
    const bodyTypeMap = { full_body: 'MESOMORFO', split: 'ECTOMORFO', upper: 'ENDOMORFO', lower: 'MESOMORFO', hiit: 'ECTOMORFO' };
    try {
      await updateAdminItem(id, { 
        ...form, 
        title: form.name,
        difficulty: difficultyMap[form.level] || 'PRINCIPIANTE',
        body_type: bodyTypeMap[form.category] || 'MESOMORFO',
        exercises: JSON.stringify(form.selectedExercises.map((se, idx) => ({
          exercise_id: se.exercise_id,
          reps: se.reps,
          sets: se.sets,
          day_number: se.day_number,
          order: idx + 1
        })))
      }, 'routines');
      setEditingId(null);
      flash('Rutina actualizada correctamente');
    } catch (err) { flash(err.message, 'error'); }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('¿Seguro que deseas eliminar este elemento?')) return;
    try {
      await deleteAdminItem(id, type);
      flash(`Eliminado correctamente`);
    } catch (err) { flash(err.message, 'error'); }
  };

  const TABS = [
    { id:'create-exercise', icon:<Plus size={16} weight="bold" />, label:'Nuevo ejercicio' },
    { id:'create-routine', icon:<Notebook size={16} weight="bold" />, label:'Nueva rutina' },
    { id:'my-exercises', icon:<Barbell size={16} weight="bold" />, label:'Mis ejercicios' },
    { id:'my-routines', icon:<FolderOpen size={16} weight="bold" />, label:'Mis rutinas' },
    { id:'catalogue-ex', icon:<BookOpen size={16} weight="bold" />, label:'Catálogo ejercicios' },
    { id:'catalogue-rt', icon:<Eye size={16} weight="bold" />, label:'Catálogo rutinas' },
    { id:'users', icon:<Users size={16} weight="bold" />, label:'Usuarios' },
    { id:'churn', icon:<HeartBreak size={16} weight="bold" />, label:'Deserción (IA)' },
    { id:'anomalies', icon:<Pulse size={16} weight="bold" />, label:'Anomalías (IA)' },
  ];

  // Catálogo completo
  const allExercises = exercises || [];
  const allRoutines = routines || [];

  return (
    <div className="admin-page">
      {/* ── Breadcrumbs ── */}
      <div className="admin-breadcrumbs">
        <div className="admin-breadcrumbs-inner">
          <Link to="/" className="admin-bc-link"><House size={14} weight="bold" /> Inicio</Link>
          <CaretRight size={12} className="admin-bc-sep" />
          <span className="admin-bc-current">Panel de Administrador</span>
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>
          <SignOut size={15} weight="bold" /> Cerrar sesión
        </button>
      </div>

      {/* ── Header ── */}
      <div className="admin-header">
        <div className="admin-logo"><Barbell size={28} weight="bold" /> <span>maxercise</span></div>
        <h1>Panel de Administrador</h1>
        <p>Sesión como <strong>{currentUser?.name}</strong> · Rol: <span style={{color:'rgba(255,255,255,0.7)'}}>{currentUser?.role}</span></p>
        <div style={{marginTop:'0.75rem', display:'flex', gap:'0.5rem', justifyContent:'center', flexWrap:'wrap'}}>
          <Link to="/home" className="btn btn-ghost btn-sm" style={{color:'white', borderColor:'rgba(255,255,255,0.3)'}}>
            <House size={14} weight="bold" /> Ir al inicio
          </Link>
          <Link to="/exercises" className="btn btn-ghost btn-sm" style={{color:'white', borderColor:'rgba(255,255,255,0.3)'}}>
            <Barbell size={14} weight="bold" /> Ver ejercicios
          </Link>
          <Link to="/routines" className="btn btn-ghost btn-sm" style={{color:'white', borderColor:'rgba(255,255,255,0.3)'}}>
            <ListBullets size={14} weight="bold" /> Ver rutinas
          </Link>
        </div>
      </div>

      {msg && <div className={`admin-flash ${msgType === 'error' ? 'admin-flash-error' : ''}`}>{msg}</div>}

      <div className="admin-container">
        <aside className="admin-sidebar">
          {TABS.map(t => (
            <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => { setTab(t.id); setEditingId(null); }}>
              {t.icon} {t.label}
            </button>
          ))}
        </aside>

        <main className="admin-main">
          <div className="admin-main-inner">

          {/* ── CREAR EJERCICIO ── */}
          {tab === 'create-exercise' && (
            <form onSubmit={saveEx} className="admin-form">
              <h2><Plus size={18} weight="bold" /> Crear ejercicio</h2>
              <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={exForm.name} onChange={e => setExForm(p => ({...p, name:e.target.value}))} required placeholder="Ej: Press de Banca" /></div>
              <div className="form-group"><label className="form-label">Descripción *</label><textarea className="form-input" rows={3} value={exForm.description} onChange={e => setExForm(p => ({...p, description:e.target.value}))} required placeholder="Describe el ejercicio..." /></div>
              <div className="form-group"><label className="form-label">Instrucciones *</label><textarea className="form-input" rows={3} value={exForm.instructions} onChange={e => setExForm(p => ({...p, instructions:e.target.value}))} required placeholder="Pasos para realizar el ejercicio..." /></div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Grupo muscular</label>
                  <select className="form-input" value={exForm.muscleGroup} onChange={e => setExForm(p => ({...p, muscleGroup:e.target.value}))}>
                    {MUSCLE_GROUPS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Área corporal</label>
                  <select className="form-input" value={exForm.bodyArea} onChange={e => setExForm(p => ({...p, bodyArea:e.target.value}))}>
                    {BODY_AREAS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Dificultad</label>
                  <select className="form-input" value={exForm.difficulty} onChange={e => setExForm(p => ({...p, difficulty:e.target.value}))}>
                    {DIFFICULTY_LEVELS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Equipo necesario</label><input className="form-input" value={exForm.equipment} onChange={e => setExForm(p => ({...p, equipment:e.target.value}))} placeholder="Ej: mancuernas, banco" /></div>
              <div className="form-group"><label className="form-label">URL de imagen (opcional)</label><input className="form-input" value={exForm.image} onChange={e => setExForm(p => ({...p, image:e.target.value}))} placeholder="https://..." /></div>
              <button type="submit" className="btn btn-primary">Guardar ejercicio</button>
            </form>
          )}

          {/* ── CREAR RUTINA ── */}
          {tab === 'create-routine' && (
            <form onSubmit={saveRt} className="admin-form">
              <h2><Notebook size={18} weight="bold" /> Crear rutina</h2>
              <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={rtForm.name} onChange={e => setRtForm(p => ({...p, name:e.target.value}))} required placeholder="Ej: Mi rutina de pecho" /></div>
              <div className="form-group"><label className="form-label">Descripción *</label><textarea className="form-input" rows={3} value={rtForm.description} onChange={e => setRtForm(p => ({...p, description:e.target.value}))} required placeholder="Describe la rutina..." /></div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nivel</label>
                  <select className="form-input" value={rtForm.level} onChange={e => setRtForm(p => ({...p, level:e.target.value}))}>
                    {DIFFICULTY_LEVELS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select className="form-input" value={rtForm.category} onChange={e => setRtForm(p => ({...p, category:e.target.value}))}>
                    {ROUTINE_CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Duración</label><input className="form-input" value={rtForm.duration} onChange={e => setRtForm(p => ({...p, duration:e.target.value}))} placeholder="Ej: 45 min" /></div>
                <div className="form-group"><label className="form-label">Frecuencia</label><input className="form-input" value={rtForm.frequency} onChange={e => setRtForm(p => ({...p, frequency:e.target.value}))} placeholder="Ej: 3x/semana" /></div>
              </div>
              <div className="form-group"><label className="form-label">URL de imagen (opcional)</label><input className="form-input" value={rtForm.image} onChange={e => setRtForm(p => ({...p, image:e.target.value}))} placeholder="https://..." /></div>
              
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" style={{ fontSize: '1rem', color: 'var(--gray-800)' }}>
                  Ejercicios en esta rutina ({rtForm.selectedExercises.length})
                </label>
                <select
                  className="form-input"
                  defaultValue=""
                  onChange={(e) => {
                    const exId = parseInt(e.target.value);
                    if (exId) {
                      const ex = allExercises.find(ex => ex.id === exId);
                      if (ex && !rtForm.selectedExercises.some(se => se.exercise_id === exId)) {
                        setRtForm(p => ({
                          ...p,
                          selectedExercises: [
                            ...p.selectedExercises,
                            { exercise_id: exId, name: ex.name, reps: 10, sets: 3, day_number: 1 }
                          ]
                        }));
                      }
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="" disabled>-- Selecciona un ejercicio para añadir --</option>
                  {allExercises.map(ex => (
                    <option key={ex.id} value={ex.id} disabled={rtForm.selectedExercises.some(se => se.exercise_id === ex.id)}>
                      {ex.name}
                    </option>
                  ))}
                </select>

                {/* 💡 Sugerencias de IA (Market Basket / Reglas de Asociación) */}
                {associationRules.length > 0 && (
                  <div className="ai-suggestions-panel" style={{
                    marginTop: '10px',
                    padding: '12px',
                    background: 'var(--blue-pale)',
                    border: '1px dashed var(--blue-primary)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <h5 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--blue-primary)', margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700 }}>
                      <Brain size={16} weight="fill" /> Sugerencias de Asociación (IA)
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {associationRules
                        .filter(rule => {
                          if (rtForm.selectedExercises.length === 0) return true;
                          return rtForm.selectedExercises.some(se => se.exercise_id === rule.antecedent_id);
                        })
                        .slice(0, 3)
                        .map((rule, index) => {
                          const ant = allExercises.find(e => e.id === rule.antecedent_id);
                          const cons = allExercises.find(e => e.id === rule.consequent_id);
                          if (!ant || !cons) return null;
                          const isAlreadySelected = rtForm.selectedExercises.some(se => se.exercise_id === cons.id);

                          return (
                            <div key={index} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'white',
                              padding: '6px 10px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid rgba(26, 111, 212, 0.15)',
                              fontSize: '0.8rem'
                            }}>
                              <span style={{ color: 'var(--gray-700)' }}>
                                Frecuente con <strong>{ant?.name}</strong>: <strong>{cons?.name}</strong> (Confianza: {Math.round(rule.confidence * 100)}%)
                              </span>
                              {!isAlreadySelected && (
                                <button
                                  type="button"
                                  className="btn btn-primary btn-xs"
                                  style={{ padding: '2px 8px', fontSize: '0.75rem', height: '24px', display: 'flex', alignItems: 'center' }}
                                  onClick={() => {
                                    setRtForm(p => ({
                                      ...p,
                                      selectedExercises: [
                                        ...p.selectedExercises,
                                        { exercise_id: cons.id, name: cons.name, reps: 10, sets: 3, day_number: 1 }
                                      ]
                                    }));
                                  }}
                                >
                                  + Añadir
                                </button>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {rtForm.selectedExercises.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--gray-50)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', marginTop: '10px' }}>
                    {rtForm.selectedExercises.map((se, idx) => (
                      <div key={se.exercise_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', background: 'white', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-100)', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', flex: 1, minWidth: '150px' }}>{se.name}</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Series:</span>
                            <input
                              type="number"
                              className="form-input"
                              style={{ width: '55px', padding: '6px', fontSize: '0.85rem', textAlign: 'center' }}
                              value={se.sets}
                              min={1}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                setRtForm(p => {
                                  const updated = [...p.selectedExercises];
                                  updated[idx] = { ...updated[idx], sets: val };
                                  return { ...p, selectedExercises: updated };
                                });
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Reps:</span>
                            <input
                              type="number"
                              className="form-input"
                              style={{ width: '55px', padding: '6px', fontSize: '0.85rem', textAlign: 'center' }}
                              value={se.reps}
                              min={1}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                setRtForm(p => {
                                  const updated = [...p.selectedExercises];
                                  updated[idx] = { ...updated[idx], reps: val };
                                  return { ...p, selectedExercises: updated };
                                });
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Día:</span>
                            <input
                              type="number"
                              className="form-input"
                              style={{ width: '55px', padding: '6px', fontSize: '0.85rem', textAlign: 'center' }}
                              value={se.day_number}
                              min={1}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                setRtForm(p => {
                                  const updated = [...p.selectedExercises];
                                  updated[idx] = { ...updated[idx], day_number: val };
                                  return { ...p, selectedExercises: updated };
                                });
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger)', padding: '4px' }}
                            onClick={() => {
                              setRtForm(p => ({
                                ...p,
                                selectedExercises: p.selectedExercises.filter(item => item.exercise_id !== se.exercise_id)
                              }));
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary">Guardar rutina</button>
            </form>
          )}

          {/* ── MIS EJERCICIOS (editar / eliminar) ── */}
          {tab === 'my-exercises' && (
            <div>
              <h2><Barbell size={18} weight="bold" /> Mis ejercicios creados</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1rem'}}>
                {allExercises.filter(e => String(e.createdBy) === String(currentUser?.id)).length} ejercicio(s) creados por ti — puedes editarlos o eliminarlos
              </p>
              {allExercises.filter(e => String(e.createdBy) === String(currentUser?.id)).length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon"><PencilSimpleLine size={36} weight="light" /></div>
                  <h3>Aún no has creado ejercicios</h3>
                  <p>Ve a "Nuevo ejercicio" para añadir contenido</p>
                </div>
              ) : (
                <div className="admin-list">
                  {allExercises.filter(e => String(e.createdBy) === String(currentUser?.id)).map(ex => (
                    <div key={ex.id} className="admin-item-card">
                      <div className="admin-item-row">
                        <div className="admin-item-info">
                          <div className="admin-item-name">{ex.name}</div>
                          <div className="admin-item-meta">
                            {ex.muscleGroup || ex.muscle_group} · {ex.difficulty}
                            {ex.equipment && ` · ${ex.equipment}`}
                          </div>
                        </div>
                        <div className="admin-item-btns">
                          <button className="btn btn-secondary btn-sm"
                            onClick={() => setEditingId(editingId === ex.id ? null : ex.id)}>
                            <PencilLine size={13} weight="bold" />
                            {editingId === ex.id ? 'Cerrar' : 'Editar'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ex.id, 'exercises')}>
                            <Trash size={13} weight="bold" /> Eliminar
                          </button>
                        </div>
                      </div>
                      {editingId === ex.id && (
                        <EditExerciseForm
                          item={ex}
                          onSave={(form) => handleUpdateEx(ex.id, form)}
                          onCancel={() => setEditingId(null)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MIS RUTINAS (editar / eliminar) ── */}
          {tab === 'my-routines' && (
            <div>
              <h2><FolderOpen size={18} weight="bold" /> Mis rutinas creadas</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1rem'}}>
                {allRoutines.filter(r => String(r.createdBy) === String(currentUser?.id)).length} rutina(s) creadas por ti — puedes editarlas o eliminarlas
              </p>
              {allRoutines.filter(r => String(r.createdBy) === String(currentUser?.id)).length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon"><Notebook size={36} weight="light" /></div>
                  <h3>Aún no has creado rutinas</h3>
                  <p>Ve a "Nueva rutina" para añadir contenido</p>
                </div>
              ) : (
                <div className="admin-list">
                  {allRoutines.filter(r => String(r.createdBy) === String(currentUser?.id)).map(rt => (
                    <div key={rt.id} className="admin-item-card">
                      <div className="admin-item-row">
                        <div className="admin-item-info">
                          <div className="admin-item-name">{rt.name}</div>
                          <div className="admin-item-meta">
                            {rt.level} · {rt.duration || '—'} · {rt.frequency || '—'}
                          </div>
                        </div>
                        <div className="admin-item-btns">
                          <button className="btn btn-secondary btn-sm"
                            onClick={() => setEditingId(editingId === rt.id ? null : rt.id)}>
                            <PencilLine size={13} weight="bold" />
                            {editingId === rt.id ? 'Cerrar' : 'Editar'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rt.id, 'routines')}>
                            <Trash size={13} weight="bold" /> Eliminar
                          </button>
                        </div>
                      </div>
                      {editingId === rt.id && (
                        <EditRoutineForm
                          item={rt}
                          associationRules={associationRules}
                          onSave={(form) => handleUpdateRt(rt.id, form)}
                          onCancel={() => setEditingId(null)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CATÁLOGO EJERCICIOS (solo lectura del estático, edit del propio) ── */}
          {tab === 'catalogue-ex' && (
            <div>
              <h2><BookOpen size={18} weight="bold" /> Catálogo completo de ejercicios</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1rem'}}>
                {allExercises.length} ejercicios totales · los tuyos se pueden editar/eliminar
              </p>
              <div className="admin-list">
                {allExercises.map((ex, i) => {
                  const isOwn = ex.isAdminCreated || ex.is_admin_created;
                  return (
                    <div key={ex.id || i} className="admin-item-card">
                      <div className="admin-item-row">
                        <div className="admin-item-info">
                          <div className="admin-item-name" style={{display:'flex',alignItems:'center',gap:'6px'}}>
                            {isOwn && <span style={{fontSize:'0.7rem',background:'var(--accent-primary)',color:'white',borderRadius:4,padding:'1px 6px'}}>tuyo</span>}
                            {ex.name}
                          </div>
                          <div className="admin-item-meta">
                            {ex.muscleGroup || ex.muscle_group} · {ex.difficulty}
                            {ex.equipment && ` · ${ex.equipment}`}
                          </div>
                        </div>
                        {isOwn && (
                          <div className="admin-item-btns">
                            <button className="btn btn-secondary btn-sm"
                              onClick={() => setEditingId(editingId === ex.id ? null : ex.id)}>
                              <PencilLine size={13} weight="bold" />
                              {editingId === ex.id ? 'Cerrar' : 'Editar'}
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ex.id, 'exercises')}>
                              <Trash size={13} weight="bold" /> Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                      {isOwn && editingId === ex.id && (
                        <EditExerciseForm
                          item={ex}
                          onSave={(form) => handleUpdateEx(ex.id, form)}
                          onCancel={() => setEditingId(null)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── CATÁLOGO RUTINAS ── */}
          {tab === 'catalogue-rt' && (
            <div>
              <h2><Eye size={18} weight="bold" /> Catálogo completo de rutinas</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1rem'}}>
                {allRoutines.length} rutinas totales · las tuyas se pueden editar/eliminar
              </p>
              <div className="admin-list">
                {allRoutines.map((rt, i) => {
                  const isOwn = rt.isAdminCreated || rt.is_admin_created;
                  return (
                    <div key={rt.id || i} className="admin-item-card">
                      <div className="admin-item-row">
                        <div className="admin-item-info">
                          <div className="admin-item-name" style={{display:'flex',alignItems:'center',gap:'6px'}}>
                            {isOwn && <span style={{fontSize:'0.7rem',background:'var(--accent-primary)',color:'white',borderRadius:4,padding:'1px 6px'}}>tuya</span>}
                            {rt.name}
                          </div>
                          <div className="admin-item-meta">
                            {rt.level} · {rt.duration || '—'} · {rt.frequency || '—'}
                          </div>
                        </div>
                        {isOwn && (
                          <div className="admin-item-btns">
                            <button className="btn btn-secondary btn-sm"
                              onClick={() => setEditingId(editingId === rt.id ? null : rt.id)}>
                              <PencilLine size={13} weight="bold" />
                              {editingId === rt.id ? 'Cerrar' : 'Editar'}
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rt.id, 'routines')}>
                              <Trash size={13} weight="bold" /> Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                      {isOwn && editingId === rt.id && (
                        <EditRoutineForm
                          item={rt}
                          associationRules={associationRules}
                          onSave={(form) => handleUpdateRt(rt.id, form)}
                          onCancel={() => setEditingId(null)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── USUARIOS ── */}
          {tab === 'users' && (
            <div>
              <h2><Users size={18} weight="bold" /> Usuarios registrados</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1rem'}}>Total: {users.length} usuario(s)</p>
              {loadingUsers ? <div className="spinner" /> : (
                <div className="admin-list">
                  {users.map(u => (
                    <div key={u.id} className="admin-item-card">
                      <div className="admin-item-row">
                        <div className="admin-item-info">
                          <div className="admin-item-name" style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                            {u.role === 'SUPER' && <ShieldCheck size={16} style={{color:'var(--accent-primary)'}} weight="fill" />}
                            {u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim()}
                          </div>
                          <div className="admin-item-meta">
                            {u.email} · <span style={{color: u.role==='SUPER'?'var(--accent-primary)':'var(--text-muted)'}}>{u.role === 'SUPER' ? 'admin' : u.role}</span> · {new Date(u.created_at).toLocaleDateString('es-MX')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PREDICCIÓN DE DESERCIÓN (CHURN) ── */}
          {tab === 'churn' && (
            <div>
              <h2><HeartBreak size={18} weight="bold" /> Predicción de Deserción de Usuarios (IA)</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1rem'}}>
                Detecta de forma preventiva a los usuarios que corren riesgo de abandonar el entrenamiento.
              </p>
              {loadingAI ? <div className="spinner" /> : (
                <div className="admin-list">
                  {churnData.length === 0 ? (
                    <div className="empty-state"><h3>No hay registros suficientes</h3><p>Registra entrenamientos en la app para calcular predicciones.</p></div>
                  ) : (
                    churnData.map(c => {
                      const userObj = users.find(u => u.id === c.user_id);
                      const userName = userObj ? (userObj.name || `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim()) : `Usuario #${c.user_id}`;
                      const userEmail = userObj?.email || '';
                      
                      const barColor = c.risk_level === 'Alto' ? '#ef4444' : c.risk_level === 'Medio' ? '#f59e0b' : '#10b981';
                      const badgeBg = c.risk_level === 'Alto' ? 'rgba(239,68,68,0.1)' : c.risk_level === 'Medio' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)';

                      return (
                        <div key={c.user_id} className="admin-item-card ai-card">
                          <div className="admin-item-row" style={{alignItems:'flex-start'}}>
                            <div className="admin-item-info" style={{flex: 1}}>
                              <div className="admin-item-name">{userName}</div>
                              <div className="admin-item-meta">{userEmail}</div>
                              <div style={{marginTop:'0.75rem', fontSize:'0.8rem', color:'var(--text-muted)'}}>
                                <strong>Diagnóstico:</strong> {c.primary_reason}
                              </div>
                            </div>
                            <div style={{textAlign:'right', minWidth:'150px'}}>
                              <span style={{
                                display:'inline-block',
                                padding:'3px 8px',
                                borderRadius:'6px',
                                fontSize:'0.75rem',
                                fontWeight: 700,
                                color: barColor,
                                background: badgeBg,
                                textTransform: 'uppercase',
                                marginBottom:'0.5rem'
                              }}>
                                Riesgo {c.risk_level}
                              </span>
                              <div style={{display:'flex', alignItems:'center', gap:'0.5rem', justifyContent:'flex-end'}}>
                                <span style={{fontSize:'0.8rem', fontWeight:600}}>{Math.round(c.churn_probability * 100)}%</span>
                                <div style={{width:'80px', height:'6px', background:'var(--gray-200)', borderRadius:'3px', overflow:'hidden'}}>
                                  <div style={{width: `${c.churn_probability * 100}%`, height:'100%', background: barColor}} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── ANOMALÍAS BIOMÉTRICAS ── */}
          {tab === 'anomalies' && (
            <div>
              <h2><Pulse size={18} weight="bold" /> Anomalías Biométricas y Fallas de Lectura (IA)</h2>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem',marginBottom:'1rem'}}>
                Monitorea en tiempo real lecturas fisiológicas atípicas o fallas de sensores wearables.
              </p>
              {loadingAI ? <div className="spinner" /> : (
                <div className="admin-list">
                  {anomaliesData.length === 0 ? (
                    <div className="empty-state"><h3>Sin anomalías registradas</h3><p>Todos los registros biométricos están dentro del rango estándar.</p></div>
                  ) : (
                    anomaliesData.map(a => {
                      const userObj = users.find(u => u.id === a.user_id);
                      const userName = userObj ? (userObj.name || `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim()) : `Usuario #${a.user_id}`;
                      
                      return (
                        <div key={a.id} className="admin-item-card ai-card error-card">
                          <div className="admin-item-row">
                            <div className="admin-item-info">
                              <div className="admin-item-name" style={{color:'#ef4444', fontWeight:700}}>{a.reason}</div>
                              <div className="admin-item-meta" style={{marginTop:'0.25rem'}}>
                                Registrado por: <strong>{userName}</strong> · ID Lectura: #{a.id}
                              </div>
                              <div style={{marginTop:'0.5rem', display:'flex', gap:'1rem', flexWrap:'wrap', fontSize:'0.8rem'}}>
                                <div className="biometric-stat" style={{color:'var(--gray-700)', background:'var(--gray-100)', padding:'2px 8px', borderRadius:'4px'}}>❤️ {a.heart_rate} BPM</div>
                                <div className="biometric-stat" style={{color:'var(--gray-700)', background:'var(--gray-100)', padding:'2px 8px', borderRadius:'4px'}}>🔥 {a.calories} Kcal</div>
                                <div className="biometric-stat" style={{color:'var(--gray-700)', background:'var(--gray-100)', padding:'2px 8px', borderRadius:'4px'}}>⏱️ {a.duration_minutes} min</div>
                              </div>
                            </div>
                            <div style={{textAlign:'right'}}>
                              <div style={{fontSize:'0.7rem', color:'var(--text-muted)', textTransform:'uppercase'}}>Puntaje Anomalía</div>
                              <div style={{fontSize:'1.1rem', fontWeight:800, color:'#ef4444'}}>{Math.round(a.anomaly_score * 100) / 100}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          </div>
        </main>
      </div>
    </div>
  );
}
