import { useState } from 'react';
import { Heart, Warning, ArrowRight, Clock, ArrowsClockwise } from '@phosphor-icons/react';
import { useData } from '../../context/DataContext';
import './Cards.css';

const levelLabel = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };
const levelColor = { beginner: 'green', intermediate: 'yellow', advanced: 'red' };

export default function RoutineCard({ routine, onClick }) {
  const { toggleFavorite, isFavorite } = useData();
  const [imgErr, setImgErr] = useState(false);
  const fav = isFavorite(routine.id, 'routines');
  const color = levelColor[routine.level] || 'gray';

  return (
    <div className="ex-card animate-scale-in" onClick={() => onClick && onClick(routine)}>
      <div className="card-img-wrap">
        <img
          src={imgErr ? `https://picsum.photos/seed/${routine.id}/600/400` : routine.image}
          alt={routine.name}
          className="card-image"
          onError={() => setImgErr(true)}
        />
        <div className="card-overlay" />
        {!routine.isSafe && (
          <div className="card-alert-badge">
            <Warning size={13} weight="fill" />
            Precaución
          </div>
        )}
        <button
          className={`card-fav-btn ${fav ? 'active' : ''}`}
          onClick={e => { e.stopPropagation(); toggleFavorite(routine.id, 'routines'); }}
          aria-label="Añadir a favoritos"
        >
          <Heart size={18} weight={fav ? 'fill' : 'regular'} color={fav ? '#ef4444' : 'currentColor'} />
        </button>
        <div className="card-duration-badge">
          <Clock size={13} weight="bold" /> {routine.duration}
        </div>
      </div>
      <div className="card-body">
        <div className="card-tags">
          <span className={`badge badge-${color}`}>{levelLabel[routine.level]}</span>
          <span className="badge badge-gray">{routine.frequency}</span>
        </div>
        <h3 className="card-title">{routine.name}</h3>
        <p className="card-desc">{routine.description.substring(0, 80)}...</p>
        <div className="card-footer">
          <span className="card-equipment">
            <ArrowsClockwise size={13} weight="bold" /> {routine.exercises?.length || 0} ejercicios
          </span>
          <span className="card-cta">Ver más <ArrowRight size={14} weight="bold" /></span>
        </div>
      </div>
    </div>
  );
}
