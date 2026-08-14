import { useState } from 'react';
import { Heart, Warning, ArrowRight } from '@phosphor-icons/react';
import { useData } from '../../context/DataContext';
import './Cards.css';

const difficultyLabel = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };
const difficultyColor = { beginner: 'green', intermediate: 'yellow', advanced: 'red' };
const muscleLabel = { chest:'Pecho', back:'Espalda', legs:'Piernas', shoulders:'Hombros', arms:'Brazos', glutes:'Glúteos', core:'Core', cardio:'Cardio', full:'Completo' };

export default function ExerciseCard({ exercise, onClick }) {
  const { toggleFavorite, isFavorite } = useData();
  const [imgErr, setImgErr] = useState(false);
  const fav = isFavorite(exercise.id, 'exercises');
  const color = difficultyColor[exercise.difficulty] || 'gray';

  return (
    <div className="ex-card animate-scale-in" onClick={() => onClick && onClick(exercise)}>
      <div className="card-img-wrap">
        <img
          src={imgErr ? `https://picsum.photos/seed/${exercise.id}/600/400` : exercise.image}
          alt={exercise.name}
          className="card-image"
          onError={() => setImgErr(true)}
        />
        <div className="card-overlay" />
        {!exercise.isSafe && (
          <div className="card-alert-badge">
            <Warning size={13} weight="fill" />
            Precaución
          </div>
        )}
        <button
          className={`card-fav-btn ${fav ? 'active' : ''}`}
          onClick={e => { e.stopPropagation(); toggleFavorite(exercise.id, 'exercises'); }}
          aria-label="Añadir a favoritos"
        >
          <Heart size={18} weight={fav ? 'fill' : 'regular'} color={fav ? '#ef4444' : 'currentColor'} />
        </button>
      </div>
      <div className="card-body">
        <div className="card-tags">
          <span className={`badge badge-${color}`}>{difficultyLabel[exercise.difficulty]}</span>
          {exercise.muscleGroup && (
            <span className="badge badge-blue">{muscleLabel[exercise.muscleGroup] || exercise.muscleGroup}</span>
          )}
        </div>
        <h3 className="card-title">{exercise.name}</h3>
        <p className="card-desc">{exercise.description.substring(0, 80)}...</p>
        <div className="card-footer">
          <span className="card-equipment">{exercise.equipment}</span>
          <span className="card-cta">Ver más <ArrowRight size={14} weight="bold" /></span>
        </div>
      </div>
    </div>
  );
}
