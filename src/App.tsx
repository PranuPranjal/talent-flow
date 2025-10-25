import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './screens/Home/Home';
import JobsList from './screens/Jobs/JobsList';
import CandidatesList from './screens/Candidates/CandidatesList';
import AssessmentsList from './screens/Assessments/AssessmentsList';
import NotFound from './screens/NotFound';

function App() {
  return (
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
    </Router>
  );
}

export default App;