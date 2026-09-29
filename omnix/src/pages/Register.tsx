import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { logLoginAttempt } from '../lib/security';
import { Mail, Lock, Loader2, User, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { validateUsernameFormat, checkUsernameAvailability, generateSuggestions } from '../lib/username';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkUsername = async () => {
      if (!username) {
        setUsernameStatus('idle');
        setUsernameError(null);
        setSuggestions([]);
        return;
      }

      const formatError = validateUsernameFormat(username);
      if (formatError) {
        setUsernameStatus('invalid');
        setUsernameError(formatError);
        setSuggestions([]);
        return;
      }

      setUsernameStatus('checking');
      setUsernameError(null);
      
      const isAvailable = await checkUsernameAvailability(username);
      if (isAvailable) {
        setUsernameStatus('available');
        setSuggestions([]);
      } else {
        setUsernameStatus('taken');
        setUsernameError('Username already taken');
        const generated = await generateSuggestions(username);
        setSuggestions(generated);
      }
    };

    const debounce = setTimeout(checkUsername, 400);
    return () => clearTimeout(debounce);
  }, [username]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus !== 'available') {
      setError('Please choose a valid and available username');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            full_name: name.trim(),
            display_name: name.trim(),
          }
        }
      });

      if (signUpError) throw signUpError;
      if (data?.user) await logLoginAttempt(data.user.id, true);
      
      setSuccess(true);
      setTimeout(() => {
        if (data.session) {
            navigate('/');
        }
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-40 left-20 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            Join Omnix
          </h1>
          <p className="text-zinc-400">Create an account to connect with the world.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg p-3 mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-sm rounded-lg p-3 mb-6">
            Account created successfully! Please check your email to verify your account or logging you in...
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder:text-zinc-500"
                placeholder="Raj Soni"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-zinc-500 font-semibold text-sm h-5 w-5 flex items-center justify-center">@</span>
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 bg-zinc-800/50 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-white placeholder:text-zinc-500 ${
                  usernameStatus === 'available' ? 'border-green-500 focus:border-green-500' :
                  usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-500 focus:border-red-500' :
                  'border-zinc-700 focus:border-transparent'
                }`}
                placeholder="johndoe"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {usernameStatus === 'checking' && <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />}
                {usernameStatus === 'available' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <XCircle className="h-5 w-5 text-red-500" />}
              </div>
            </div>
            {usernameStatus === 'taken' && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">❌ Username already taken</p>
            )}
            {usernameStatus === 'invalid' && usernameError && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">❌ {usernameError}</p>
            )}
            {usernameStatus === 'available' && (
              <p className="text-xs text-green-500 mt-2 flex items-center gap-1">✅ Username available</p>
            )}
            {suggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-zinc-400 mb-1">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setUsername(s)}
                      className="text-xs bg-zinc-800 hover:bg-zinc-700 text-purple-400 px-2 py-1 rounded-md transition-colors"
                    >
                      @{s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder:text-zinc-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder:text-zinc-500"
                placeholder="••••••••"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">Must be at least 6 characters.</p>
          </div>

          <button
            type="submit"
            disabled={loading || success || usernameStatus !== 'available' || !name.trim()}
            className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
