import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import type { TgUser } from '@/hooks/useAuth';

interface Props { user: TgUser | null; onBalanceChange: (b: number) => void; }

interface CaseItem {
  id: number;
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'impossible';
  value: number;
  chance: number;
  type: 'stars' | 'gift';
}

interface CaseConfig {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  items: CaseItem[];
}

const CASES: CaseConfig[] = [
  {
    id: 'nova',
    name: 'NOVA CASE',
    price: 150,
    image: 'https://cdn.poehali.dev/projects/104add5e-9b2c-48d6-879c-7df9ca458742/files/bf3e2021-1c1b-458e-bb23-7e8e00f1bf73.jpg',
    description: 'Стандартный кейс со звёздами',
    items: [
      { id: 1, name: '50 звёзд', emoji: '⭐', rarity: 'common', value: 50, chance: 40, type: 'stars' },
      { id: 2, name: '100 звёзд', emoji: '⭐', rarity: 'common', value: 100, chance: 30, type: 'stars' },
      { id: 3, name: '200 звёзд', emoji: '💫', rarity: 'rare', value: 200, chance: 18, type: 'stars' },
      { id: 4, name: '500 звёзд', emoji: '✨', rarity: 'epic', value: 500, chance: 10, type: 'stars' },
      { id: 5, name: '1000 звёзд', emoji: '🌟', rarity: 'legendary', value: 1000, chance: 1.99, type: 'stars' },
      { id: 6, name: 'NFT Подарок', emoji: '🎁', rarity: 'impossible', value: 5000, chance: 0.01, type: 'gift' },
    ]
  },
  {
    id: 'royal',
    name: 'ROYAL CASE',
    price: 500,
    image: 'https://cdn.poehali.dev/projects/104add5e-9b2c-48d6-879c-7df9ca458742/files/25ebef05-1481-4c71-bb0e-ea02f69d36bc.jpg',
    description: 'Премиум кейс с редкими NFT',
    items: [
      { id: 1, name: '200 звёзд', emoji: '⭐', rarity: 'common', value: 200, chance: 40, type: 'stars' },
      { id: 2, name: '400 звёзд', emoji: '💫', rarity: 'rare', value: 400, chance: 28, type: 'stars' },
      { id: 3, name: '800 звёзд', emoji: '✨', rarity: 'epic', value: 800, chance: 18, type: 'stars' },
      { id: 4, name: '2000 звёзд', emoji: '🌟', rarity: 'legendary', value: 2000, chance: 12, type: 'stars' },
      { id: 5, name: '5000 звёзд', emoji: '👑', rarity: 'legendary', value: 5000, chance: 1.989, type: 'stars' },
      { id: 6, name: 'NFT Золотой Подарок', emoji: '🏆', rarity: 'impossible', value: 25000, chance: 0.001, type: 'gift' },
    ]
  }
];

