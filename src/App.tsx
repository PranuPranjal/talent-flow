import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './screens/Auth/Login';
import { RequireAdmin, RequireAuth, CandidateRouteGuard } from './contexts/AuthContext';
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
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RequireAuth><CandidateRouteGuard><Layout /></CandidateRouteGuard></RequireAuth>}>
            <Route index element={<Home />} />
            <Route path="jobs" element={<JobsList />} />
            <Route path="jobs/:jobId" element={<JobDetail />} />
            <Route path="candidates" element={<RequireAdmin><CandidatesList /></RequireAdmin>} />
            <Route path="candidates/kanban" element={<RequireAdmin><CandidatesKanban /></RequireAdmin>} />
            <Route path="candidates/:id" element={<CandidateProfile />} />
            <Route path="assessments" element={<RequireAdmin><AssessmentsList /></RequireAdmin>} />
            <Route path="assessments/:jobId/builder" element={<RequireAdmin><AssessmentBuilder /></RequireAdmin>} />
            <Route path="assessments/:jobId/take" element={<AssessmentRuntime />} />
            <Route path="assessments/:jobId/responses" element={<RequireAdmin><AssessmentResponses /></RequireAdmin>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <DatabaseStatus />
        <NetworkStatus />
      </Router>
      </AuthProvider>
    </DatabaseProvider>
  );
}

export default App;