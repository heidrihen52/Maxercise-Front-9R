import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export function useFilter() {
  const { userProfile } = useAuth();
  const { showAll, exercises, routines } = useData();

  const userRestrictions = userProfile?.restrictions?.filter(r => r !== 'ninguna') || [];

  const isExerciseSafe = (exercise) => {
    if (userRestrictions.length === 0) return true;
    return !exercise.restrictions.some(r => userRestrictions.includes(r));
  };

  const isRoutineSafe = (routine) => {
    if (userRestrictions.length === 0) return true;
    return !routine.restrictions.some(r => userRestrictions.includes(r));
  };

  const getFilteredExercises = (filters = {}) => {
    let list = showAll ? exercises : exercises.filter(isExerciseSafe);

    if (filters.muscleGroup) list = list.filter(e => e.muscleGroup === filters.muscleGroup || e.muscle_group === filters.muscleGroup);
    if (filters.bodyArea)    list = list.filter(e => e.bodyArea === filters.bodyArea || e.body_area === filters.bodyArea);
    if (filters.difficulty)  list = list.filter(e => e.difficulty === filters.difficulty);
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      if (q) {
        list = list.filter(e =>
          e.name.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.tags?.some(t => t.toLowerCase().includes(q)) ||
          e.equipment?.toLowerCase().includes(q)
        );
      }
    }

    return list.map(e => ({ ...e, isSafe: isExerciseSafe(e) }));
  };

  const getFilteredRoutines = (filters = {}) => {
    let list = showAll ? routines : routines.filter(isRoutineSafe);

    if (filters.category) list = list.filter(r => r.category === filters.category);
    if (filters.level)    list = list.filter(r => r.level === filters.level);
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      if (q) {
        list = list.filter(r =>
          r.name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.tags?.some(t => t.toLowerCase().includes(q))
        );
      }
    }

    return list.map(r => ({ ...r, isSafe: isRoutineSafe(r) }));
  };

  return { getFilteredExercises, getFilteredRoutines, userRestrictions, isExerciseSafe, isRoutineSafe };
}
