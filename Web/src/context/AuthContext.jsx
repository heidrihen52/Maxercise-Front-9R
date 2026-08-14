import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI } from '../services/api';
import { normalizeRestriction } from './DataContext';

const AuthContext = createContext(null);

// Helper: normalize backend user data to frontend "profile" shape
// The backend user has: id, first_name, last_name, email, role, phone_number, birth_date, user_restrictions
// The frontend questionnaire profile has: gender, age, goal, fitnessLevel, restrictions, etc.
// Since the backend does NOT store questionnaire data, we keep that in localStorage
function loadQuestionnaireProfile() {
  try {
    const saved = localStorage.getItem('mx_profile');
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return null;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('mx_user');
    return user ? JSON.parse(user) : null;
  });
  const [userProfile, setUserProfile] = useState(() => loadQuestionnaireProfile());
  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('mx_token');
    const user = localStorage.getItem('mx_user');
    return !!(token && user);
  });

  // Restore session from localStorage token
  useEffect(() => {
    const token = localStorage.getItem('mx_token');
    if (token && currentUser) {
      // Validate token is still valid by hitting the API
      authAPI.me()
        .then((userData) => {
          // Update cached user with latest from server
          const serverUser = {
            id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            role: userData.role,
          };
          setCurrentUser(serverUser);
          localStorage.setItem('mx_user', JSON.stringify(serverUser));

          // Sincronizar el perfil del cuestionario con lo guardado en BD
          const dbBodyType = userData.body_type;
          const frontendBodyType = dbBodyType === 'ECTOMORFO' ? 'ectomorph'
            : dbBodyType === 'ENDOMORFO' ? 'endomorph'
            : 'mesomorph';

          const dbRestrictions = (userData.user_restrictions || [])
            .map(ur => normalizeRestriction(ur.restriction?.name))
            .filter(Boolean);

          const savedProfile = loadQuestionnaireProfile();
          if (savedProfile) {
            const updatedProfile = {
              ...savedProfile,
              bodyType: frontendBodyType,
              restrictions: dbRestrictions.length > 0 ? dbRestrictions : ['ninguna'],
              hasWearable: !!userData.has_wearable,
            };
            setUserProfile(updatedProfile);
            localStorage.setItem('mx_profile', JSON.stringify(updatedProfile));
          } else if (dbBodyType) {
            const newProfile = {
              bodyType: frontendBodyType,
              restrictions: dbRestrictions.length > 0 ? dbRestrictions : ['ninguna'],
              hasWearable: !!userData.has_wearable,
            };
            setUserProfile(newProfile);
            localStorage.setItem('mx_profile', JSON.stringify(newProfile));
          }
        })
        .catch(() => {
          // Token expired or invalid — clear session
          localStorage.removeItem('mx_token');
          localStorage.removeItem('mx_user');
          localStorage.removeItem('mx_profile');
          setCurrentUser(null);
          setUserProfile(null);
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = async (name, email, password, captchaAnswer, captchaExpected) => {
    const data = await authAPI.register(name, email, password, captchaAnswer, captchaExpected);
    return data;
  };

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem('mx_token', data.token);
    localStorage.setItem('mx_user', JSON.stringify(data.user));
    setCurrentUser(data.user);

    // Sincronizar el perfil del cuestionario desde la base de datos inmediatamente tras iniciar sesión
    try {
      const userData = await profileAPI.get();
      const dbBodyType = userData.body_type;
      if (dbBodyType) {
        const frontendBodyType = dbBodyType === 'ECTOMORFO' ? 'ectomorph'
          : dbBodyType === 'ENDOMORFO' ? 'endomorph'
          : 'mesomorph';

        const dbRestrictions = (userData.user_restrictions || [])
          .map(ur => normalizeRestriction(ur.restriction?.name))
          .filter(Boolean);

        const newProfile = {
          bodyType: frontendBodyType,
          restrictions: dbRestrictions.length > 0 ? dbRestrictions : ['ninguna'],
          hasWearable: !!userData.has_wearable,
        };
        setUserProfile(newProfile);
        localStorage.setItem('mx_profile', JSON.stringify(newProfile));
      } else {
        setUserProfile(null);
        localStorage.removeItem('mx_profile');
      }
    } catch {
      setUserProfile(null);
      localStorage.removeItem('mx_profile');
    }
    return { user: data.user };
  };

  const logout = () => {
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem('mx_token');
    localStorage.removeItem('mx_user');
    localStorage.removeItem('mx_profile');
  };

  const saveProfile = async (profile) => {
    // Save questionnaire data locally (backend doesn't support these fields)
    const fullProfile = { ...profile, userId: currentUser?.id };
    setUserProfile(fullProfile);
    localStorage.setItem('mx_profile', JSON.stringify(fullProfile));

    // Also update the backend with the fields it does support
    try {
      await profileAPI.save({
        body_type: profile.bodyType === 'ectomorph' ? 'ECTOMORFO'
          : profile.bodyType === 'endomorph' ? 'ENDOMORFO'
          : 'MESOMORFO',
        restrictions: profile.restrictions || [],
      });
    } catch {
      // Silently ignore — questionnaire data is safely in localStorage
    }
  };

  const forgotPassword = async (email) => {
    return await authAPI.forgotPassword(email);
  };

  const resetPassword = async (token, password) => {
    return await authAPI.resetPassword(token, password);
  };

  const hasCompletedQuestionnaire = () => {
    // Check React state first
    if (!!userProfile && (!!userProfile.gender || !!userProfile.bodyType)) return true;
    // Fallback: check localStorage in case state hasn't propagated yet
    // (happens right after login before React re-renders)
    try {
      const saved = localStorage.getItem('mx_profile');
      if (saved) {
        const p = JSON.parse(saved);
        return !!p && (!!p.gender || !!p.bodyType);
      }
    } catch {
      // ignore
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      currentUser, userProfile, loading,
      register, login, logout, saveProfile,
      forgotPassword, resetPassword,
      hasCompletedQuestionnaire,
    }}>
      {children}
    </AuthContext.Provider>
  );
}



export function useAuth() {
  return useContext(AuthContext);
}
