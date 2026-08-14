import { useState } from 'react';
import { SlidersHorizontal, MagnifyingGlass, X } from '@phosphor-icons/react';
import { useData } from '../../context/DataContext';
import './FilterBar.css';

const ROUTINE_CATEGORIES = [
  { id: 'upper', label: 'Tren superior' },
  { id: 'lower', label: 'Tren inferior' },
  { id: 'core', label: 'Core' },
  { id: 'full_body', label: 'Cuerpo completo' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'mobility', label: 'Movilidad' },
];

export default function FilterBar({ mode = 'exercises', filters, onChange }) {
  const isExercises = mode === 'exercises';
  const [open, setOpen] = useState(false);
  const { metadata } = useData();
  const MUSCLE_GROUPS = metadata?.muscleGroups || [];
  const BODY_AREAS = metadata?.bodyAreas || [];
  const DIFFICULTY_LEVELS = metadata?.difficultyLevels || [];

  const toggle = (key, val) => {
    onChange(key, filters[key] === val ? null : val);
  };

  const activeCount = Object.entries(filters).filter(([k, v]) => v && k !== 'search').length;
  const searchVal = filters.search || '';

  return (
    <div className="filter-bar">
      <div className="filter-top-row">
        <div className="filter-search-wrap">
          <MagnifyingGlass size={18} className="search-icon-ph" weight="bold" />
          <input
            className="filter-search"
            placeholder={`Buscar ${isExercises ? 'ejercicios' : 'rutinas'}...`}
            value={searchVal}
            onChange={e => onChange('search', e.target.value)}
          />
          {searchVal && (
            <button className="search-clear" onClick={() => onChange('search', '')}>
              <X size={14} weight="bold" />
            </button>
          )}
        </div>

        <button className={`filter-toggle-btn ${open ? 'open' : ''}`} onClick={() => setOpen(p => !p)}>
          <SlidersHorizontal size={16} weight="bold" />
          <span>Filtros</span>
          {activeCount > 0 && <span className="filter-count-badge">{activeCount}</span>}
        </button>

        {activeCount > 0 && (
          <button className="filter-clear-all" onClick={() => onChange('__clear__', null)}>
            <X size={14} weight="bold" /> Limpiar
          </button>
        )}
      </div>

      {open && (
        <div className="filter-panel">
          <div className="filter-groups">
            {isExercises && (
              <>
                <div className="filter-group">
                  <span className="filter-label">Músculo</span>
                  <div className="filter-chips">
                    {MUSCLE_GROUPS.map(m => (
                      <button key={m.id} className={`chip ${filters.muscleGroup === m.id ? 'active' : ''}`} onClick={() => toggle('muscleGroup', m.id)}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="filter-group">
                  <span className="filter-label">Área corporal</span>
                  <div className="filter-chips">
                    {BODY_AREAS.map(a => (
                      <button key={a.id} className={`chip ${filters.bodyArea === a.id ? 'active' : ''}`} onClick={() => toggle('bodyArea', a.id)}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!isExercises && (
              <div className="filter-group">
                <span className="filter-label">Categoría</span>
                <div className="filter-chips">
                  {ROUTINE_CATEGORIES.map(c => (
                    <button key={c.id} className={`chip ${filters.category === c.id ? 'active' : ''}`} onClick={() => toggle('category', c.id)}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="filter-group">
              <span className="filter-label">Dificultad</span>
              <div className="filter-chips">
                {DIFFICULTY_LEVELS.map(d => (
                  <button
                    key={d.id}
                    className={`chip ${(isExercises ? filters.difficulty : filters.level) === d.id ? 'active' : ''}`}
                    onClick={() => toggle(isExercises ? 'difficulty' : 'level', d.id)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
