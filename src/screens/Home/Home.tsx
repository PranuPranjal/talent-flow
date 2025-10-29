import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, jobService } from '../../db/services';
import { HiBriefcase, HiUsers, HiClipboardList } from 'react-icons/hi';
import { motion } from 'framer-motion';

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
    <div className="max-h-100vh w-full flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-5xl flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 drop-shadow">
            Welcome to TalentFlow
          </h1>
          <p className="text-lg text-gray-600">
            Streamline your hiring process with our all-in-one talent management platform.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-12"
        >
          <div className="rounded-2xl bg-gradient-to-br from-blue-100/70 to-blue-50/80 p-8 shadow-lg border border-blue-200 hover:scale-105 transition-transform">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-200 rounded-xl">
                <HiBriefcase className="w-8 h-8 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{activeJobs}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-green-100/70 to-green-50/80 p-8 shadow-lg border border-green-200 hover:scale-105 transition-transform">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-200 rounded-xl">
                <HiUsers className="w-8 h-8 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Total Candidates</p>
                <p className="text-3xl font-bold text-gray-900">{totalCandidates}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-purple-100/70 to-purple-50/80 p-8 shadow-lg border border-purple-200 hover:scale-105 transition-transform">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-200 rounded-xl">
                <HiClipboardList className="w-8 h-8 text-purple-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Assessments</p>
                <p className="text-3xl font-bold text-gray-900">{totalAssessments}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
        >
          <Link
            to="/jobs"
            className="rounded-2xl bg-white/90 border border-blue-100 p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-transform"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <HiBriefcase className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Manage Jobs</h3>
                <p className="text-gray-600">Create, edit, and track job postings</p>
              </div>
            </div>
          </Link>

          <Link
            to="/candidates"
            className="rounded-2xl bg-white/90 border border-green-100 p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-transform"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <HiUsers className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">View Candidates</h3>
                <p className="text-gray-600">Track candidate progress through stages</p>
              </div>
            </div>
          </Link>

          <Link
            to="/assessments"
            className="rounded-2xl bg-white/90 border border-purple-100 p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-transform"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <HiClipboardList className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Create Assessments</h3>
                <p className="text-gray-600">Build custom assessments for jobs</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;