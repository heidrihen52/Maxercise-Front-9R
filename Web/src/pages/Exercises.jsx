import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Barbell, Warning, CheckCircle, MagnifyingGlass } from '@phosphor-icons/react';
import Header from '../components/Layout/Header';
import Breadcrumbs from '../components/Layout/Breadcrumbs';
import ExerciseCard from '../components/Cards/ExerciseCard';
import FilterBar from '../components/Filters/FilterBar';
import { ExerciseModal, WarningModal } from '../components/Modals/Modals';
import { useFilter } from '../hooks/useFilter';
import { useData } from '../context/DataContext';

export default function Exercises() {
  const { showAll, setShowAll } = useData();
  const { getFilteredExercises } = useFilter();
  const [filters, setFilters] = useState({});
  const location = useLocation();
  const [selected, setSelected] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = {};
    if (params.get('area')) newFilters.bodyArea = params.get('area');
    if (params.get('muscle')) newFilters.muscleGroup = params.get('muscle');
    setFilters(newFilters);
  }, [location.search]);

  const handleFilter = (key, val) => {
    if (key === '__clear__') { setFilters({}); return; }
    setFilters(p => ({ ...p, [key]: val }));
  };

  const items = getFilteredExercises(filters);

  return (
    <div className="home-page bg-mesh">
      <Header />
      <div className="page-content">
        <div className="container">
          <Breadcrumbs />
          <div className="home-welcome">
            <div>
              <h1 className="home-title"><Barbell size={26} weight="bold" /> Ejercicios</h1>
              <p style={{ color:'var(--gray-500)', fontSize:'0.95rem' }}>{items.length} ejercicios disponibles para tu perfil</p>
            </div>
            <div className="show-all-toggle">
              <span className="toggle-label">
                {showAll
                  ? <><Warning size={15} weight="fill" style={{color:'#f59e0b'}} /> Mostrando todo</>
                  : <><CheckCircle size={15} weight="fill" style={{color:'#22c55e'}} /> Solo contenido seguro</>
                }
              </span>
              <button className={`toggle-btn ${showAll ? 'all' : 'safe'}`} onClick={() => showAll ? setShowAll(false) : setShowWarning(true)}>
                {showAll ? 'Filtro seguro' : 'Ver todo'}
              </button>
            </div>
          </div>
          <FilterBar mode="exercises" filters={filters} onChange={handleFilter} />
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><MagnifyingGlass size={40} weight="light" /></div>
              <h3>No hay resultados</h3><p>Intenta con otros filtros</p>
            </div>
          ) : (
            <div className="grid-auto">{items.map(e => <ExerciseCard key={e.id} exercise={e} onClick={setSelected} />)}</div>
          )}
        </div>
      </div>
      {selected && <ExerciseModal exercise={selected} onClose={() => setSelected(null)} />}
      {showWarning && <WarningModal onConfirm={() => { setShowAll(true); setShowWarning(false); }} onCancel={() => setShowWarning(false)} />}
    </div>
  );
}
