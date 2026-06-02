import { Routes, Route, Navigate } from 'react-router-dom';
import DebugPanel from '@pages/DebugPanel';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/debug" replace />} />
      <Route path="/debug/*" element={<DebugPanel />} />
    </Routes>
  );
}
