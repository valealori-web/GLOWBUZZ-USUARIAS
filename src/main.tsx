import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {AuthProvider, useAuth} from './context/AuthContext';
import {AuthScreens} from './components/AuthScreens';
import './index.css';

/** Sin sesión iniciada solo se ve el acceso; con sesión, la app. */
function Gate() {
  const {user, loading, recovering} = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <span className="inline-block w-6 h-6 border-2 border-[#B82E5F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user || recovering) return <AuthScreens />;
  return <App key={user.id} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Gate />
    </AuthProvider>
  </StrictMode>,
);
