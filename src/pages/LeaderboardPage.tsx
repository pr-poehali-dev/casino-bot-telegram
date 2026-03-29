import { useState } from 'react';
import Icon from '@/components/ui/icon';

const LEADERS = [
  { rank: 1, name: 'Сергей К.', username: '@serk', avatar: '🦅', balance: 285000, wins: 342, level: 99 },
  { rank: 2, name: 'Анна М.', username: '@annam', avatar: '🌙', balance: 198500, wins: 278, level: 87 },
  { rank: 3, name: 'Дмитрий Р.', username: '@dmitr', avatar: '🔥', balance: 156000, wins: 215, level: 74 },
  { rank: 4, name: 'Елена В.', username: '@elenav', avatar: '⚡', balance: 124300, wins: 189, level: 65 },
  { rank: 5, name: 'Максим Ш.', username: '@maxsh', avatar: '🎯', balance: 98700, wins: 167, level: 58 },
  { rank: 6, name: 'Ольга Т.', username: '@olgt', avatar: '💎', balance: 87200, wins: 143, level: 52 },
  { rank: 7, name: 'Алексей Б.', username: '@alexb', avatar: '🏆', balance: 76500, wins: 128, level: 47 },
  { rank: 8, name: 'Вы', username: '@you', avatar: '👑', balance: 5000, wins: 87, level: 7, isMe: true },
];

type Tab = 'balance' | 'wins';

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('balance');

  const sorted = [...LEADERS].sort((a, b) => {
    if (tab === 'balance') return b.balance - a.balance;
    return b.wins - a.wins;
  }).map((l, i) => ({ ...l, displayRank: i + 1 }));

  const meEntry = sorted.find(l => l.isMe);

  return (
    <div className="flex flex-col pb-4 px-4">
      <div className="py-4">
        <h1 className="font-cormorant font-bold text-2xl text-gold">Таблица лидеров</h1>
        <p className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>Топ игроков Nova Casino</p>
      </div>

      {/* Tab switch */}
      <div className="flex gap-2 mb-4 nova-card p-1">
        {(['balance', 'wins'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: tab === t ? 'linear-gradient(135deg, var(--nova-gold-dark), var(--nova-gold))' : 'transparent',
              color: tab === t ? '#0a0a0f' : 'var(--nova-text-muted)',
            }}>
            {t === 'balance' ? '⭐ По балансу' : '🏆 По победам'}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="flex items-end justify-center gap-2 mb-6 h-32">
        {/* 2nd */}
        <div className="flex flex-col items-center flex-1">
          <div className="text-2xl mb-1">{sorted[1]?.avatar}</div>
          <div className="text-xs font-bold truncate w-full text-center" style={{ color: 'var(--nova-silver)' }}>
            {sorted[1]?.name.split(' ')[0]}
          </div>
          <div className="w-full rounded-t-xl flex flex-col items-center justify-end py-2"
            style={{ height: '72px', background: 'linear-gradient(to bottom, rgba(168,180,200,0.2), rgba(168,180,200,0.05))', border: '1px solid rgba(168,180,200,0.3)' }}>
            <div className="text-silver font-cormorant font-bold text-xl">2</div>
          </div>
        </div>
        {/* 1st */}
        <div className="flex flex-col items-center flex-1">
          <div className="text-3xl mb-1">{sorted[0]?.avatar}</div>
          <div className="text-xs font-bold truncate w-full text-center text-gold">
            {sorted[0]?.name.split(' ')[0]}
          </div>
          <div className="w-full rounded-t-xl flex flex-col items-center justify-end py-2 gold-glow"
            style={{ height: '96px', background: 'linear-gradient(to bottom, rgba(212,168,67,0.25), rgba(212,168,67,0.05))', border: '1px solid rgba(212,168,67,0.4)' }}>
            <div className="text-gold font-cormorant font-bold text-2xl">👑</div>
          </div>
        </div>
        {/* 3rd */}
        <div className="flex flex-col items-center flex-1">
          <div className="text-2xl mb-1">{sorted[2]?.avatar}</div>
          <div className="text-xs font-bold truncate w-full text-center" style={{ color: '#cd7f32' }}>
            {sorted[2]?.name.split(' ')[0]}
          </div>
          <div className="w-full rounded-t-xl flex flex-col items-center justify-end py-2"
            style={{ height: '60px', background: 'linear-gradient(to bottom, rgba(205,127,50,0.2), rgba(205,127,50,0.05))', border: '1px solid rgba(205,127,50,0.3)' }}>
            <div className="font-cormorant font-bold text-xl" style={{ color: '#cd7f32' }}>3</div>
          </div>
        </div>
      </div>

      {/* Full list */}
      <div className="space-y-2">
        {sorted.map((player) => (
          <div key={player.username}
            className={`nova-card p-3 flex items-center gap-3 ${player.isMe ? 'border-gold' : ''}`}
            style={player.isMe ? { borderColor: 'var(--nova-gold)', background: 'rgba(212,168,67,0.05)' } : {}}>
            <div className="w-7 text-center">
              {player.displayRank <= 3 ? (
                <span className="text-lg">{['🥇', '🥈', '🥉'][player.displayRank - 1]}</span>
              ) : (
                <span className="text-xs font-bold" style={{ color: 'var(--nova-text-muted)' }}>#{player.displayRank}</span>
              )}
            </div>
            <div className="text-xl w-8 text-center">{player.avatar}</div>
            <div className="flex-1">
              <div className="text-sm font-bold flex items-center gap-1">
                {player.name}
                {player.isMe && <span className="text-xs px-1 rounded" style={{ background: 'rgba(212,168,67,0.2)', color: 'var(--nova-gold)' }}>Вы</span>}
              </div>
              <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>
                Lv.{player.level} • {player.wins} побед
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gold">
                ⭐ {player.balance.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* My position if not in top */}
      {meEntry && (
        <div className="mt-3 p-3 rounded-2xl text-center text-xs"
          style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', color: 'var(--nova-text-muted)' }}>
          Ваш ранг #{meEntry.displayRank} из {sorted.length} игроков
        </div>
      )}
    </div>
  );
}
