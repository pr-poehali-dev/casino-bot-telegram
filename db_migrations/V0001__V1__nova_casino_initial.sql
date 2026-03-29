
CREATE TABLE IF NOT EXISTS nova_users (
    id BIGINT PRIMARY KEY,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    photo_url TEXT,
    balance INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    referral_code TEXT UNIQUE,
    referred_by BIGINT REFERENCES nova_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nova_transactions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES nova_users(id),
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw', 'bet', 'win', 'referral_bonus', 'case_open', 'case_win')),
    amount INTEGER NOT NULL,
    description TEXT,
    invoice_id TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nova_games (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES nova_users(id),
    game_type TEXT NOT NULL CHECK (game_type IN ('crash', 'case')),
    bet_amount INTEGER NOT NULL,
    crash_point NUMERIC(10,2),
    cashout_at NUMERIC(10,2),
    win_amount INTEGER NOT NULL DEFAULT 0,
    result TEXT NOT NULL CHECK (result IN ('win', 'loss', 'pending')),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nova_invoices (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES nova_users(id),
    invoice_id TEXT UNIQUE NOT NULL,
    amount_crypto NUMERIC(20,8) NOT NULL,
    asset TEXT NOT NULL,
    stars_amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired')),
    pay_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_nova_transactions_user ON nova_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_nova_games_user ON nova_games(user_id);
CREATE INDEX IF NOT EXISTS idx_nova_invoices_user ON nova_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_nova_invoices_invoice_id ON nova_invoices(invoice_id);
