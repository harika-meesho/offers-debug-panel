import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@pages/HomePage';
import EventOffersPage from '@pages/EventOffersPage';
import OverlappingOffersPage from '@pages/OverlappingOffersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/event/:eventId" element={<EventOffersPage />} />
      <Route path="/event/:eventId/offer/:offerId/overlapping" element={<OverlappingOffersPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
