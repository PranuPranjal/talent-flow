import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DatabaseProvider } from './contexts/DatabaseContext';
import Layout from './components/Layout/Layout';
import Home from './screens/Home/Home';
import JobsList from './screens/Jobs/JobsList';
import JobDetail from './screens/Jobs/JobDetail';
import CandidatesList from './screens/Candidates/CandidatesList';
import CandidatesKanban from './screens/Candidates/CandidatesKanban';
import CandidateProfile from './screens/Candidates/CandidateProfile';
import AssessmentsList from './screens/Assessments/AssessmentsList';
import AssessmentBuilder from './screens/Assessments/AssessmentBuilder';
import AssessmentRuntime from './screens/Assessments/AssessmentRuntime';
import AssessmentResponses from './screens/Assessments/AssessmentResponses';
import NotFound from './screens/NotFound';
import DatabaseStatus from './components/UI/DatabaseStatus';
import NetworkStatus from './components/UI/NetworkStatus';

function App() {
  return (
    <DatabaseProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
                      <Route path="jobs" element={<JobsList />} />
                      <Route path="jobs/:jobId" element={<JobDetail />} />
              <Route path="candidates" element={<CandidatesList />} />
              <Route path="candidates/kanban" element={<CandidatesKanban />} />
              <Route path="candidates/:id" element={<CandidateProfile />} />
              <Route path="assessments" element={<AssessmentsList />} />
              <Route path="assessments/:jobId/builder" element={<AssessmentBuilder />} />
              <Route path="assessments/:jobId/take" element={<AssessmentRuntime />} />
              <Route path="assessments/:jobId/responses" element={<AssessmentResponses />} />
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