function rollItem(items: CaseItem[]): CaseItem {
  // Нормализуем шансы
  const weights = items.map(item => {
    // Все NFT/impossible подарки — шанс практически нулевой
    if (item.rarity === 'impossible') return 0.0001;
    return item.chance;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return items[i];
  }
  return items[0];
}

const RARITY_COLORS = {
  common: 'rgba(168, 180, 200, 0.2)',
  rare: 'rgba(96, 165, 250, 0.2)',
  epic: 'rgba(139, 92, 246, 0.2)',
  legendary: 'rgba(212, 168, 67, 0.2)',
  impossible: 'rgba(240, 200, 96, 0.15)',
};

const RARITY_BORDERS = {
  common: '#a8b4c8',
  rare: '#60a5fa',
  epic: '#8b5cf6',
  legendary: '#d4a843',
  impossible: '#f0c860',
};

const RARITY_LABELS = {
  common: 'Обычный',
  rare: 'Редкий',
  epic: 'Эпический',
  legendary: 'Легендарный',
  impossible: '✨ NFT',
};

export default function CasesPage({ user, onBalanceChange }: Props) {
  const [selectedCase, setSelectedCase] = useState<CaseConfig | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonItem, setWonItem] = useState<CaseItem | null>(null);
  const [spinItems, setSpinItems] = useState<CaseItem[]>([]);
  const [spinOffset, setSpinOffset] = useState(0);
  const [localBalance, setLocalBalance] = useState<number | null>(null);
  const balance = localBalance ?? user?.balance ?? 0;
  const setBalance = (val: number) => { setLocalBalance(val); onBalanceChange(val); };
  const [openCount, setOpenCount] = useState(1);
  const [results, setResults] = useState<CaseItem[]>([]);

  const ITEM_WIDTH = 120;
  const VISIBLE = 5;

  const openCase = async () => {
    if (!selectedCase || isSpinning || balance < selectedCase.price * openCount) return;
    
    setBalance(prev => prev - selectedCase.price * openCount);
    setIsSpinning(true);
    setWonItem(null);
    setResults([]);
    
    const won = rollItem(selectedCase.items);
    
    // Generate spin strip
    const strip: CaseItem[] = [];
    for (let i = 0; i < 40; i++) {
      strip.push(selectedCase.items[Math.floor(Math.random() * selectedCase.items.length)]);
    }
    // Place won item near end
    const winPos = 33;
    strip[winPos] = won;
    
    setSpinItems(strip);
    setSpinOffset(0);
    
    // Animate
    const targetOffset = -(winPos - Math.floor(VISIBLE / 2)) * ITEM_WIDTH;
    
    await new Promise<void>(resolve => {
      let start: number | null = null;
      const duration = 3500;
      
      const animate = (ts: number) => {
        if (!start) start = ts;
        const elapsed = ts - start;
        const progress = Math.min(elapsed / duration, 1);
        // Easing: ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setSpinOffset(eased * targetOffset);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
    
    setWonItem(won);
    setIsSpinning(false);
    
    if (won.type === 'stars') {
      setBalance(prev => prev + won.value);
    }
    setResults([won]);
  };

  if (selectedCase) {
    return (
      <div className="flex flex-col pb-4 min-h-full">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => { setSelectedCase(null); setWonItem(null); }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <Icon name="ArrowLeft" size={16} />
          </button>
          <div>
            <div className="font-cormorant font-bold text-lg text-gold">{selectedCase.name}</div>
            <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>{selectedCase.description}</div>
          </div>
          <div className="ml-auto stars-badge">⭐ {balance.toLocaleString()}</div>
        </div>

        {/* Spin strip */}
        <div className="mx-4 relative overflow-hidden rounded-2xl"
          style={{ height: '140px', background: 'var(--nova-card)', border: '1px solid var(--nova-border)' }}>
          
          {/* Center indicator */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 z-10"
            style={{ background: 'var(--nova-gold)', boxShadow: '0 0 10px var(--nova-gold)' }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 z-10"
            style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '12px solid var(--nova-gold)' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 z-10"
            style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '12px solid var(--nova-gold)' }} />
          
          {/* Fade edges */}
          <div className="absolute inset-y-0 left-0 w-16 z-10"
            style={{ background: 'linear-gradient(to right, var(--nova-card), transparent)' }} />
          <div className="absolute inset-y-0 right-0 w-16 z-10"
            style={{ background: 'linear-gradient(to left, var(--nova-card), transparent)' }} />

          {/* Strip */}
          {spinItems.length > 0 ? (
            <div className="absolute inset-y-0 flex items-center"
              style={{ transform: `translateX(calc(50% + ${spinOffset}px + ${ITEM_WIDTH / 2}px))`, transition: isSpinning ? 'none' : 'transform 0.1s' }}>
              {spinItems.map((item, i) => (
                <div key={i} className="shrink-0 flex flex-col items-center justify-center rounded-xl mx-1 p-2"
                  style={{
                    width: `${ITEM_WIDTH - 8}px`,
                    height: '112px',
                    background: RARITY_COLORS[item.rarity],
                    border: `1px solid ${RARITY_BORDERS[item.rarity]}`,
                  }}>
                  <div className="text-4xl mb-1">{item.emoji}</div>
                  <div className="text-xs font-bold text-center leading-tight" style={{ color: RARITY_BORDERS[item.rarity] }}>
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl animate-float">📦</div>
            </div>
          )}
        </div>

        {/* Won item display */}
        {wonItem && !isSpinning && (
          <div className="mx-4 mt-3 p-4 rounded-2xl text-center animate-fade-in-up"
            style={{ background: RARITY_COLORS[wonItem.rarity], border: `1px solid ${RARITY_BORDERS[wonItem.rarity]}` }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: RARITY_BORDERS[wonItem.rarity] }}>
              {RARITY_LABELS[wonItem.rarity]}
            </div>
            <div className="text-5xl mb-2">{wonItem.emoji}</div>
            <div className="font-cormorant font-bold text-xl" style={{ color: RARITY_BORDERS[wonItem.rarity] }}>
              {wonItem.name}
            </div>
            {wonItem.type === 'stars' && (
              <div className="text-sm mt-1" style={{ color: 'var(--nova-text-muted)' }}>
                +{wonItem.value} ⭐ зачислено на баланс
              </div>
            )}
            {wonItem.type === 'gift' && (
              <div className="text-sm mt-1 font-bold text-yellow-400">
                🎉 Редчайший выигрыш! Свяжитесь с поддержкой
              </div>
            )}
          </div>
        )}

        {/* Open controls */}
        <div className="mx-4 mt-3 nova-card p-4">
          <div className="flex gap-2 mb-3">
            {[1, 3, 5].map(n => (
              <button key={n} onClick={() => setOpenCount(n)}
                className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: openCount === n ? 'rgba(212,168,67,0.2)' : 'rgba(255,255,255,0.05)',
                  color: openCount === n ? 'var(--nova-gold)' : 'var(--nova-text-muted)',
                  border: `1px solid ${openCount === n ? 'rgba(212,168,67,0.4)' : 'transparent'}`,
                }}>
                ×{n}
              </button>
            ))}
          </div>
          <button onClick={openCase}
            disabled={isSpinning || balance < selectedCase.price * openCount}
            className="w-full py-3 rounded-xl font-bold text-base btn-gold disabled:opacity-40 font-montserrat">
            {isSpinning ? '🎰 Крутим...' : `Открыть за ⭐ ${(selectedCase.price * openCount).toLocaleString()}`}
          </button>
        </div>

        {/* Items list */}
        <div className="mx-4 mt-4">
          <div className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--nova-gold)' }}>
            Содержимое кейса
          </div>
          <div className="grid grid-cols-3 gap-2">
            {selectedCase.items.map(item => (
              <div key={item.id} className="flex flex-col items-center p-2 rounded-xl text-center"
                style={{ background: RARITY_COLORS[item.rarity], border: `1px solid ${RARITY_BORDERS[item.rarity]}` }}>
                <div className="text-2xl mb-1">{item.emoji}</div>
                <div className="text-xs font-bold leading-tight mb-1" style={{ color: RARITY_BORDERS[item.rarity] }}>
                  {item.name}
                </div>
                <div className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>
                  {item.rarity === 'impossible' ? '< 0.01%' : `${item.chance}%`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-4 px-4">
      <div className="flex items-center justify-between py-3">
        <div>
          <h1 className="font-cormorant font-bold text-2xl text-gold">NFT Кейсы</h1>
          <p className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>Открывай и выигрывай звёзды и редкие NFT</p>
        </div>
        <div className="stars-badge">⭐ {balance.toLocaleString()}</div>
      </div>

      <div className="space-y-4 mt-2">
        {CASES.map(c => (
          <button key={c.id} onClick={() => setSelectedCase(c)}
            className="w-full nova-card p-4 flex items-center gap-4 text-left transition-all hover:border-gold-dim"
            style={{ transition: 'all 0.2s' }}>
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gold-dim"
              style={{ borderColor: 'rgba(212,168,67,0.3)' }}>
              <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-cormorant font-bold text-lg text-gold">{c.name}</div>
              <div className="text-xs mb-2" style={{ color: 'var(--nova-text-muted)' }}>{c.description}</div>
              <div className="flex items-center gap-2">
                <div className="stars-badge text-xs">⭐ {c.price}</div>
                <div className="text-xs px-2 py-1 rounded-full"
                  style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                  NFT внутри
                </div>
              </div>
            </div>
            <Icon name="ChevronRight" size={20} style={{ color: 'var(--nova-gold)' }} />
          </button>
        ))}
      </div>

      {/* Banner */}
      <div className="mt-4 rounded-2xl p-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(212,168,67,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(212,168,67,0.2)' }}>
        <div className="relative z-10">
          <div className="font-cormorant font-bold text-lg text-gold mb-1">NFT Подарки</div>
          <div className="text-xs" style={{ color: 'var(--nova-text-muted)', lineHeight: 1.6 }}>
            В каждом кейсе есть шанс получить уникальный NFT-подарок в Telegram. Вывод только подарками — не звёздами.
          </div>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-30">🏆</div>
      </div>
    </div>
  );
}