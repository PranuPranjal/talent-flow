import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import { candidateService } from '../../db/services';
import { HiUser, HiLockClosed, HiShieldCheck } from 'react-icons/hi';

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
      if (u && (u as any).role === 'candidate') {
        navigate(`/candidates/${(u as any).id}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="app-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-sm">
              <HiShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Sign in to TalentFlow</h2>
              <p className="text-sm text-gray-500">Access candidates, jobs and assessments</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sign in as</label>
              <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full rounded-md border border-gray-200 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-200">
                <option value="admin">Admin / Recruiter</option>
                <option value="candidate">Candidate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-50 border border-gray-100 rounded-md">
                  <HiUser className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  className="flex-1 rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or candidate id"
                  aria-label="User ID"
                />
              </div>
              {role === 'candidate' && candidateSuggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {candidateSuggestions.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setUsername(s.id)}
                      className="px-2 py-1 text-sm bg-gray-100 rounded"
                      title={s.name}
                    >
                      {s.name}
                    </button>
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
                  className="flex-1 rounded-md border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin or candidate"
                  aria-label="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Button type="submit" variant="primary" className="w-full sm:w-auto">Sign in</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;