import { useState } from 'react';
import Icon from '@/components/ui/icon';

const FAQ = [
  {
    q: 'Как пополнить баланс?',
    a: 'Нажмите "Пополнить" в профиле. Принимаем Telegram Stars и TON. Зачисление мгновенное.',
  },
  {
    q: 'Как вывести выигрыш?',
    a: 'Вывод доступен только подарками — NFT-подарки в Telegram. Минимум 1000 ⭐ для вывода.',
  },
  {
    q: 'Как работает Crash игра?',
    a: 'Ставьте до старта раунда. Ракета летит, множитель растёт. Выведите до краша и заберите выигрыш.',
  },
  {
    q: 'Честно ли казино?',
    a: 'Алгоритм краша использует криптографическое хеширование. Все результаты верифицируемы.',
  },
  {
    q: 'Что такое NFT кейс?',
    a: 'Кейс с призами. Чаще всего выпадают звёзды. Есть ультра-редкий шанс получить NFT подарок.',
  },
  {
    q: 'Как работает реферальная программа?',
    a: 'Делитесь ссылкой. Получайте % от ставок приглашённых. До 10% с 50+ рефералами.',
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketText, setTicketText] = useState('');
  const [sent, setSent] = useState(false);

  const sendTicket = () => {
    if (!ticketText.trim()) return;
    setSent(true);
    setTicketText('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="flex flex-col pb-4 px-4">
      <div className="py-4">
        <h1 className="font-cormorant font-bold text-2xl text-gold">Поддержка</h1>
        <p className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>FAQ и обратная связь</p>
      </div>

      {/* Quick contacts */}
      <div className="flex gap-2 mb-4">
        <button className="flex-1 nova-card p-3 flex flex-col items-center gap-1 transition-all hover:border-gold-dim">
          <span className="text-2xl">💬</span>
          <span className="text-xs font-bold" style={{ color: 'var(--nova-text)' }}>Telegram</span>
          <span className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>@nova_support</span>
        </button>
        <button className="flex-1 nova-card p-3 flex flex-col items-center gap-1 transition-all hover:border-gold-dim">
          <span className="text-2xl">⚡</span>
          <span className="text-xs font-bold" style={{ color: 'var(--nova-text)' }}>Быстро</span>
          <span className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>~ 15 мин</span>
        </button>
        <button className="flex-1 nova-card p-3 flex flex-col items-center gap-1 transition-all hover:border-gold-dim">
          <span className="text-2xl">📢</span>
          <span className="text-xs font-bold" style={{ color: 'var(--nova-text)' }}>Канал</span>
          <span className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>Новости</span>
        </button>
      </div>

      {/* FAQ */}
      <div className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--nova-gold)' }}>
        Частые вопросы
      </div>
      <div className="space-y-2 mb-4">
        {FAQ.map((item, i) => (
          <div key={i} className="nova-card overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between p-3 text-left">
              <span className="text-sm font-bold" style={{ color: 'var(--nova-text)' }}>{item.q}</span>
              <Icon
                name={openFaq === i ? 'ChevronUp' : 'ChevronDown'}
                size={14}
                style={{ color: 'var(--nova-gold)', shrink: 0 }}
              />
            </button>
            {openFaq === i && (
              <div className="px-3 pb-3 text-xs leading-relaxed animate-fade-in-up"
                style={{ color: 'var(--nova-text-muted)' }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ticket form */}
      <div className="nova-card p-4">
        <div className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--nova-gold)' }}>
          Написать в поддержку
        </div>
        {sent ? (
          <div className="text-center py-4 animate-fade-in-up">
            <div className="text-3xl mb-2">✉️</div>
            <div className="text-green-400 font-bold text-sm">Сообщение отправлено!</div>
            <div className="text-xs mt-1" style={{ color: 'var(--nova-text-muted)' }}>Ответим в течение 15 минут</div>
          </div>
        ) : (
          <>
            <textarea
              value={ticketText}
              onChange={e => setTicketText(e.target.value)}
              className="nova-input resize-none mb-3"
              style={{ height: '100px' }}
              placeholder="Опишите вашу проблему..."
            />
            <button onClick={sendTicket} disabled={!ticketText.trim()}
              className="w-full py-2.5 rounded-xl font-bold text-sm btn-gold disabled:opacity-40 font-montserrat">
              Отправить
            </button>
          </>
        )}
      </div>
    </div>
  );
}
