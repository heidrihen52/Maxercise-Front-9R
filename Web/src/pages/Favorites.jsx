import { useState } from 'react';
import { Heart, Barbell, Notebook, MagnifyingGlass } from '@phosphor-icons/react';
import Header from '../components/Layout/Header';
import Breadcrumbs from '../components/Layout/Breadcrumbs';
import ExerciseCard from '../components/Cards/ExerciseCard';
import RoutineCard from '../components/Cards/RoutineCard';
import { ExerciseModal, RoutineModal } from '../components/Modals/Modals';
import { useData } from '../context/DataContext';
import './Favorites.css';

export default function Favorites() {
  const { favorites, exercises, routines } = useData();
  const [selectedEx, setSelectedEx] = useState(null);
  const [selectedRt, setSelectedRt] = useState(null);
  const [tab, setTab] = useState('exercises');

  const allEx = exercises || [];
  const allRt = routines || [];

  const favExercises = (favorites.exercises || []).map(id => allEx.find(e => e.id === id)).filter(Boolean).map(e => ({ ...e, isSafe: true }));
  const favRoutines = (favorites.routines || []).map(id => allRt.find(r => r.id === id)).filter(Boolean).map(r => ({ ...r, isSafe: true }));
  const total = favExercises.length + favRoutines.length;

  return (
    <div className="home-page bg-mesh">
      <Header />
      <div className="page-content">
        <div className="container">
          <Breadcrumbs />
          <div className="fav-header">
            <h1 className="home-title"><Heart size={26} weight="fill" color="var(--blue-primary)" /> Mis Favoritos</h1>
            <p className="fav-subtitle">{total} elemento{total !== 1 ? 's' : ''} guardado{total !== 1 ? 's' : ''}</p>
          </div>

          <div className="fav-tabs">
            <button className={`fav-tab ${tab === 'exercises' ? 'active' : ''}`} onClick={() => setTab('exercises')}>
              <Barbell size={16} weight="bold" /> Ejercicios <span className="fav-count">{favExercises.length}</span>
            </button>
            <button className={`fav-tab ${tab === 'routines' ? 'active' : ''}`} onClick={() => setTab('routines')}>
              <Notebook size={16} weight="bold" /> Rutinas <span className="fav-count">{favRoutines.length}</span>
            </button>
          </div>

          {tab === 'exercises' && (
            favExercises.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Heart size={44} weight="light" /></div>
                <h3>Sin ejercicios favoritos</h3>
                <p>Explora ejercicios y pulsa el corazón para guardarlos aquí</p>
              </div>
            ) : (
              <div className="grid-auto">{favExercises.map(e => <ExerciseCard key={e.id} exercise={e} onClick={setSelectedEx} />)}</div>
            )
          )}

          {tab === 'routines' && (
            favRoutines.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Heart size={44} weight="light" /></div>
                <h3>Sin rutinas favoritas</h3>
                <p>Explora rutinas y pulsa el corazón para guardarlas aquí</p>
              </div>
            ) : (
              <div className="grid-auto">{favRoutines.map(r => <RoutineCard key={r.id} routine={r} onClick={setSelectedRt} />)}</div>
            )
          )}
        </div>
      </div>
      {selectedEx && <ExerciseModal exercise={selectedEx} onClose={() => setSelectedEx(null)} />}
      {selectedRt && <RoutineModal routine={selectedRt} onClose={() => setSelectedRt(null)} />}
    </div>
  );
}
