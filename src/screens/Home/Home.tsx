import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, jobService } from '../../db/services';
import { HiBriefcase, HiUsers, HiClipboardList } from 'react-icons/hi';

const Home: React.FC = () => {
  const [activeJobs, setActiveJobs] = useState(0);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [totalAssessments, setTotalAssessments] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const stats = await jobService.getJobStats();
        setActiveJobs(stats.active);
      } catch {}
      try {
        const cand = await db.candidates.count();
        setTotalCandidates(cand);
      } catch {}
      try {
        const ass = await db.assessments.count();
        setTotalAssessments(ass);
      } catch {}
    };
    load();
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 py-8 px-2">
      <div className="w-full max-w-3xl">
        <div className="app-card p-8 sm:p-10 flex flex-col items-center shadow-xl border border-gray-100/40" style={{backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.85)'}}>
          {/* Hero section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight drop-shadow">Welcome to TalentFlow</h1>
            <p className="text-lg text-gray-600 mb-2">Streamline your hiring process with our comprehensive talent management platform</p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
            <div className="rounded-xl bg-gradient-to-br from-blue-100/60 to-blue-50/80 shadow-lg border border-blue-200 p-6 flex items-center">
              <div className="p-3 bg-blue-200 rounded-lg shadow">
                <HiBriefcase className="w-7 h-7 text-blue-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{activeJobs}</p>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-green-100/60 to-green-50/80 shadow-lg border border-green-200 p-6 flex items-center">
              <div className="p-3 bg-green-200 rounded-lg shadow">
                <HiUsers className="w-7 h-7 text-green-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700">Total Candidates</p>
                <p className="text-2xl font-bold text-gray-900">{totalCandidates}</p>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-purple-100/60 to-purple-50/80 shadow-lg border border-purple-200 p-6 flex items-center">
              <div className="p-3 bg-purple-200 rounded-lg shadow">
                <HiClipboardList className="w-7 h-7 text-purple-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-700">Assessments</p>
                <p className="text-2xl font-bold text-gray-900">{totalAssessments}</p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <Link to="/jobs" className="rounded-xl bg-white/90 shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-shadow flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <HiBriefcase className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Jobs</h3>
                <p className="text-gray-600">Create, edit, and track job postings</p>
              </div>
            </Link>
            <Link to="/candidates" className="rounded-xl bg-white/90 shadow-lg border border-green-100 p-6 hover:shadow-xl transition-shadow flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <HiUsers className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">View Candidates</h3>
                <p className="text-gray-600">Track candidate progress through stages</p>
              </div>
            </Link>
            <Link to="/assessments" className="rounded-xl bg-white/90 shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-shadow flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <HiClipboardList className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Create Assessments</h3>
                <p className="text-gray-600">Build custom assessments for jobs</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
