import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, GraduationCap } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex gap-2 mr-3 opacity-95 group-hover:opacity-100">
                <div className="w-12 h-12 overflow-hidden p-0.5 rounded-full shadow-sm bg-white border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-[1.03] transition-transform">
                  <img src="/davv-logo.jpeg" alt="SDSF" className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-extrabold text-xl tracking-tight text-slate-800 leading-none">
                  Placement Portal
                </span>
                <span className="text-[10.5px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  SDSF, DAVV Indore
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden sm:block text-sm">
                  <span className="text-slate-500">Welcome, </span>
                  <span className="font-semibold text-slate-900">{user.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline font-medium">Logout</span>
                </button>
              </>
            ) : (
             <div className="flex items-center gap-3">
               <Link to="/" className="text-slate-600 hover:text-primary-600 font-medium transition-colors hidden sm:block mr-2">Home</Link>
               <Link to="/login" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Login</Link>
               <Link to="/register" className="btn-primary py-1.5 px-4 text-sm">Student Register</Link>
             </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
