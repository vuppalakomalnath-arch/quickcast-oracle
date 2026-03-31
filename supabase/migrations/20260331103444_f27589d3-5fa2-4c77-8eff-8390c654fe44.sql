
-- Create profiles table (wallet address = user identity)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create markets table
CREATE TABLE public.markets (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text,
  yes_price numeric NOT NULL DEFAULT 0.50,
  no_price numeric NOT NULL DEFAULT 0.50,
  yes_pool numeric NOT NULL DEFAULT 0,
  no_pool numeric NOT NULL DEFAULT 0,
  total_volume numeric NOT NULL DEFAULT 0,
  end_time timestamptz,
  is_live boolean NOT NULL DEFAULT true,
  resolved boolean NOT NULL DEFAULT false,
  resolved_outcome text CHECK (resolved_outcome IN ('YES', 'NO')),
  oracle_sources jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create bets table
CREATE TABLE public.bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL REFERENCES public.profiles(wallet_address) ON DELETE CASCADE,
  market_id text NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  side text NOT NULL CHECK (side IN ('YES', 'NO')),
  amount numeric NOT NULL CHECK (amount > 0),
  price numeric NOT NULL,
  claimed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create claims table
CREATE TABLE public.claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL REFERENCES public.profiles(wallet_address) ON DELETE CASCADE,
  market_id text NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  reward_amount numeric NOT NULL,
  tx_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create demo_balances table
CREATE TABLE public.demo_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL REFERENCES public.profiles(wallet_address) ON DELETE CASCADE,
  algo_balance numeric NOT NULL DEFAULT 1000,
  inr_balance numeric NOT NULL DEFAULT 50000,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_balances ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, anyone can insert (demo mode, no auth)
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update profiles" ON public.profiles FOR UPDATE USING (true);

-- Markets: anyone can read, anyone can update (for pool/price changes)
CREATE POLICY "Anyone can read markets" ON public.markets FOR SELECT USING (true);
CREATE POLICY "Anyone can update markets" ON public.markets FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert markets" ON public.markets FOR INSERT WITH CHECK (true);

-- Bets: anyone can read (for leaderboard), anyone can insert
CREATE POLICY "Anyone can read bets" ON public.bets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert bets" ON public.bets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bets" ON public.bets FOR UPDATE USING (true);

-- Claims: anyone can read, anyone can insert
CREATE POLICY "Anyone can read claims" ON public.claims FOR SELECT USING (true);
CREATE POLICY "Anyone can insert claims" ON public.claims FOR INSERT WITH CHECK (true);

-- Demo balances: anyone can read/insert/update (demo mode)
CREATE POLICY "Anyone can read demo_balances" ON public.demo_balances FOR SELECT USING (true);
CREATE POLICY "Anyone can insert demo_balances" ON public.demo_balances FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update demo_balances" ON public.demo_balances FOR UPDATE USING (true);

-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.markets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.demo_balances;

-- Create indexes
CREATE INDEX idx_bets_wallet ON public.bets(wallet_address);
CREATE INDEX idx_bets_market ON public.bets(market_id);
CREATE INDEX idx_claims_wallet ON public.claims(wallet_address);
CREATE INDEX idx_demo_balances_wallet ON public.demo_balances(wallet_address);

-- Seed markets from mock data
INSERT INTO public.markets (id, title, description, category, yes_price, no_price, yes_pool, no_pool, total_volume, end_time, is_live, resolved, resolved_outcome, oracle_sources) VALUES
('btc-100k', 'Will BTC hit $120K before June 2026?', 'This market resolves YES if Bitcoin reaches or exceeds $120,000 USD on any major exchange (Binance, Coinbase, Kraken) before July 1, 2025 00:00 UTC. Price must be sustained for at least 1 minute on the order book.', 'Crypto', 0.50, 0.50, 620, 480, 284500, '2026-12-31T00:00:00Z', true, true, 'YES', '[{"name":"Chainlink Price Feed","result":"YES","confidence":95},{"name":"Pyth Network","result":"YES","confidence":92},{"name":"API3 dAPI","result":"NO","confidence":88}]'::jsonb),
('eth-etf', 'Will Ethereum ETF AUM exceed $50B by Q3 2025?', 'This market resolves YES if the combined Assets Under Management (AUM) of all spot Ethereum ETFs approved in the United States exceeds $50 billion USD by September 30, 2025. Data sourced from Bloomberg Terminal and ETF provider disclosures.', 'DeFi', 0.50, 0.50, 410, 690, 156200, '2026-11-30T00:00:00Z', true, true, 'YES', '[{"name":"Bloomberg Terminal","result":"NO","confidence":97},{"name":"SEC EDGAR Filing","result":"NO","confidence":90},{"name":"CoinGlass Analytics","result":"NO","confidence":85}]'::jsonb),
('algo-governance', 'Will Algorand TVL exceed $500M in 2025?', 'This market resolves YES if the Total Value Locked (TVL) in the Algorand ecosystem exceeds $500 million USD at any point before December 31, 2025, as reported by DeFiLlama. All protocols on Algorand mainnet are included.', 'Algorand', 0.50, 0.50, 730, 370, 98750, '2026-10-30T00:00:00Z', true, true, 'YES', '[{"name":"DeFiLlama API","result":"YES","confidence":93},{"name":"Algorand Indexer","result":"YES","confidence":91},{"name":"Vestige Analytics","result":"YES","confidence":87}]'::jsonb);

-- Update timestamp trigger for demo_balances
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_demo_balances_updated_at
  BEFORE UPDATE ON public.demo_balances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
