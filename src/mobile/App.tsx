import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MobileShell from './components/MobileShell';
import MobileStandardFlow from './pages/MobileStandardFlow';
import MobileRRSPFlow from './pages/MobileRRSPFlow';
import MobileFHSAFlow from './pages/MobileFHSAFlow';
import MobileRESPFlow from './pages/MobileRESPFlow';

export default function MobileApp() {
  return (
    <HashRouter>
      <div className="flex flex-1 flex-col min-h-0 min-w-0 h-full overflow-hidden">
        <MobileShell>
          <Routes>
            <Route path="/" element={<MobileStandardFlow />} />
            <Route path="/rrsp" element={<MobileRRSPFlow />} />
            <Route path="/fhsa" element={<MobileFHSAFlow />} />
            <Route path="/resp" element={<MobileRESPFlow />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MobileShell>
      </div>
    </HashRouter>
  );
}
