import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    cgpa: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Only allow a specific permanent email to be admin
      const isTestAdmin = formData.email.toLowerCase() === 'admin@admin.com';
      
      // Store user record in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        role: isTestAdmin ? 'admin' : 'student',
        name: formData.name,
        branch: formData.branch,
        cgpa: parseFloat(formData.cgpa) || 0,
        email: formData.email,
        student_id: user.uid, // use uid as student_id
        createdAt: new Date().toISOString()
      });

      navigate(isTestAdmin ? '/admin' : '/student');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden py-8">
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-primary-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="glass-card w-full max-w-lg p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
            <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create Account</h2>
          <p className="text-slate-500 mt-2">Join to explore placement opportunities</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center gap-2 border border-red-100">
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input 
              type="text" 
              name="name"
              required
              className="input-field"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Branch</label>
              <input 
                type="text" 
                name="branch"
                required
                className="input-field"
                placeholder="CSE"
                value={formData.branch}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current CGPA</label>
              <input 
                type="number" 
                step="0.01" min="0" max="10"
                name="cgpa"
                required
                className="input-field"
                placeholder="8.50"
                value={formData.cgpa}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">College Email</label>
            <input 
              type="email" 
              name="email"
              required
              className="input-field"
              placeholder="student@college.edu"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input 
              type="password" 
              name="password"
              required
              minLength="6"
              className="input-field"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full flex justify-center py-3 mt-4 text-base"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
