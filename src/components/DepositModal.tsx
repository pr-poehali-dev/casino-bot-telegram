import { useState } from "react";
import { createInvoice, checkInvoice } from "@/lib/api";
import Icon from "@/components/ui/icon";

interface Props {
  userId: number;
  onClose: () => void;
  onSuccess: (stars: number) => void;
}

const PACKAGES = [
  { label: "100 ⭐", stars: 100, ton: "0.1", popular: false },
  { label: "500 ⭐", stars: 500, ton: "0.45", popular: true },
  { label: "1 000 ⭐", stars: 1000, ton: "0.85", popular: false },
  { label: "5 000 ⭐", stars: 5000, ton: "4.0", popular: false },
];

export default function DepositModal({ userId, onClose, onSuccess }: Props) {
  const [selected, setSelected] = useState(1);
  const [loading, setLoading] = useState(false);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await createInvoice(userId, selected);
      if (data.pay_url) {
        setPayUrl(data.pay_url);
        setInvoiceId(String(data.invoice_id));
      } else {
        setError("Ошибка создания счёта");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    if (!invoiceId) return;
    setChecking(true);
    setError(null);
    try {
      const data = await checkInvoice(userId, invoiceId);
      if (data.status === "paid") {
        onSuccess(data.stars);
        onClose();
      } else {
        setError("Оплата ещё не прошла. Попробуйте через несколько секунд.");
      }
    } catch {
      setError("Ошибка проверки");
    } finally {
      setChecking(false);
    }
  };

  const openPayUrl = () => {
    if (payUrl) window.open(payUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm rounded-t-3xl p-5 animate-fade-in-up"
        style={{ background: "var(--nova-card)", border: "1px solid var(--nova-border)" }}>

        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="font-cormorant font-bold text-xl text-gold">Пополнение</div>
            <div className="text-xs" style={{ color: "var(--nova-text-muted)" }}>Оплата через CryptoBot (TON)</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)" }}>
            <Icon name="X" size={16} />
          </button>
        </div>

        {!payUrl ? (
          <>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {PACKAGES.map((pkg, i) => (
                <button key={i} onClick={() => setSelected(i)}
                  className="relative p-3 rounded-xl text-center transition-all"
                  style={{
                    background: selected === i ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${selected === i ? "rgba(212,168,67,0.5)" : "var(--nova-border)"}`,
                  }}>
                  {pkg.popular && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: "var(--nova-gold)", color: "#0a0a0f" }}>
                      хит
                    </div>
                  )}
                  <div className="font-cormorant font-bold text-lg" style={{ color: selected === i ? "var(--nova-gold)" : "var(--nova-text)" }}>
                    {pkg.label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--nova-text-muted)" }}>
                    {pkg.ton} TON
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <div className="text-red-400 text-xs text-center mb-3 p-2 rounded-xl"
                style={{ background: "rgba(239,68,68,0.1)" }}>{error}</div>
            )}

            <button onClick={handleCreate} disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-base btn-gold disabled:opacity-50 font-montserrat">
              {loading ? "Создаём счёт..." : `Оплатить ${PACKAGES[selected].ton} TON`}
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-3">💳</div>
            <div className="font-bold mb-1" style={{ color: "var(--nova-text)" }}>
              Счёт создан!
            </div>
            <div className="text-xs mb-4" style={{ color: "var(--nova-text-muted)" }}>
              Оплати через CryptoBot, затем нажми «Проверить оплату»
            </div>

            <button onClick={openPayUrl}
              className="w-full py-3 rounded-xl font-bold text-base btn-gold font-montserrat mb-2">
              Открыть CryptoBot для оплаты
            </button>

            {error && (
              <div className="text-red-400 text-xs text-center mb-2 p-2 rounded-xl"
                style={{ background: "rgba(239,68,68,0.1)" }}>{error}</div>
            )}

            <button onClick={handleCheck} disabled={checking}
              className="w-full py-2.5 rounded-xl font-bold text-sm font-montserrat"
              style={{ background: "rgba(255,255,255,0.07)", color: "var(--nova-text)" }}>
              {checking ? "Проверяем..." : "✓ Проверить оплату"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
