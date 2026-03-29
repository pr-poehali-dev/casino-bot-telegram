import { useState } from 'react';
import Icon from '@/components/ui/icon';

const ADMIN_PASS = '1234';

const STATS = {
  totalUsers: 1842,
  activeToday: 234,
  revenue: 485200,
  gamesPlayed: 12847,
  casesOpened: 3219,
  houseProfit: 48520,
  houseProfitPct: 10.2,
};

const RECENT_USERS = [
  { id: 1, name: 'Сергей К.', balance: 28500, status: 'active', joined: '12.03.26' },
  { id: 2, name: 'Анна М.', balance: 19850, status: 'active', joined: '15.03.26' },
  { id: 3, name: 'Дмитрий Р.', balance: 5600, status: 'blocked', joined: '10.03.26' },
  { id: 4, name: 'Вы (тест)', balance: 5000, status: 'active', joined: '29.03.26' },
];

const RECENT_GAMES = [
  { id: 1, type: 'Crash', user: 'Сергей К.', bet: 1000, result: 'loss', crash: '1.2×' },
  { id: 2, type: 'Case', user: 'Анна М.', bet: 500, result: 'win', crash: '200 ⭐' },
  { id: 3, type: 'Crash', user: 'Дмитрий', bet: 2000, result: 'win', crash: '3.4×' },
  { id: 4, type: 'Crash', user: 'Елена В.', bet: 500, result: 'loss', crash: '1.0×' },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'games' | 'settings'>('stats');
  const [crashEdge, setCrashEdge] = useState(5);

  const login = () => {
    if (pass === ADMIN_PASS) {
      setAuthed(true);
      setError('');
    } else {
      setError('Неверный пароль');
    }
  };

  if (!authed) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 py-16">
        <div className="text-5xl mb-4 animate-float">🔐</div>
        <div className="font-cormorant font-bold text-2xl text-gold mb-1">Панель управления</div>
        <div className="text-xs mb-6" style={{ color: 'var(--nova-text-muted)' }}>Только для администратора</div>
        
        <div className="w-full nova-card p-4">
          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            className="nova-input mb-3 text-center tracking-widest"
            placeholder="••••••••"
          />
          {error && <div className="text-red-400 text-xs text-center mb-2">{error}</div>}
          <button onClick={login} className="w-full py-3 rounded-xl font-bold btn-gold font-montserrat">
            Войти
          </button>
          <div className="text-xs text-center mt-2" style={{ color: 'var(--nova-text-muted)' }}>Демо пароль: 1234</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-cormorant font-bold text-xl text-gold">Админ панель</div>
          <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>Nova Casino Dashboard</div>
        </div>
        <button onClick={() => setAuthed(false)}
          className="text-xs px-3 py-1 rounded-full"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
          Выйти
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 mb-4">
        {([
          { k: 'stats', label: '📊' },
          { k: 'users', label: '👥' },
          { k: 'games', label: '🎮' },
          { k: 'settings', label: '⚙️' },
        ] as {k: typeof activeTab, label: string}[]).map(t => (
          <button key={t.k} onClick={() => setActiveTab(t.k)}
            className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: activeTab === t.k ? 'rgba(212,168,67,0.2)' : 'rgba(255,255,255,0.05)',
              color: activeTab === t.k ? 'var(--nova-gold)' : 'var(--nova-text-muted)',
              border: activeTab === t.k ? '1px solid rgba(212,168,67,0.3)' : '1px solid transparent',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {activeTab === 'stats' && (
          <div className="space-y-3">
            {/* House profit — главное для владельца */}
            <div className="rounded-2xl p-4"
              style={{ background: 'linear-gradient(135deg, rgba(212,168,67,0.2), rgba(212,168,67,0.05))', border: '1px solid rgba(212,168,67,0.4)' }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-1 text-gold">Прибыль дома</div>
              <div className="font-cormorant font-bold text-3xl text-gold">⭐ {STATS.houseProfit.toLocaleString()}</div>
              <div className="text-sm mt-1 text-green-400 font-bold">+{STATS.houseProfitPct}% маржа</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="nova-card p-3 text-center">
                <div className="text-xl font-cormorant font-bold text-gold">{STATS.totalUsers.toLocaleString()}</div>
                <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>Всего игроков</div>
              </div>
              <div className="nova-card p-3 text-center">
                <div className="text-xl font-cormorant font-bold text-green-400">{STATS.activeToday}</div>
                <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>Активны сегодня</div>
              </div>
              <div className="nova-card p-3 text-center">
                <div className="text-xl font-cormorant font-bold" style={{ color: 'var(--nova-silver)' }}>
                  {STATS.gamesPlayed.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>Игр сыграно</div>
              </div>
              <div className="nova-card p-3 text-center">
                <div className="text-xl font-cormorant font-bold" style={{ color: '#a78bfa' }}>
                  {STATS.casesOpened.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>Кейсов открыто</div>
              </div>
            </div>

            <div className="nova-card p-3">
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--nova-gold)' }}>
                Общий оборот
              </div>
              <div className="font-cormorant font-bold text-2xl text-gold">⭐ {STATS.revenue.toLocaleString()}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--nova-text-muted)' }}>За всё время</div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-2">
            {RECENT_USERS.map(u => (
              <div key={u.id} className="nova-card p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{ background: u.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}>
                  👤
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{u.name}</div>
                  <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>
                    С {u.joined} • <span style={{ color: u.status === 'active' ? 'var(--nova-green)' : '#ef4444' }}>
                      {u.status === 'active' ? 'Активен' : 'Заблокирован'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gold">⭐ {u.balance.toLocaleString()}</div>
                  <div className="flex gap-1 mt-1 justify-end">
                    <button className="text-xs px-2 py-0.5 rounded"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                      {u.status === 'active' ? 'Блок' : 'Разбл.'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'games' && (
          <div className="space-y-2">
            {RECENT_GAMES.map(g => (
              <div key={g.id} className="nova-card p-3 flex items-center gap-3">
                <div className="text-xl">{g.type === 'Crash' ? '🚀' : '📦'}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{g.user}</div>
                  <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>
                    {g.type} • {g.crash}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${g.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                    {g.result === 'win' ? '🟢' : '🔴'} ⭐ {g.bet}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-3">
            <div className="nova-card p-4">
              <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--nova-gold)' }}>
                Параметры Crash
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: 'var(--nova-text)' }}>Преимущество дома</span>
                  <span style={{ color: 'var(--nova-gold)' }}>{crashEdge}%</span>
                </div>
                <input
                  type="range" min="2" max="15" value={crashEdge}
                  onChange={e => setCrashEdge(+e.target.value)}
                  className="w-full accent-yellow-500"
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--nova-text-muted)' }}>
                  <span>2% (щедро)</span>
                  <span>15% (агрессивно)</span>
                </div>
              </div>
              <button className="w-full py-2.5 rounded-xl font-bold text-sm btn-gold font-montserrat">
                Сохранить настройки
              </button>
            </div>

            <div className="nova-card p-4">
              <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--nova-gold)' }}>
                Технические настройки
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Режим обслуживания', val: false },
                  { label: 'Рефералы активны', val: true },
                  { label: 'Кейсы доступны', val: true },
                  { label: 'Вывод заморожен', val: false },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b"
                    style={{ borderColor: 'var(--nova-border)' }}>
                    <span className="text-sm" style={{ color: 'var(--nova-text)' }}>{s.label}</span>
                    <div className={`w-10 h-5 rounded-full relative cursor-pointer ${s.val ? 'bg-green-500/30' : 'bg-red-500/20'}`}
                      style={{ border: `1px solid ${s.val ? '#22c55e' : '#ef4444'}` }}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${s.val ? 'right-0.5 bg-green-400' : 'left-0.5 bg-red-400'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
