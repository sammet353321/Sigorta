-- Create Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  birth_date DATE,
  company VARCHAR(100),
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  chassis_number VARCHAR(100),
  plate_number VARCHAR(20),
  identity_number VARCHAR(20),
  document_number VARCHAR(50),
  vehicle_type VARCHAR(50),
  gross_premium DECIMAL(10,2),
  type VARCHAR(50),
  issuer VARCHAR(100),
  related_person VARCHAR(100),
  policy_number VARCHAR(50),
  agency VARCHAR(100),
  card_info TEXT,
  additional_info TEXT,
  net_premium DECIMAL(10,2),
  commission DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  document_url TEXT,
  document_uploaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);

-- Create Policies Table
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  policy_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_policies_quote_id ON policies(quote_id);
CREATE INDEX IF NOT EXISTS idx_policies_user_id ON policies(user_id);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);

-- Alter Activity Logs to add missing columns
ALTER TABLE activity_logs 
  ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS entity_id UUID,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- RLS Policies for new tables

-- Quotes RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quotes" ON quotes
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('calisan', 'admin'))
  );

CREATE POLICY "Agents can create quotes" ON quotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employees and Admin can update quotes" ON quotes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('calisan', 'admin'))
  );

-- Policies RLS
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own policies" ON policies
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('calisan', 'admin'))
  );

CREATE POLICY "Employees can create policies" ON policies
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('calisan', 'admin'))
  );
