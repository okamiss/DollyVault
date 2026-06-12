import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TabBar } from 'antd-mobile';
import { BarChart3, BookOpen, Home, ImageDown, UserRound } from 'lucide-react';

const tabs = [
  { key: '/', title: '首页', icon: <Home size={20} /> },
  { key: '/stats', title: '统计', icon: <BarChart3 size={20} /> },
  { key: '/catalog', title: '图鉴', icon: <BookOpen size={20} /> },
  { key: '/poster', title: '海报', icon: <ImageDown size={20} /> },
  { key: '/me', title: '我的', icon: <UserRound size={20} /> },
];

function activeKey(pathname: string) {
  if (pathname.startsWith('/stats')) return '/stats';
  if (pathname.startsWith('/catalog')) return '/catalog';
  if (pathname.startsWith('/poster')) return '/poster';
  if (pathname.startsWith('/me')) return '/me';
  return '/';
}

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const current = activeKey(location.pathname);

  return (
    <div className="app-shell">
      <aside className="desktop-nav">
        <button className="brand-button" onClick={() => navigate('/')}>
          DollyVault
        </button>
        <nav>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={current === tab.key ? 'nav-item active' : 'nav-item'}
              onClick={() => navigate(tab.key)}
              title={tab.title}
            >
              {tab.icon}
              <span>{tab.title}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="page-frame">
        <Outlet />
      </main>
      <div className="mobile-tabbar">
        <TabBar activeKey={current} onChange={(key) => navigate(key)}>
          {tabs.map((tab) => (
            <TabBar.Item key={tab.key} icon={tab.icon} title={tab.title} />
          ))}
        </TabBar>
      </div>
    </div>
  );
}
