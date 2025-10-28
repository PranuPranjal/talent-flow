import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import { candidateService } from '../../db/services';

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
    } else {
      setPassword('candidate');
      setUsername('');
      const specialNames = ['Kenneth Robinson', 'Joseph Miller', 'Edward Jackson', 'William Ramirez'];
      const load = async () => {
        try {
        //   const resp = await candidateService.getCandidates({ page: 1, pageSize: 6 });
        //   const suggestions = resp.data.map(c => ({ id: c.id, name: c.name }));

          const lookups = await Promise.all(specialNames.map(async (n) => {
            try {
              const r = await candidateService.getCandidates({ page: 1, pageSize: 1, search: n });
              const match = r.data.find(d => d.name === n);
              if (match) return { id: match.id, name: match.name };
            } catch (_) {
              // ignore
            }
            return null;
          }));

          const found = lookups.filter(Boolean) as Array<{ id: string; name: string }>;
        //   const merged = [...found, ...suggestions].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);
          setCandidateSuggestions(found);
        } catch (e) {
          console.error('Failed to load candidate suggestions', e);
          setCandidateSuggestions([]);
        }
      };
      load();
    }
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
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Sign in</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-600">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sign in as</label>
          <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full rounded border px-3 py-2">
            <option value="admin">Admin / Recruiter</option>
            <option value="candidate">Candidate</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
          <input className="w-full rounded border px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin or candidate id" />
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" className="w-full rounded border px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="admin or candidate" />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Candidate login: <code>id</code> / <code>candidate</code>. Admin: <code>admin</code> / <code>admin</code></div>
          <Button type="submit" variant="primary">Sign in</Button>
        </div>
      </form>
    </div>
  );
};

export default Login;