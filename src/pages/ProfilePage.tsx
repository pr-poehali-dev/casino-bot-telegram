import Icon from '@/components/ui/icon';

const HISTORY = [
  { id: 1, type: 'crash', result: 'win', amount: 500, multiplier: 3.2, time: '10:32' },
  { id: 2, type: 'crash', result: 'loss', amount: -200, multiplier: 1.1, time: '10:28' },
  { id: 3, type: 'case', result: 'win', amount: 1000, item: 'NOVA CASE', time: '10:15' },
  { id: 4, type: 'crash', result: 'win', amount: 1800, multiplier: 7.4, time: '09:55' },
  { id: 5, type: 'case', result: 'win', amount: 200, item: 'ROYAL CASE', time: '09:40' },
  { id: 6, type: 'crash', result: 'loss', amount: -1000, multiplier: 1.0, time: '09:20' },
  { id: 7, type: 'crash', result: 'win', amount: 350, multiplier: 2.3, time: '09:10' },
];

const STATS = {
  totalBets: 142,
  totalWon: 87650,
  totalLost: 72300,
  biggestWin: 15000,
  winRate: 52,
  level: 7,
  xp: 6800,
  nextLevelXp: 10000,
};

export default function ProfilePage() {
  const profit = STATS.totalWon - STATS.totalLost;
  const xpPct = (STATS.xp / STATS.nextLevelXp) * 100;

  return (
    <div className="flex flex-col pb-4 px-4">
      {/* Header */}
      <div className="py-4 flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{ background: 'linear-gradient(135deg, var(--nova-gold-dark), var(--nova-gold))', boxShadow: '0 0 20px rgba(212,168,67,0.4)' }}>
            👑
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--nova-card)', border: '2px solid var(--nova-gold)', color: 'var(--nova-gold)' }}>
            {STATS.level}
          </div>
        </div>
        <div>
          <div className="font-cormorant font-bold text-xl text-gold">Александр В.</div>
          <div className="text-xs mb-2" style={{ color: 'var(--nova-text-muted)' }}>@alexv • VIP Игрок</div>
          <div className="stars-badge">⭐ 5 000</div>
        </div>
        <button className="ml-auto w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <Icon name="Settings" size={16} />
        </button>
      </div>

      {/* XP bar */}
      <div className="nova-card p-3 mb-4">
        <div className="flex justify-between text-xs mb-2">
          <span style={{ color: 'var(--nova-text-muted)' }}>Уровень {STATS.level}</span>
          <span style={{ color: 'var(--nova-gold)' }}>{STATS.xp.toLocaleString()} / {STATS.nextLevelXp.toLocaleString()} XP</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg, var(--nova-gold-dark), var(--nova-gold-light))' }} />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="nova-card p-3 text-center">
          <div className="text-2xl font-cormorant font-bold text-gold">{STATS.totalBets}</div>
          <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>Всего ставок</div>
        </div>
        <div className="nova-card p-3 text-center">
          <div className="text-2xl font-cormorant font-bold" style={{ color: STATS.winRate > 50 ? 'var(--nova-green)' : '#ef4444' }}>
            {STATS.winRate}%
          </div>
          <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>Винрейт</div>
        </div>
        <div className="nova-card p-3 text-center">
          <div className="text-xl font-cormorant font-bold text-gold">⭐ {STATS.biggestWin.toLocaleString()}</div>
          <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>Максимальный выигрыш</div>
        </div>
        <div className="nova-card p-3 text-center">
          <div className={`text-xl font-cormorant font-bold ${profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {profit > 0 ? '+' : ''}⭐ {profit.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>Прибыль/убыток</div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--nova-gold)' }}>
        История ставок
      </div>
      <div className="space-y-2">
        {HISTORY.map(h => (
          <div key={h.id} className="nova-card p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: h.result === 'win' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}>
              {h.type === 'crash' ? '🚀' : '📦'}
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold" style={{ color: 'var(--nova-text)' }}>
                {h.type === 'crash' ? `Crash × ${h.multiplier}` : h.item}
              </div>
              <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>{h.time}</div>
            </div>
            <div className={`text-sm font-bold ${h.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {h.amount > 0 ? '+' : ''}⭐ {Math.abs(h.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
