-- Create payout tracking tables for $5DEE creator economy

-- Table: engagement_payouts - Records all payout transactions
CREATE TABLE engagement_payouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text NOT NULL CHECK (content_type IN ('track', 'video', 'article')),
  content_id uuid NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('view', 'like', 'comment', 'share', 'bookmark')),
  payer_wallet text NOT NULL,
  creator_wallet text NOT NULL,
  amount numeric NOT NULL,
  tx_hash text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  UNIQUE(content_type, content_id, action_type, payer_wallet)
);

-- Table: creator_balances - Aggregated earnings for dashboard
CREATE TABLE creator_balances (
  wallet_address text PRIMARY KEY,
  total_earned numeric DEFAULT 0,
  pending_payout numeric DEFAULT 0,
  views_earned numeric DEFAULT 0,
  likes_earned numeric DEFAULT 0,
  comments_earned numeric DEFAULT 0,
  shares_earned numeric DEFAULT 0,
  bookmarks_earned numeric DEFAULT 0,
  last_payout_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Table: token_config - Configurable payout rates
CREATE TABLE token_config (
  action_type text PRIMARY KEY CHECK (action_type IN ('view', 'like', 'comment', 'share', 'bookmark')),
  payout_amount numeric NOT NULL,
  is_enabled boolean DEFAULT true,
  daily_cap_per_user integer DEFAULT 100,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE engagement_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for engagement_payouts
CREATE POLICY "Anyone can view engagement payouts"
ON engagement_payouts FOR SELECT
USING (true);

CREATE POLICY "Service role can insert payouts"
ON engagement_payouts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update payouts"
ON engagement_payouts FOR UPDATE
USING (true);

-- RLS Policies for creator_balances
CREATE POLICY "Anyone can view creator balances"
ON creator_balances FOR SELECT
USING (true);

CREATE POLICY "Service role can manage balances"
ON creator_balances FOR ALL
USING (true);

-- RLS Policies for token_config
CREATE POLICY "Anyone can view token config"
ON token_config FOR SELECT
USING (true);

-- Seed default payout rates
INSERT INTO token_config (action_type, payout_amount, daily_cap_per_user) VALUES
  ('view', 1, 100),
  ('like', 5, 50),
  ('comment', 10, 20),
  ('share', 3, 30),
  ('bookmark', 2, 50);

-- Index for faster lookups
CREATE INDEX idx_engagement_payouts_payer ON engagement_payouts(payer_wallet);
CREATE INDEX idx_engagement_payouts_creator ON engagement_payouts(creator_wallet);
CREATE INDEX idx_engagement_payouts_content ON engagement_payouts(content_type, content_id);
CREATE INDEX idx_engagement_payouts_status ON engagement_payouts(status);

-- Function to update creator_balances on payout confirmation
CREATE OR REPLACE FUNCTION update_creator_balance_on_payout()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    INSERT INTO creator_balances (wallet_address, total_earned, pending_payout)
    VALUES (NEW.creator_wallet, NEW.amount, 0)
    ON CONFLICT (wallet_address) DO UPDATE SET
      total_earned = creator_balances.total_earned + NEW.amount,
      last_payout_at = now(),
      updated_at = now();
    
    -- Update action-specific earnings
    CASE NEW.action_type
      WHEN 'view' THEN
        UPDATE creator_balances SET views_earned = views_earned + NEW.amount WHERE wallet_address = NEW.creator_wallet;
      WHEN 'like' THEN
        UPDATE creator_balances SET likes_earned = likes_earned + NEW.amount WHERE wallet_address = NEW.creator_wallet;
      WHEN 'comment' THEN
        UPDATE creator_balances SET comments_earned = comments_earned + NEW.amount WHERE wallet_address = NEW.creator_wallet;
      WHEN 'share' THEN
        UPDATE creator_balances SET shares_earned = shares_earned + NEW.amount WHERE wallet_address = NEW.creator_wallet;
      WHEN 'bookmark' THEN
        UPDATE creator_balances SET bookmarks_earned = bookmarks_earned + NEW.amount WHERE wallet_address = NEW.creator_wallet;
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_creator_balance
AFTER INSERT OR UPDATE ON engagement_payouts
FOR EACH ROW
EXECUTE FUNCTION update_creator_balance_on_payout();