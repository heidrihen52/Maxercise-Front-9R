import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { exercisesAPI, routinesAPI, musclesAPI } from '../services/api';

const DataContext = createContext(null);

export function normalizeRestriction(name) {
  if (!name) return '';
  const normalized = name.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (normalized.includes('rodilla')) return 'lesión_rodilla';
  if (normalized.includes('espalda')) return 'lesión_espalda';
  if (normalized.includes('hombro')) return 'lesión_hombro';
  if (normalized.includes('muneca')) return 'lesión_muñeca';
  if (normalized.includes('cuello') || normalized.includes('cervical')) return 'lesión_cuello';
  if (normalized.includes('cardiaca') || normalized.includes('corazon')) return 'condición_cardiaca';
  if (normalized.includes('hipertension')) return 'hipertensión';
  if (normalized.includes('hernia')) return 'hernia';
  if (normalized.includes('obesidad')) return 'obesidad';
  if (normalized.includes('asma')) return 'asma';
  if (normalized.includes('embarazo')) return 'embarazo';
  
  return normalized;
}

export function DataProvider({ children }) {
  const [favorites, setFavorites] = useState({ exercises: [], routines: [] });
  const [showAll, setShowAll] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [metadata, setMetadata] = useState({
    muscleGroups: [],
    bodyAreas: [],
    difficultyLevels: []
  });

  // Load all content from API
  const loadContent = useCallback(async () => {
    try {
      const token = localStorage.getItem('mx_token');
      if (!token) return; // Don't fetch if not logged in

      const [exData, rtData, musclesData] = await Promise.all([
        exercisesAPI.getAll(),
        routinesAPI.getAll(),
        musclesAPI.getAll().catch(() => ({ data: [] })),
      ]);

      // Mapear grupos musculares
      const rawMuscles = Array.isArray(musclesData) ? musclesData : musclesData.data || [];
      const emojiMap = {
        'pecho': '💪',
        'espalda': '🪶',
        'piernas': '🦵',
        'brazos': '🏋️',
        'core': '🧘',
      };
      const mappedMuscleGroups = rawMuscles.map(mg => ({
        id: mg.id.toString(),
        label: mg.name,
        emoji: emojiMap[mg.name.toLowerCase()] || '💪',
        description: mg.description
      }));

      const difficultyLevels = [
        { id: 'beginner', label: 'Principiante' },
        { id: 'intermediate', label: 'Intermedio' },
        { id: 'advanced', label: 'Avanzado' }
      ];

      const bodyAreas = [
        { id: 'upper', label: 'Tren superior' },
        { id: 'lower', label: 'Tren inferior' },
        { id: 'core', label: 'Core' }
      ];

      setMetadata({
        muscleGroups: mappedMuscleGroups,
        bodyAreas,
        difficultyLevels
      });

      // Backend returns arrays directly (already unwrapped by api.js)
      const rawEx = Array.isArray(exData) ? exData : exData.exercises || [];
      const mappedEx = rawEx.map(ex => {
        const mgId = ex.exercise_muscles?.[0]?.muscle?.muscle_group_id?.toString() || '1';
        const mg = mappedMuscleGroups.find(g => g.id === mgId);
        const bodyArea = mg ? mg.area : 'upper';
        
        return {
          ...ex,
          name: ex.title || ex.name,
          createdBy: ex.author_id || ex.createdBy,
          muscleGroup: mgId,
          bodyArea,
          difficulty: 'beginner',
          image: ex.media?.find(m => m.type === 'THUMBNAIL')?.url || '',
          restrictions: (ex.exercise_restrictions || []).map(er => 
            normalizeRestriction(er.restriction?.name)
          ).filter(Boolean),
          // Track if current user has favorited
          isFavorited: ex.isFavorite || false,
        };
      });
      setExercises(mappedEx);

      const rawRt = Array.isArray(rtData) ? rtData : rtData.routines || [];
      const mappedRt = rawRt.map(rt => {
        // Collect all restrictions from exercises in this routine
        const rtRestrictions = (rt.exercises || [])
          .flatMap(re => re.exercise?.exercise_restrictions || [])
          .map(er => normalizeRestriction(er.restriction?.name))
          .filter(Boolean);

        const dbDiff = rt.difficulty ? rt.difficulty.toUpperCase() : 'PRINCIPIANTE';
        const dbBody = rt.body_type ? rt.body_type.toUpperCase() : 'MESOMORFO';

        return {
          ...rt,
          name: rt.title || rt.name,
          createdBy: rt.author_id || rt.createdBy,
          level: dbDiff === 'PRINCIPIANTE' ? 'beginner' : dbDiff === 'INTERMEDIO' ? 'intermediate' : 'advanced',
          category: dbBody === 'ECTOMORFO' ? 'split' : dbBody === 'MESOMORFO' ? 'full_body' : 'upper',
          image: rt.media?.find(m => m.type === 'THUMBNAIL')?.url || '',
          restrictions: [...new Set(rtRestrictions)],
          isFavorited: rt.isFavorite || false,
        };
      });
      setRoutines(mappedRt);

      // Extract favorite IDs from the loaded data
      const favExIds = mappedEx.filter(e => e.isFavorited).map(e => e.id);
      const favRtIds = mappedRt.filter(r => r.isFavorited).map(r => r.id);
      setFavorites({ exercises: favExIds, routines: favRtIds });

    } catch (error) {
      console.error("Error loading data from API", error);
    }
  }, []);

  // Load favorites from localStorage as fallback
  const loadFavorites = useCallback(async () => {
    // Favorites are loaded together with content from the API
    // This is called after login to refresh data
    await loadContent();
  }, [loadContent]);

  useEffect(() => {
    const token = localStorage.getItem('mx_token');
    if (token) {
      loadContent();
    }
  }, [loadContent]);

  const toggleFavorite = async (id, type) => {
    const list = favorites[type] || [];
    const exists = list.includes(id);
    // Optimistic update
    const updated = exists ? list.filter(i => i !== id) : [...list, id];
    const newFavs = { ...favorites, [type]: updated };
    setFavorites(newFavs);
    try {
      if (type === 'exercises') {
        await exercisesAPI.toggleFavorite(id);
      } else {
        await routinesAPI.toggleFavorite(id);
      }
    } catch {
      // Revert if API fails
      setFavorites(favorites);
    }
  };

  const isFavorite = (id, type) => (favorites[type] || []).includes(id);

  const saveAdminItem = async (item, type) => {
    try {
      if (type === 'exercises') {
        await exercisesAPI.create(item);
      } else {
        await routinesAPI.create(item);
      }
      await loadContent();
    } catch (err) {
      throw new Error(err.message || 'Error guardando el item');
    }
  };

  const deleteAdminItem = async (id, type) => {
    try {
      if (type === 'exercises') {
        await exercisesAPI.delete(id);
      } else {
        await routinesAPI.delete(id);
      }
      await loadContent();
    } catch (err) {
      throw new Error(err.message || 'Error eliminando el item');
    }
  };

  const updateAdminItem = async (id, item, type) => {
    try {
      if (type === 'exercises') {
        await exercisesAPI.update(id, item);
      } else {
        await routinesAPI.update(id, item);
      }
      await loadContent();
    } catch (err) {
      throw new Error(err.message || 'Error actualizando el item');
    }
  };

  return (
    <DataContext.Provider value={{
      favorites, showAll, setShowAll,
      exercises, routines, metadata,
      toggleFavorite, isFavorite,
      saveAdminItem, deleteAdminItem, updateAdminItem,
      loadFavorites,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
