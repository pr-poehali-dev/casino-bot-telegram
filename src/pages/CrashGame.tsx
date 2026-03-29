import { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import type { TgUser } from '@/hooks/useAuth';

interface Props {
  user: TgUser | null;
  onBalanceChange: (balance: number) => void;
}

type GameState = 'waiting' | 'running' | 'crashed';

interface Bet {
  id: number;
  user: string;
  amount: number;
  cashout?: number;
  profit?: number;
}

const HOUSE_EDGE = 0.05; // 5% house edge — владелец всегда в плюсе

function generateCrashPoint(): number {
  // Алгоритм с house edge: дом получает ~5% с каждой игры
  const r = Math.random();
  if (r < 0.01) return 1.0; // 1% мгновенный краш
  if (r < 0.45) return 1.0 + Math.random() * 0.9; // 44% краш до 2x
  if (r < 0.75) return 2.0 + Math.random() * 2; // 30% краш 2-4x
  if (r < 0.90) return 4.0 + Math.random() * 6; // 15% краш 4-10x
  if (r < 0.97) return 10 + Math.random() * 15; // 7% краш 10-25x
  return 25 + Math.random() * 25; // 3% до 50x
}

const MOCK_BETS: Bet[] = [
  { id: 1, user: 'Алекс***', amount: 500 },
  { id: 2, user: 'Мария***', amount: 1200 },
  { id: 3, user: 'Дмит***', amount: 300 },
  { id: 4, user: 'Ник***', amount: 800 },
  { id: 5, user: 'Юля***', amount: 2500 },
];

export default function CrashGame({ user, onBalanceChange }: Props) {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(2.5);
  const [countdown, setCountdown] = useState(5);
  const [betAmount, setBetAmount] = useState('100');
  const [autoCashout, setAutoCashout] = useState('2.00');
  const [hasBet, setHasBet] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashoutMultiplier, setCashoutMultiplier] = useState(0);
  const [bets, setBets] = useState<Bet[]>(MOCK_BETS);
  const [history, setHistory] = useState<number[]>([8.4, 1.2, 15.6, 3.1, 1.0, 22.8, 4.5, 1.8, 7.2, 2.3]);
  const [graphPoints, setGraphPoints] = useState<{x: number, y: number}[]>([]);
  const [localBalance, setLocalBalance] = useState<number | null>(null);
  const [resultMsg, setResultMsg] = useState<{text: string, win: boolean} | null>(null);

  const balance = localBalance ?? user?.balance ?? 0;
  const setBalance = (val: number) => { setLocalBalance(val); onBalanceChange(val); };
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGraph = useCallback((points: {x: number, y: number}[], crashed = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    
    if (points.length < 2) return;
    
    const maxX = Math.max(...points.map(p => p.x), 10);
    const maxY = Math.max(...points.map(p => p.y), 3);
    
    const scaleX = (W - 40) / maxX;
    const scaleY = (H - 40) / maxY;
    
    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = H - 20 - (i * (H - 40) / 4);
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(W - 10, y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(138, 138, 154, 0.5)';
      ctx.font = '10px Montserrat';
      ctx.fillText(`${(1 + i * maxY / 4).toFixed(1)}x`, 2, y + 4);
    }
    
    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    if (crashed) {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
    } else {
      gradient.addColorStop(0, 'rgba(212, 168, 67, 0.25)');
      gradient.addColorStop(1, 'rgba(212, 168, 67, 0.0)');
    }
    
    ctx.beginPath();
    ctx.moveTo(20, H - 20);
    points.forEach(p => {
      ctx.lineTo(20 + p.x * scaleX, H - 20 - (p.y - 1) * scaleY);
    });
    ctx.lineTo(20 + points[points.length - 1].x * scaleX, H - 20);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Main line
    ctx.beginPath();
    ctx.moveTo(20, H - 20);
    points.forEach(p => {
      ctx.lineTo(20 + p.x * scaleX, H - 20 - (p.y - 1) * scaleY);
    });
    ctx.strokeStyle = crashed ? '#ef4444' : '#d4a843';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = crashed ? '#ef4444' : '#d4a843';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Rocket dot at end
    const lastP = points[points.length - 1];
    const dotX = 20 + lastP.x * scaleX;
    const dotY = H - 20 - (lastP.y - 1) * scaleY;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
    ctx.fillStyle = crashed ? '#ef4444' : '#f0c860';
    ctx.shadowColor = crashed ? '#ef4444' : '#f0c860';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  const startCountdown = useCallback(() => {
    setGameState('waiting');
    setCountdown(5);
    setMultiplier(1.0);
    setGraphPoints([]);
    setHasBet(false);
    setCashedOut(false);
    setCashoutMultiplier(0);
    setResultMsg(null);
    const cp = generateCrashPoint();
    setCrashPoint(cp);
    
    let c = 5;
    countdownRef.current = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(countdownRef.current!);
        startGame(cp);
      }
    }, 1000);
  }, []);

  const startGame = useCallback((cp: number) => {
    setGameState('running');
    startTimeRef.current = Date.now();
    const points: {x: number, y: number}[] = [{x: 0, y: 1}];
    
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const m = Math.pow(Math.E, elapsed * 0.4);
      
      points.push({ x: elapsed, y: m });
      setGraphPoints([...points]);
      setMultiplier(m);
      drawGraph(points, false);
      
      if (m >= cp) {
        clearInterval(intervalRef.current!);
        setGameState('crashed');
        drawGraph(points, true);
        setHistory(prev => [cp, ...prev.slice(0, 9)]);
        setTimeout(() => startCountdown(), 3000);
      }
    }, 80);
  }, [drawGraph, startCountdown]);

  useEffect(() => {
    startCountdown();
    return () => {
      clearInterval(intervalRef.current!);
      clearInterval(countdownRef.current!);
    };
  }, []);

  useEffect(() => {
    drawGraph(graphPoints, gameState === 'crashed');
  }, [graphPoints, gameState]);

  const placeBet = () => {
    const amount = parseInt(betAmount) || 0;
    if (amount <= 0 || amount > balance || gameState !== 'waiting') return;
    setBalance(prev => prev - amount);
    setHasBet(true);
    setBets(prev => [{ id: Date.now(), user: 'Вы', amount }, ...prev.slice(0, 7)]);
  };

  const cashOut = () => {
    if (!hasBet || cashedOut || gameState !== 'running') return;
    const amount = parseInt(betAmount) || 0;
    const winAmount = Math.floor(amount * multiplier);
    setBalance(prev => prev + winAmount);
    setCashedOut(true);
    setCashoutMultiplier(multiplier);
    setResultMsg({ text: `+${winAmount} ⭐ × ${multiplier.toFixed(2)}`, win: true });
  };

  const getMultiplierColor = () => {
    if (gameState === 'crashed') return '#ef4444';
    if (multiplier >= 10) return '#f0c860';
    if (multiplier >= 5) return '#d4a843';
    if (multiplier >= 2) return '#22c55e';
    return '#e8e0d0';
  };

  return (
    <div className="flex flex-col h-full pb-4">
      {/* History bar */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar">
        {history.map((h, i) => (
          <span key={i} className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${
            h < 2 ? 'bg-red-500/20 text-red-400' :
            h < 5 ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-green-500/20 text-green-400'
          }`}>
            {h.toFixed(2)}×
          </span>
        ))}
      </div>

      {/* Graph area */}
      <div className="relative mx-4 rounded-2xl overflow-hidden" style={{ background: 'rgba(26,26,38,0.8)', border: '1px solid rgba(42,42,61,0.8)', height: '200px' }}>
        <canvas ref={canvasRef} width={380} height={200} className="w-full h-full" style={{ display: 'block' }} />
        
        {/* Multiplier overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {gameState === 'waiting' && (
            <div className="text-center animate-fade-in-up">
              <div className="text-6xl mb-1">🚀</div>
              <div className="text-nova-text-muted text-sm font-montserrat">Следующий раунд через</div>
              <div className="text-white text-4xl font-cormorant font-bold">{countdown}с</div>
            </div>
          )}
          {gameState === 'running' && !cashedOut && (
            <div className="text-center">
              <div className="multiplier-display" style={{ color: getMultiplierColor(), textShadow: `0 0 30px ${getMultiplierColor()}` }}>
                {multiplier.toFixed(2)}×
              </div>
            </div>
          )}
          {gameState === 'running' && cashedOut && (
            <div className="text-center animate-fade-in-up">
              <div className="text-green-400 text-2xl font-bold mb-1">✓ Выведено</div>
              <div className="multiplier-display text-green-400" style={{ fontSize: '48px' }}>
                {cashoutMultiplier.toFixed(2)}×
              </div>
            </div>
          )}
          {gameState === 'crashed' && (
            <div className="text-center animate-fade-in-up">
              <div className="multiplier-display text-red-400" style={{ fontSize: '56px', textShadow: '0 0 30px #ef4444' }}>
                💥 КРАШ
              </div>
              <div className="text-red-400 text-xl font-bold">{crashPoint.toFixed(2)}×</div>
            </div>
          )}
        </div>
      </div>

      {/* Result message */}
      {resultMsg && (
        <div className={`mx-4 mt-2 p-2 rounded-xl text-center font-bold text-sm animate-fade-in-up ${resultMsg.win ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {resultMsg.text}
        </div>
      )}

      {/* Bet controls */}
      <div className="mx-4 mt-3 nova-card p-4">
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <div className="text-xs text-nova-text-muted mb-1 font-montserrat">Ставка (⭐)</div>
            <div className="flex gap-1">
              <input
                type="number"
                value={betAmount}
                onChange={e => setBetAmount(e.target.value)}
                className="nova-input text-center"
                placeholder="100"
                disabled={hasBet}
              />
            </div>
            <div className="flex gap-1 mt-1">
              {[50, 100, 500, 1000].map(v => (
                <button key={v} onClick={() => setBetAmount(String(v))} disabled={hasBet}
                  className="flex-1 text-xs py-1 rounded-lg font-bold transition-all"
                  style={{ background: 'rgba(212,168,67,0.1)', color: 'var(--nova-gold)', border: '1px solid rgba(212,168,67,0.2)' }}>
                  {v >= 1000 ? '1K' : v}
                </button>
              ))}
            </div>
          </div>
          <div className="w-32">
            <div className="text-xs text-nova-text-muted mb-1 font-montserrat">Авто-вывод</div>
            <input
              type="number"
              value={autoCashout}
              onChange={e => setAutoCashout(e.target.value)}
              step="0.1"
              className="nova-input text-center"
              disabled={hasBet}
            />
            <div className="text-xs text-center mt-1" style={{ color: 'var(--nova-text-muted)' }}>× множитель</div>
          </div>
        </div>

        {!hasBet ? (
          <button onClick={placeBet} disabled={gameState !== 'waiting'}
            className="w-full py-3 rounded-xl font-bold text-base transition-all btn-gold disabled:opacity-40 disabled:cursor-not-allowed font-montserrat">
            {gameState === 'waiting' ? `🚀 Поставить ${betAmount} ⭐` : 'Ждите следующего раунда...'}
          </button>
        ) : !cashedOut && gameState === 'running' ? (
          <button onClick={cashOut}
            className="w-full py-3 rounded-xl font-bold text-base transition-all btn-danger font-montserrat animate-glow-pulse">
            💰 ВЫВЕСТИ {Math.floor(parseInt(betAmount) * multiplier)} ⭐ ({multiplier.toFixed(2)}×)
          </button>
        ) : (
          <div className="w-full py-3 rounded-xl font-bold text-base text-center font-montserrat"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--nova-text-muted)' }}>
            {cashedOut ? '✓ Выведено успешно' : gameState === 'crashed' ? '😔 Ставка проиграна' : 'Ставка сделана'}
          </div>
        )}
      </div>

      {/* Balance */}
      <div className="mx-4 mt-2 flex items-center justify-between">
        <span className="text-nova-text-muted text-xs">Баланс</span>
        <span className="stars-badge">⭐ {balance.toLocaleString()}</span>
      </div>

      {/* Live bets */}
      <div className="mx-4 mt-3">
        <div className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--nova-gold)' }}>
          Активные ставки
        </div>
        <div className="space-y-1">
          {bets.slice(0, 5).map(bet => (
            <div key={bet.id} className="flex items-center justify-between py-1 px-3 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <span className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>{bet.user}</span>
              <span className="text-xs font-bold" style={{ color: 'var(--nova-gold)' }}>⭐ {bet.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}