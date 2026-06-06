import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@pages/HomePage';
import EventOffersPage from '@pages/EventOffersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/event/:eventId" element={<EventOffersPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
