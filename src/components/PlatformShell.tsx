import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Mail, User, BarChart3, Briefcase, FileText, LayoutGrid } from 'lucide-react';

const NAV_ITEMS = [
  'Summary',
  'Move Money',
  'Documents',
  'Reports',
  'Management',
  'Questrade Plus',
  'Apps',
  'Products',
  'Tools',
];

const SIDEBAR_ICONS = [
  { icon: BarChart3, label: 'Markets' },
  { icon: Briefcase, label: 'Portfolio' },
  { icon: FileText, label: 'Documents' },
  { icon: LayoutGrid, label: 'Apps' },
];

export default function PlatformShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-qt-white">
      {/* Top ribbon */}
      <header className="flex items-center h-[48px] border-b border-qt-border/50 bg-white shrink-0 z-30">
        <button className="flex items-center justify-center w-12 h-full text-qt-secondary hover:text-qt-primary transition-colors">
          <Menu size={20} />
        </button>

        <nav className="flex items-center h-full flex-1">
          {NAV_ITEMS.map((item) => (
            <span
              key={item}
              onClick={item === 'Move Money' ? () => navigate('/') : undefined}
              className={`relative flex items-center h-full px-4 text-sm cursor-pointer transition-colors
                ${item === 'Move Money'
                  ? 'font-semibold text-qt-primary'
                  : 'text-qt-secondary hover:text-qt-primary'
                }`}
            >
              {item}
              {item === 'Move Money' && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-qt-green rounded-t" />
              )}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-1 pr-4">
          <button className="flex items-center justify-center size-9 rounded-full text-qt-secondary hover:text-qt-primary hover:bg-qt-bg-3 transition-colors">
            <Mail size={18} />
          </button>
          <button className="flex items-center justify-center size-9 rounded-full text-qt-secondary hover:text-qt-primary hover:bg-qt-bg-3 transition-colors">
            <User size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-[52px] bg-white border-r border-qt-border/50 flex flex-col items-center pt-4 gap-5 shrink-0">
          <img src="/questrade-logo.png" alt="Questrade" className="w-8 mb-1" />
          {SIDEBAR_ICONS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              title={label}
              className="flex items-center justify-center size-9 rounded-lg text-qt-secondary hover:text-qt-green-dark hover:bg-qt-green-bg/30 transition-colors"
            >
              <Icon size={20} />
            </button>
          ))}
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
