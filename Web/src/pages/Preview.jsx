import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Barbell, Notebook } from '@phosphor-icons/react';
import ExerciseCard from '../components/Cards/ExerciseCard';
import RoutineCard from '../components/Cards/RoutineCard';
import FilterBar from '../components/Filters/FilterBar';
import { ExerciseModal, RoutineModal } from '../components/Modals/Modals';
import { useData } from '../context/DataContext';
import './Preview.css';

export default function Preview() {
  const { exercises, routines } = useData();
  const [exFilters, setExFilters] = useState({});
  const [rtFilters, setRtFilters] = useState({});
  const [selectedEx, setSelectedEx] = useState(null);
  const [selectedRt, setSelectedRt] = useState(null);
  const [tab, setTab] = useState('exercises');

  const handleExFilter = (key, val) => {
    if (key === '__clear__') { setExFilters({}); return; }
    setExFilters(p => ({ ...p, [key]: val }));
  };
  const handleRtFilter = (key, val) => {
    if (key === '__clear__') { setRtFilters({}); return; }
    setRtFilters(p => ({ ...p, [key]: val }));
  };

  const filteredEx = exercises.filter(e => {
    if (exFilters.muscleGroup && e.muscleGroup !== exFilters.muscleGroup) return false;
    if (exFilters.bodyArea && e.bodyArea !== exFilters.bodyArea) return false;
    if (exFilters.difficulty && e.difficulty !== exFilters.difficulty) return false;
    if (exFilters.search) {
      const q = exFilters.search.toLowerCase();
      if (!e.name.toLowerCase().includes(q) && !e.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  }).map(e => ({ ...e, isSafe: true }));

  const filteredRt = routines.filter(r => {
    if (rtFilters.category && r.category !== rtFilters.category) return false;
    if (rtFilters.level && r.level !== rtFilters.level) return false;
    if (rtFilters.search) {
      const q = rtFilters.search.toLowerCase();
      if (!r.name.toLowerCase().includes(q) && !r.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  }).map(r => ({ ...r, isSafe: true }));

  return (
    <div className="preview-page bg-mesh">
      <div className="preview-banner">
        <span><Eye size={16} weight="bold" /> Modo de vista previa — <strong>Solo para uso interno</strong></span>
        <div className="preview-banner-actions">
          <Link to="/login" className="btn btn-sm" style={{ background:'white', color:'var(--blue-primary)', fontWeight:700 }}>Iniciar sesión</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Registrarse</Link>
        </div>
      </div>

      <div className="preview-header">
        <div className="preview-logo"><Barbell size={28} weight="bold" /> <span>maxercise</span></div>
        <p className="preview-sub">Vista previa completa del contenido</p>
      </div>

      <div className="container" style={{ paddingTop:'20px' }}>
        <div className="fav-tabs">
          <button className={`fav-tab ${tab === 'exercises' ? 'active' : ''}`} onClick={() => setTab('exercises')}>
            <Barbell size={16} weight="bold" /> Ejercicios <span className="fav-count">{filteredEx.length}</span>
          </button>
          <button className={`fav-tab ${tab === 'routines' ? 'active' : ''}`} onClick={() => setTab('routines')}>
            <Notebook size={16} weight="bold" /> Rutinas <span className="fav-count">{filteredRt.length}</span>
          </button>
        </div>

        {tab === 'exercises' && (
          <>
            <FilterBar mode="exercises" filters={exFilters} onChange={handleExFilter} />
            <div className="grid-auto">{filteredEx.map(e => <ExerciseCard key={e.id} exercise={e} onClick={setSelectedEx} />)}</div>
          </>
        )}
        {tab === 'routines' && (
          <>
            <FilterBar mode="routines" filters={rtFilters} onChange={handleRtFilter} />
            <div className="grid-auto">{filteredRt.map(r => <RoutineCard key={r.id} routine={r} onClick={setSelectedRt} />)}</div>
          </>
        )}
      </div>

      {selectedEx && <ExerciseModal exercise={selectedEx} onClose={() => setSelectedEx(null)} />}
      {selectedRt && <RoutineModal routine={selectedRt} onClose={() => setSelectedRt(null)} />}
    </div>
  );
}
