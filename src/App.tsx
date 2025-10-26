import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { initializeMSW } from './msw';
import Layout from './components/Layout/Layout';
import Home from './screens/Home/Home';
import JobsList from './screens/Jobs/JobsList';
import CandidatesList from './screens/Candidates/CandidatesList';
import AssessmentsList from './screens/Assessments/AssessmentsList';
import NotFound from './screens/NotFound';
import DatabaseStatus from './components/UI/DatabaseStatus';
import NetworkStatus from './components/UI/NetworkStatus';

function App() {
  useEffect(() => {
    // Initialize MSW in development
    if (import.meta.env.DEV) {
      initializeMSW().catch(console.error);
    }
  }, []);

  return (
    <DatabaseProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="jobs" element={<JobsList />} />
            <Route path="candidates" element={<CandidatesList />} />
            <Route path="assessments" element={<AssessmentsList />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <DatabaseStatus />
        <NetworkStatus />
      </Router>
    </DatabaseProvider>
  );
}

export default App;