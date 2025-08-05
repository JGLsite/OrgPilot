import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    
    if (isAuthenticated && user) {
      // Redirect to appropriate dashboard based on role
      switch (user.role) {
        case 'admin':
          window.location.href = '/admin';
          break;
        case 'gym_admin':
          window.location.href = '/gym-dashboard';
          break;
        case 'coach':
          window.location.href = '/coach-dashboard';
          break;
        case 'gymnast':
          window.location.href = '/gymnast-dashboard';
          break;
        default:
          window.location.href = '/';
      }
    } else {
      // Redirect to Replit auth
      window.location.href = '/api/login';
    }
  }, [isAuthenticated, user, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-jgl-teal to-jgl-light-teal">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-jgl-magenta font-black text-4xl mb-2">JGL</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Jewish Gymnastics League</h1>
          <p className="text-gray-600 mb-8">Redirecting to login...</p>
          <div className="animate-spin w-8 h-8 border-4 border-jgl-teal border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
}
