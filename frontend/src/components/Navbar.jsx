import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Code, Trophy, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Code className="h-8 w-8 text-indigo-400" />
              <span className="font-bold text-xl tracking-tight">CodePlatform</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/contests" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition">Contests</Link>
              <Link to="/problems" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition">Problems</Link>
              <Link to="/playground" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition">Playground</Link>
              <Link to="/leaderboard" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition">Leaderboard</Link>
              
              {user ? (
                <>
                  <Link to="/dashboard" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition flex items-center">
                    <LayoutDashboard className="h-4 w-4 mr-1" /> Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="hover:bg-gray-700 text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition">
                      Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium transition flex items-center">
                    <LogOut className="h-4 w-4 mr-1" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition">Login</Link>
                  <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium transition">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
