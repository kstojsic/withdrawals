import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StandardFlow from './pages/StandardFlow';
import RRSPFlow from './pages/RRSPFlow';
import FHSAFlow from './pages/FHSAFlow';
import RESPFlow from './pages/RESPFlow';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StandardFlow />} />
        <Route path="/withdraw/rrsp" element={<RRSPFlow />} />
        <Route path="/withdraw/fhsa" element={<FHSAFlow />} />
        <Route path="/withdraw/resp" element={<RESPFlow />} />
      </Routes>
    </BrowserRouter>
  );
}
