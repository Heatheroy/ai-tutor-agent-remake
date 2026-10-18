import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { MessageSquare, CheckSquare, Palette, Puzzle, Swords } from 'lucide-react';
import './index.css';

import { ChatView } from './components/chat/ChatView';

import { FlashcardsView } from './components/flashcards/FlashcardsView';
import { MemoryGame } from './components/game/MemoryGame';
import { BookIntro } from './components/intro/BookIntro';
import { LayoutEditor } from './components/layout/LayoutEditor';
import { QuestView } from './components/quest/QuestView';

function App() {
  type Theme = 'midnight-aurora' | 'forest-deep' | 'solar-flare' | 'light-frost';
  const themes: Theme[] = ['midnight-aurora', 'forest-deep', 'solar-flare', 'light-frost'];
  const themeLabels: Record<Theme, string> = {
    'midnight-aurora': '🌌 极光午夜',
    'forest-deep': '🌲 深林',
    'solar-flare': '🔥 日焰',
    'light-frost': '❄️ 霜白',
  };

  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem('app-theme') as Theme) || 'midnight-aurora'
  );
  const [introDone, setIntroDone] = useState(false);
  const finishIntro = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    const idx = themes.indexOf(theme);
    setTheme(themes[(idx + 1) % themes.length]);
  };

  return (
    <BrowserRouter>
      <TutorApp introDone={introDone} finishIntro={finishIntro} theme={theme} themeLabels={themeLabels} cycleTheme={cycleTheme} />
    </BrowserRouter>
  );
}

function TutorApp({
  introDone,
  finishIntro,
  theme,
  themeLabels,
  cycleTheme,
}: {
  introDone: boolean;
  finishIntro: () => void;
  theme: string;
  themeLabels: Record<string, string>;
  cycleTheme: () => void;
}) {
  const location = useLocation();
  if (location.pathname === '/layout') {
    return <LayoutEditor />;
  }

  return (
    <>
      {!introDone && <BookIntro onDone={finishIntro} />}
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1 style={{ marginBottom: 0 }}>🎓 AI 导师</h1>
            <p>多智能体检索学习助手</p>
          </div>
          
          <div className="nav-links">
            <NavLink to="/chat" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <MessageSquare size={20} />
              AI 导师
            </NavLink>
            <NavLink to="/flashcards" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <CheckSquare size={20} />
              闪卡与测验
            </NavLink>
            <NavLink to="/quest" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <Swords size={20} />
              闯关
            </NavLink>
            <NavLink to="/game" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <Puzzle size={20} />
              记忆配对
            </NavLink>
          </div>

          <div className="sidebar-header" style={{ borderBottom: 'none', borderTop: 'var(--border)' }}>
            <button onClick={cycleTheme} className="nav-item" style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'inherit' }}>
              <Palette size={20} />
              {themeLabels[theme]}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/chat" element={<ChatView />} />
            <Route path="/flashcards" element={<FlashcardsView />} />
            <Route path="/game" element={<MemoryGame />} />
            <Route path="/quest" element={<QuestView />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
