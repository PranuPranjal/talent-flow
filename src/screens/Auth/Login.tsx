import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { candidateService } from '../../db/services';
import { HiUser, HiLockClosed, HiShieldCheck } from 'react-icons/hi';
import Button from '../../components/UI/Button';

const Login: React.FC = () => {
  const [role, setRole] = useState<'admin' | 'candidate'>('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState<string | null>(null);
  const [candidateSuggestions, setCandidateSuggestions] = useState<Array<{ id: string; name: string }>>([]);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin');
      setCandidateSuggestions([]);
      return;
    }
    setPassword('candidate');
    setUsername('');
    const load = async () => {
      try {
        const resp = await candidateService.getCandidates({ page: 1, pageSize: 6 });
        const suggestions = resp.data.map((c: any) => ({ id: c.id, name: c.name }));
        setCandidateSuggestions(suggestions);
      } catch (e) {
        console.error('Failed to load candidate suggestions', e);
        setCandidateSuggestions([]);
      }
    };
    load();
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const u = await login(username.trim(), password);
      if (u && (u as any).role === 'candidate') navigate(`/candidates/${(u as any).id}`);
      else navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-white to-indigo-100 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Left Side Illustration + Animated Text Card */}
      <motion.div
        className="hidden md:flex w-1/2 relative flex-col bg-gradient-to-br from-blue-800 via-indigo-700 to-purple-800 overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
        </div>

        {/* Logo and Header Section */}
        <motion.div
          className="relative z-10 p-10 text-center h-full flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-6 relative">
            {/* Logo coming from top-left */}
            <motion.div
              initial={{ x: -200, y: -200, opacity: 0, rotate: -45 }}
              animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 15,
                duration: 1,
                delay: 0.2,
              }}
            >
              <HiShieldCheck className="w-16 h-16 text-white drop-shadow-xl" />
            </motion.div>

            {/* Header coming from top */}
            <motion.h1
              className="text-6xl font-black tracking-tight text-white"
              initial={{ y: -200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 15,
                duration: 1,
                delay: 0.4,
              }}
            >
              TalentFlow
            </motion.h1>
          </div>

          {/* Description card coming from bottom */}
          <motion.div
            className="relative z-10 mx-auto mt-12 max-w-lg"
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 15,
              duration: 1,
              delay: 0.6,
            }}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
              whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 150 } }}
            >
              <motion.p
                className="text-xl leading-relaxed text-white/90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                Empower your <span className="font-semibold text-blue-200">recruitment journey</span> with
                seamless candidate tracking, automated insights, and modern workflow tools.
              </motion.p>

              <motion.div
                className="h-1 w-32 bg-white/30 rounded-full mt-6 mx-auto"
                initial={{ width: 0 }}
                animate={{ width: '8rem' }}
                transition={{ delay: 1.5, duration: 0.8 }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Login Form Section */}
      <motion.div
        className="flex w-full md:w-1/2 items-center justify-center p-6"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.div
          className="w-full max-w-md bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-8"
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="text-center mb-6">
            <motion.h2
              className="text-3xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Welcome Back
            </motion.h2>
            <motion.p
              className="text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Sign in to continue to <span className="font-semibold text-indigo-600">TalentFlow</span>
            </motion.p>
          </div>

          <div className="flex gap-2 mb-6 justify-center">
            {(['admin', 'candidate'] as const).map((r) => (
              <motion.button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  role === r
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {r === 'admin' ? 'Admin / Recruiter' : 'Candidate'}
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-md px-3 py-2 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-50 border border-gray-100 rounded-md">
                  <HiUser className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  className="flex-1 rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or candidate id"
                />
              </div>
              {role === 'candidate' && candidateSuggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {candidateSuggestions.map((s) => (
                    <motion.button
                      key={s.id}
                      type="button"
                      onClick={() => setUsername(s.id)}
                      whileHover={{ scale: 1.05 }}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-indigo-50 text-gray-600 rounded-md transition-all"
                      title={s.name}
                    >
                      {s.name}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-50 border border-gray-100 rounded-md">
                  <HiLockClosed className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  className="flex-1 rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin or candidate"
                />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Button
                type="submit"
                variant="primary"
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 shadow-md"
              >
                Sign In
              </Button>
            </motion.div>
          </form>

          <div className="text-center mt-6 text-xs text-gray-400">
            © {new Date().getFullYear()} TalentFlow. All rights reserved.
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;