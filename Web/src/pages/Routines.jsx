import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Notebook, Warning, CheckCircle, MagnifyingGlass } from '@phosphor-icons/react';
import Header from '../components/Layout/Header';
import Breadcrumbs from '../components/Layout/Breadcrumbs';
import RoutineCard from '../components/Cards/RoutineCard';
import FilterBar from '../components/Filters/FilterBar';
import { RoutineModal, WarningModal } from '../components/Modals/Modals';
import { useFilter } from '../hooks/useFilter';
import { useData } from '../context/DataContext';

export default function Routines() {
  const { showAll, setShowAll } = useData();
  const { getFilteredRoutines } = useFilter();
  const [filters, setFilters] = useState({});
  const location = useLocation();
  const [selected, setSelected] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newFilters = {};
    if (params.get('level')) newFilters.level = params.get('level');
    if (params.get('cat')) newFilters.category = params.get('cat');
    setFilters(newFilters);
  }, [location.search]);

  const handleFilter = (key, val) => {
    if (key === '__clear__') { setFilters({}); return; }
    setFilters(p => ({ ...p, [key]: val }));
  };

  const items = getFilteredRoutines(filters);

  return (
    <div className="home-page bg-mesh">
      <Header />
      <div className="page-content">
        <div className="container">
          <Breadcrumbs />
          <div className="home-welcome">
            <div>
              <h1 className="home-title"><Notebook size={26} weight="bold" /> Rutinas</h1>
              <p style={{ color:'var(--gray-500)', fontSize:'0.95rem' }}>{items.length} rutinas disponibles</p>
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
          <FilterBar mode="routines" filters={filters} onChange={handleFilter} />
          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><MagnifyingGlass size={40} weight="light" /></div>
              <h3>No hay resultados</h3><p>Intenta con otros filtros</p>
            </div>
          ) : (
            <div className="grid-auto">{items.map(r => <RoutineCard key={r.id} routine={r} onClick={setSelected} />)}</div>
          )}
        </div>
      </div>
      {selected && <RoutineModal routine={selected} onClose={() => setSelected(null)} />}
      {showWarning && <WarningModal onConfirm={() => { setShowAll(true); setShowWarning(false); }} onCancel={() => setShowWarning(false)} />}
    </div>
  );
}
