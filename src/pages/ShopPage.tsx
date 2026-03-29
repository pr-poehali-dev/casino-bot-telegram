import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { TgUser } from '@/hooks/useAuth';
interface Props { user: TgUser | null; onBalanceChange: (b: number) => void; }

interface ShopItem {
  id: number;
  name: string;
  emoji: string;
  description: string;
  price: number;
  currency: 'stars' | 'gift';
  category: 'gift' | 'boost' | 'nft';
  stock?: number;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 1, name: 'NFT Плюшевый мишка', emoji: '🧸',
    description: 'Редкий Telegram NFT-подарок. Уникальный и передаваемый.',
    price: 15000, currency: 'stars', category: 'nft', stock: 3
  },
  {
    id: 2, name: 'NFT Звёздный диамант', emoji: '💎',
    description: 'Легендарный NFT-подарок в Telegram кошелёк.',
    price: 25000, currency: 'stars', category: 'nft', stock: 1
  },
  {
    id: 3, name: 'Буст ×2 на 1 час', emoji: '⚡',
    description: 'Удваивает выигрыш в Crash на 60 минут.',
    price: 500, currency: 'stars', category: 'boost'
  },
  {
    id: 4, name: 'Страховка ×1', emoji: '🛡️',
    description: 'Возврат 50% ставки при краше ниже 1.5×.',
    price: 200, currency: 'stars', category: 'boost'
  },
  {
    id: 5, name: 'VIP кейс', emoji: '👑',
    description: 'Один открытый VIP кейс с гарантированным epic призом.',
    price: 1000, currency: 'stars', category: 'gift'
  },
  {
    id: 6, name: 'NFT Горящее сердце', emoji: '❤️‍🔥',
    description: 'Лимитированный NFT Telegram подарок.',
    price: 8000, currency: 'stars', category: 'nft', stock: 7
  },
];

type Category = 'all' | 'nft' | 'boost' | 'gift';

export default function ShopPage({ user, onBalanceChange }: Props) {
  const [cat, setCat] = useState<Category>('all');
  const [localBalance, setLocalBalance] = useState<number | null>(null);
  const balance = localBalance ?? user?.balance ?? 0;
  const setBalance = (val: number) => { setLocalBalance(val); onBalanceChange(val); };
  const [bought, setBought] = useState<number[]>([]);

  const filtered = cat === 'all' ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.category === cat);

  const buy = (item: ShopItem) => {
    if (balance < item.price) return;
    setBalance(balance - item.price);
    setBought(prev => [...prev, item.id]);
  };

  return (
    <div className="flex flex-col pb-4 px-4">
      <div className="py-4 flex items-center justify-between">
        <div>
          <h1 className="font-cormorant font-bold text-2xl text-gold">Магазин</h1>
          <p className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>NFT подарки и бусты</p>
        </div>
        <div className="stars-badge">⭐ {balance.toLocaleString()}</div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {([
          { k: 'all', label: 'Всё' },
          { k: 'nft', label: '💎 NFT' },
          { k: 'boost', label: '⚡ Бусты' },
          { k: 'gift', label: '🎁 Подарки' },
        ] as {k: Category, label: string}[]).map(c => (
          <button key={c.k} onClick={() => setCat(c.k)}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all"
            style={{
              background: cat === c.k ? 'linear-gradient(135deg, var(--nova-gold-dark), var(--nova-gold))' : 'rgba(255,255,255,0.08)',
              color: cat === c.k ? '#0a0a0f' : 'var(--nova-text-muted)',
            }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(item => {
          const isBought = bought.includes(item.id);
          const canBuy = balance >= item.price && !isBought;

          return (
            <div key={item.id} className="nova-card p-3 flex flex-col"
              style={item.category === 'nft' ? { border: '1px solid rgba(212,168,67,0.3)' } : {}}>
              {/* Stock badge */}
              {item.stock !== undefined && (
                <div className="self-end mb-1 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: item.stock <= 3 ? 'rgba(239,68,68,0.15)' : 'rgba(212,168,67,0.1)',
                    color: item.stock <= 3 ? '#ef4444' : 'var(--nova-gold)',
                  }}>
                  {item.stock <= 3 ? `🔥 Осталось ${item.stock}` : `Склад: ${item.stock}`}
                </div>
              )}
              
              <div className="text-4xl text-center my-3">{item.emoji}</div>
              
              <div className="font-bold text-sm mb-1" style={{ color: 'var(--nova-text)' }}>{item.name}</div>
              <div className="text-xs mb-3 flex-1" style={{ color: 'var(--nova-text-muted)', lineHeight: 1.4 }}>
                {item.description}
              </div>
              
              <button onClick={() => buy(item)} disabled={!canBuy}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${canBuy ? 'btn-gold' : ''}`}
                style={!canBuy ? { background: 'rgba(255,255,255,0.05)', color: 'var(--nova-text-muted)' } : {}}>
                {isBought ? '✓ Куплено' : `⭐ ${item.price.toLocaleString()}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Info banner */}
      <div className="mt-4 rounded-2xl p-4 text-center"
        style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div className="text-purple-400 font-bold text-sm mb-1">📤 Вывод только подарками</div>
        <div className="text-xs" style={{ color: 'var(--nova-text-muted)', lineHeight: 1.5 }}>
          NFT-подарки отправляются на ваш Telegram аккаунт. Звёзды конвертируются при покупке.
        </div>
      </div>
    </div>
  );
}