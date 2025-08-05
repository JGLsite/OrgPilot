import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'gym_admin':
        return '/gym-dashboard';
      case 'coach':
        return '/coach-dashboard';
      case 'gymnast':
        return '/gymnast-dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b-2 border-jgl-teal sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="text-jgl-magenta font-black text-4xl">JGL</div>
            <div className="hidden md:block">
              <h1 className="text-jgl-teal font-semibold text-xl">Jewish Gymnastics League</h1>
              <p className="text-gray-500 text-sm italic">Where standards and excellence meet</p>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-jgl-magenta font-medium transition-colors duration-200">HOME</a>
            <a href="#join" className="text-gray-700 hover:text-jgl-magenta font-medium transition-colors duration-200">JOIN US</a>
            <a href="#events" className="text-gray-700 hover:text-jgl-magenta font-medium transition-colors duration-200">EVENTS</a>
            <a href="#news" className="text-gray-700 hover:text-jgl-magenta font-medium transition-colors duration-200">NEWS</a>
            <a href="#contact" className="text-gray-700 hover:text-jgl-magenta font-medium transition-colors duration-200">CONTACT</a>
          </div>

          {/* Login/Dashboard Button */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => window.location.href = getDashboardLink()}
                  variant="outline"
                  className="border-jgl-teal text-jgl-teal hover:bg-jgl-teal hover:text-white"
                >
                  <i className="fas fa-tachometer-alt mr-2"></i>
                  Dashboard
                </Button>
                <Button 
                  onClick={handleLogout}
                  className="bg-jgl-teal hover:bg-jgl-light-teal text-white"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  LOG OUT
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleLogin}
                className="bg-jgl-teal hover:bg-jgl-light-teal text-white px-6 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                LOG IN
              </Button>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 hover:text-jgl-magenta"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              <a href="#home" className="text-gray-700 hover:text-jgl-magenta font-medium">HOME</a>
              <a href="#join" className="text-gray-700 hover:text-jgl-magenta font-medium">JOIN US</a>
              <a href="#events" className="text-gray-700 hover:text-jgl-magenta font-medium">EVENTS</a>
              <a href="#news" className="text-gray-700 hover:text-jgl-magenta font-medium">NEWS</a>
              <a href="#contact" className="text-gray-700 hover:text-jgl-magenta font-medium">CONTACT</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
