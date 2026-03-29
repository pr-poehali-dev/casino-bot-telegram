import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/hooks/useAuth';
import DepositModal from '@/components/DepositModal';
import CrashGame from '@/pages/CrashGame';
import CasesPage from '@/pages/CasesPage';
import ProfilePage from '@/pages/ProfilePage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import ReferralPage from '@/pages/ReferralPage';
import ShopPage from '@/pages/ShopPage';
import SupportPage from '@/pages/SupportPage';
import AdminPage from '@/pages/AdminPage';

type Tab = 'crash' | 'cases' | 'leaderboard' | 'shop' | 'profile';
type SubPage = 'referral' | 'support' | 'admin' | null;

const NAV_TABS = [
  { id: 'crash' as Tab, label: 'Crash', emoji: '🚀' },
  { id: 'cases' as Tab, label: 'Кейсы', emoji: '📦' },
  { id: 'leaderboard' as Tab, label: 'Топ', emoji: '🏆' },
  { id: 'shop' as Tab, label: 'Магазин', emoji: '💎' },
  { id: 'profile' as Tab, label: 'Профиль', emoji: '👤' },
];

export default function App() {
  const { user, loading, refreshUser } = useAuth();
  const [tab, setTab] = useState<Tab>('crash');
  const [subPage, setSubPage] = useState<SubPage>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);

  const balance = user?.balance ?? 0;

  const renderPage = () => {
    if (subPage === 'referral') return <ReferralPage user={user} />;
    if (subPage === 'support') return <SupportPage />;
    if (subPage === 'admin') return <AdminPage />;

    switch (tab) {
      case 'crash': return <CrashGame user={user} onBalanceChange={(b) => refreshUser({ balance: b })} />;
      case 'cases': return <CasesPage user={user} onBalanceChange={(b) => refreshUser({ balance: b })} />;
      case 'leaderboard': return <LeaderboardPage />;
      case 'shop': return <ShopPage user={user} onBalanceChange={(b) => refreshUser({ balance: b })} />;
      case 'profile': return <ProfilePage user={user} />;
    }
  };

  const currentLabel = subPage
    ? ({ referral: 'Рефералы', support: 'Поддержка', admin: 'Админ' } as Record<string, string>)[subPage]
    : NAV_TABS.find(t => t.id === tab)?.label;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh" style={{ background: 'var(--nova-bg)' }}>
        <div className="text-5xl animate-float mb-4">🚀</div>
        <div className="font-cormorant font-bold text-3xl text-gold mb-2">NOVA</div>
        <div className="text-sm" style={{ color: 'var(--nova-text-muted)' }}>Загружаем...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{
      height: '100dvh',
      maxWidth: '480px',
      margin: '0 auto',
      background: 'var(--nova-bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{
        background: 'rgba(10,10,15,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--nova-border)',
        zIndex: 30,
      }}>
        {subPage ? (
          <button onClick={() => setSubPage(null)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <Icon name="ArrowLeft" size={16} />
          </button>
        ) : (
          <div className="font-cormorant font-bold text-2xl" style={{
            background: 'linear-gradient(135deg, #f0c860, #d4a843, #a07820)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.08em',
          }}>
            NOVA
          </div>
        )}

        <div className="font-montserrat font-semibold text-sm" style={{ color: 'var(--nova-text-muted)' }}>
          {currentLabel}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowDeposit(true)} className="stars-badge text-xs" style={{ cursor: 'pointer' }}>
            ⭐ {balance.toLocaleString()}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ background: menuOpen ? 'rgba(212,168,67,0.2)' : 'rgba(255,255,255,0.08)' }}>
            <Icon name={menuOpen ? 'X' : 'Menu'} size={16} style={{ color: menuOpen ? 'var(--nova-gold)' : 'inherit' }} />
          </button>
        </div>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <>
          <div className="absolute inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-14 right-4 z-50 rounded-2xl py-2 min-w-52 animate-fade-in-up"
            style={{ background: 'var(--nova-card)', border: '1px solid var(--nova-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
            {([
              { id: 'referral' as SubPage, emoji: '💰', label: 'Рефералы' },
              { id: 'support' as SubPage, emoji: '🆘', label: 'Поддержка' },
              { id: 'admin' as SubPage, emoji: '🔐', label: 'Администратор' },
            ]).map(item => (
              <button key={item.id!} onClick={() => { setSubPage(item.id); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-left"
                style={{ color: 'var(--nova-text)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span className="text-base">{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            ))}
            <div className="mx-4 my-1" style={{ borderTop: '1px solid var(--nova-border)' }} />
            <button onClick={() => { setShowDeposit(true); setMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-left"
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span className="text-base">💳</span>
              <span style={{ color: 'var(--nova-gold)' }}>Пополнить баланс</span>
            </button>
          </div>
        </>
      )}

      {/* Page content */}
      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        {renderPage()}
      </div>

      {/* Bottom nav */}
      {!subPage && (
        <div className="shrink-0 flex items-center" style={{
          background: 'rgba(10,10,15,0.98)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--nova-border)',
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
          zIndex: 30,
        }}>
          {NAV_TABS.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 flex flex-col items-center py-2.5 gap-0.5 relative transition-all"
                style={{ color: active ? 'var(--nova-gold)' : 'var(--nova-text-muted)' }}>
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                    style={{ background: 'var(--nova-gold)', boxShadow: '0 0 8px var(--nova-gold)' }} />
                )}
                <span className="text-xl leading-none">{t.emoji}</span>
                <span className="font-montserrat font-medium" style={{ fontSize: '10px' }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Deposit modal */}
      {showDeposit && user && (
        <DepositModal
          userId={user.id}
          onClose={() => setShowDeposit(false)}
          onSuccess={(stars) => refreshUser({ balance: balance + stars })}
        />
      )}
    </div>
  );
}
