import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { TgUser } from '@/hooks/useAuth';
interface Props { user: TgUser | null; }

const REFS = [
  { name: 'Иван П.', date: '27 марта', earned: 250, active: true },
  { name: 'Катя М.', date: '25 марта', earned: 150, active: true },
  { name: 'Олег В.', date: '20 марта', earned: 0, active: false },
];

export default function ReferralPage({ user }: Props) {
  const [copied, setCopied] = useState(false);
  const refCode = user?.referral_code || 'NOVA-XXXXX';
  const refLink = `https://t.me/NovaGames_bot?start=${refCode}`;

  const copyLink = () => {
    navigator.clipboard?.writeText(refLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col pb-4 px-4">
      <div className="py-4">
        <h1 className="font-cormorant font-bold text-2xl text-gold">Рефералы</h1>
        <p className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>Приглашай друзей и зарабатывай</p>
      </div>

      {/* Main card */}
      <div className="rounded-2xl p-5 mb-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(212,168,67,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(212,168,67,0.3)' }}>
        <div className="text-4xl absolute right-4 top-4 opacity-20">💰</div>
        <div className="relative z-10">
          <div className="font-cormorant font-bold text-3xl text-gold mb-1">+5%</div>
          <div className="text-sm font-bold mb-1" style={{ color: 'var(--nova-text)' }}>С каждой ставки друга</div>
          <div className="text-xs" style={{ color: 'var(--nova-text-muted)', lineHeight: 1.6 }}>
            Вы получаете 5% от проигрышей приглашённых друзей. Бесконечные рефералы.
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="nova-card p-3 text-center">
          <div className="text-2xl font-cormorant font-bold text-gold">3</div>
          <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>Друзей</div>
        </div>
        <div className="nova-card p-3 text-center">
          <div className="text-2xl font-cormorant font-bold text-green-400">400</div>
          <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>Заработано ⭐</div>
        </div>
        <div className="nova-card p-3 text-center">
          <div className="text-2xl font-cormorant font-bold" style={{ color: 'var(--nova-silver)' }}>2</div>
          <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>Активных</div>
        </div>
      </div>

      {/* Ref link */}
      <div className="nova-card p-4 mb-4">
        <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--nova-gold)' }}>
          Ваша реферальная ссылка
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 text-sm py-2 px-3 rounded-xl overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--nova-text-muted)', fontSize: '11px' }}>
            {refLink}
          </div>
          <button onClick={copyLink}
            className="shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all btn-gold">
            {copied ? '✓' : <Icon name="Copy" size={14} />}
          </button>
        </div>
        <div className="text-xs mt-2 text-center" style={{ color: 'var(--nova-text-muted)' }}>
          Код: <span style={{ color: 'var(--nova-gold)' }}>{refCode}</span>
        </div>
      </div>

      {/* Levels */}
      <div className="nova-card p-4 mb-4">
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--nova-gold)' }}>
          Уровни реферальной программы
        </div>
        <div className="space-y-2">
          {[
            { level: 'Бронза', refs: '1-5', pct: '3%', color: '#cd7f32' },
            { level: 'Серебро', refs: '6-20', pct: '5%', color: '#a8b4c8' },
            { level: 'Золото', refs: '21-50', pct: '7%', color: '#d4a843' },
            { level: 'Платина', refs: '50+', pct: '10%', color: '#e0e0ff' },
          ].map(l => (
            <div key={l.level} className="flex items-center justify-between py-2 px-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.05)` }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                <span className="text-sm font-bold" style={{ color: l.color }}>{l.level}</span>
                <span className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>{l.refs} реф.</span>
              </div>
              <span className="text-sm font-bold" style={{ color: l.color }}>{l.pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Referrals list */}
      <div className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--nova-gold)' }}>
        Ваши рефералы
      </div>
      <div className="space-y-2">
        {REFS.map((r, i) => (
          <div key={i} className="nova-card p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ background: r.active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)' }}>
                👤
              </div>
              <div>
                <div className="text-sm font-bold">{r.name}</div>
                <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>
                  {r.date} • {r.active ? <span className="text-green-400">Активен</span> : <span style={{ color: 'var(--nova-text-muted)' }}>Неактивен</span>}
                </div>
              </div>
            </div>
            <div className="text-sm font-bold text-green-400">+⭐ {r.earned}</div>
          </div>
        ))}
      </div>
    </div>
  );
}