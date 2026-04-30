import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import CreatePage from './pages/CreatePage';
import MeetingPage from './pages/MeetingPage';
import LoginPage from './pages/LoginPage';

function Home() {
  const userName = localStorage.getItem('userName');
  const lastId = localStorage.getItem('lastMeetingId');
  if (!userName) return <Navigate to="/login" replace />;
  if (lastId) return <Navigate to={`/meeting/${lastId}`} replace />;
  return <Navigate to="/create" replace />;
}

function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const userName = localStorage.getItem('userName');
  if (!userName) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create" element={<RequireAuth><CreatePage /></RequireAuth>} />
        <Route path="/meeting/:id" element={<RequireAuth><MeetingPage /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}