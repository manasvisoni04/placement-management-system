import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, UserCircle, Briefcase } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, setOfflineUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const withTimeout = (promise, ms, errorObj) => {
      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(errorObj), ms);
      });
      return Promise.race([
        promise.then(res => { clearTimeout(timeoutId); return res; }, 
                     err => { clearTimeout(timeoutId); throw err; }),
        timeoutPromise
      ]);
    };

    try {
      // Direct Firebase Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Verify Role from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (!userDoc.exists()) {
        throw new Error("User record not found in database.");
      }
        
      const matchedRole = userDoc.data().role || 'student';

      if (matchedRole !== role) {
        throw new Error(`Invalid credentials for ${role} access.`);
      }

      navigate(role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="glass-card w-full max-w-md p-8 relative z-10 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10">
        <div className="text-center mb-8">
          <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
            <LogIn size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center gap-2 border border-red-100">
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                role === 'student' 
                ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-sm ring-1 ring-primary-500/20' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <UserCircle size={18} />
              <span className="font-semibold text-sm">Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                role === 'admin' 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm ring-1 ring-indigo-500/20' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Briefcase size={18} />
              <span className="font-semibold text-sm">Admin</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              className="input-field"
              placeholder="name@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input 
              type="password" 
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`btn-primary w-full flex justify-center py-3 text-base ${role === 'admin' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30' : ''}`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Don't have an ordinary student account?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
