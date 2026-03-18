import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MobileShell from './components/MobileShell';
import MobileStandardFlow from './pages/MobileStandardFlow';

export default function MobileApp() {
  return (
    <BrowserRouter>
      <MobileShell>
        <Routes>
          <Route path="/" element={<MobileStandardFlow />} />
        </Routes>
      </MobileShell>
    </BrowserRouter>
  );
}
