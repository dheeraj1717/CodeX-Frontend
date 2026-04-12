import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import ProblemDescription from './pages/Description/ProblemDescription';
import ProblemList from './pages/ProblemList/ProblemList';

function App() {
  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/problems" replace />} />
          <Route path="/problems" element={<ProblemList />} />
          <Route path="/problems/:id" element={<ProblemDescription />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
