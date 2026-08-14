import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Barbell, Notebook, CheckCircle, Warning, ArrowRight, MagnifyingGlass } from '@phosphor-icons/react';
import Header from '../components/Layout/Header';
import Breadcrumbs from '../components/Layout/Breadcrumbs';
import ExerciseCard from '../components/Cards/ExerciseCard';
import RoutineCard from '../components/Cards/RoutineCard';
import FilterBar from '../components/Filters/FilterBar';
import { ExerciseModal, RoutineModal, WarningModal } from '../components/Modals/Modals';
import { useFilter } from '../hooks/useFilter';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const GOAL_ICONS = {
  lose_weight: <Warning size={16} weight="fill" />,
  gain_muscle: <Barbell size={16} weight="bold" />,
  stay_fit: <CheckCircle size={16} weight="fill" />,
  flexibility: <CheckCircle size={16} weight="fill" />,
  health: <CheckCircle size={16} weight="fill" />,
};
const GOAL_TEXT = {
  lose_weight: 'Tu objetivo: Perder peso — cardio y circuitos priorizados',
  gain_muscle: 'Tu objetivo: Ganar músculo — ejercicios de fuerza priorizados',
  stay_fit: 'Tu objetivo: Mantenerte en forma — rutinas equilibradas para ti',
  flexibility: 'Tu objetivo: Flexibilidad — yoga y movilidad priorizados',
  health: 'Tu objetivo: Salud general — contenido seguro y variado',
};

export default function Home() {
  const { userProfile } = useAuth();
  const { showAll, setShowAll } = useData();
  const { getFilteredExercises, getFilteredRoutines } = useFilter();
  const [exFilters, setExFilters] = useState({});
  const [rtFilters, setRtFilters] = useState({});
  const [selectedEx, setSelectedEx] = useState(null);
  const [selectedRt, setSelectedRt] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  const handleExFilter = (key, val) => {
    if (key === '__clear__') { setExFilters({}); return; }
    setExFilters(p => ({ ...p, [key]: val }));
  };
  const handleRtFilter = (key, val) => {
    if (key === '__clear__') { setRtFilters({}); return; }
    setRtFilters(p => ({ ...p, [key]: val }));
  };

  const exercises = getFilteredExercises(exFilters).slice(0, 12);
  const routines = getFilteredRoutines(rtFilters).slice(0, 8);
  const goal = userProfile?.goal;

  return (
    <div className="home-page bg-mesh">
      <Header />
      <div className="page-content">
        <div className="container">
          <Breadcrumbs />

          <div className="home-welcome">
            <div className="welcome-text">
              <h1 className="home-title">Bienvenido a <span className="gradient-text">Maxercise</span></h1>
              {userProfile && goal && GOAL_TEXT[goal] && (
                <div className="alert-banner info welcome-goal">
                  {GOAL_ICONS[goal]} {GOAL_TEXT[goal]}
                </div>
              )}
            </div>
            <div className="show-all-toggle">
              <span className="toggle-label">
                {showAll
                  ? <><Warning size={15} weight="fill" style={{color:'#f59e0b'}} /> Mostrando todo el contenido</>
                  : <><CheckCircle size={15} weight="fill" style={{color:'#22c55e'}} /> Solo contenido seguro</>
                }
              </span>
              <button
                className={`toggle-btn ${showAll ? 'all' : 'safe'}`}
                onClick={() => showAll ? setShowAll(false) : setShowWarning(true)}
              >
                {showAll ? 'Filtro seguro' : 'Ver todo'}
              </button>
            </div>
          </div>

          {!showAll && (
            <div className="alert-banner info mb-6">
              <CheckCircle size={15} weight="fill" /> Estás viendo solo el contenido recomendado para ti.{' '}
              <button className="link-btn" onClick={() => setShowWarning(true)}>Ver todo</button>
            </div>
          )}

          {/* EJERCICIOS */}
          <section className="home-section">
            <div className="section-header-row">
              <div>
                <h2 className="section-title"><Barbell size={22} weight="bold" /> Ejercicios</h2>
                <p className="section-subtitle">{exercises.length} ejercicios que se adaptan a tu perfil</p>
              </div>
              <Link to="/exercises" className="btn btn-secondary btn-sm">
                Ver todos <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
            <FilterBar mode="exercises" filters={exFilters} onChange={handleExFilter} />
            {exercises.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><MagnifyingGlass size={40} weight="light" /></div>
                <h3>Sin resultados</h3><p>Prueba con otros filtros</p>
              </div>
            ) : (
              <div className="grid-auto">{exercises.map(e => <ExerciseCard key={e.id} exercise={e} onClick={setSelectedEx} />)}</div>
            )}
          </section>

          {/* RUTINAS */}
          <section className="home-section">
            <div className="section-header-row">
              <div>
                <h2 className="section-title"><Notebook size={22} weight="bold" /> Rutinas</h2>
                <p className="section-subtitle">{routines.length} rutinas diseñadas para tu nivel</p>
              </div>
              <Link to="/routines" className="btn btn-secondary btn-sm">
                Ver todas <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
            <FilterBar mode="routines" filters={rtFilters} onChange={handleRtFilter} />
            {routines.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><MagnifyingGlass size={40} weight="light" /></div>
                <h3>Sin resultados</h3><p>Prueba con otros filtros</p>
              </div>
            ) : (
              <div className="grid-auto">{routines.map(r => <RoutineCard key={r.id} routine={r} onClick={setSelectedRt} />)}</div>
            )}
          </section>
        </div>
      </div>

      {selectedEx && <ExerciseModal exercise={selectedEx} onClose={() => setSelectedEx(null)} />}
      {selectedRt && <RoutineModal routine={selectedRt} onClose={() => setSelectedRt(null)} />}
      {showWarning && <WarningModal onConfirm={() => { setShowAll(true); setShowWarning(false); }} onCancel={() => setShowWarning(false)} />}
    </div>
  );
}
