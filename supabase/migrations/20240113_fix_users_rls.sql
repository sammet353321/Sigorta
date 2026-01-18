-- Fix Users RLS Policy
-- Drop existing policy if it exists to avoid conflicts or confusion
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Create a more permissive policy for profile fetching
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (
    auth.uid() = id OR 
    -- Allow admins to view all profiles (important for admin dashboard)
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Also ensure we have an insert/update policy if not already present
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Grant permissions explicitly (just in case)
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT ON users TO anon; -- Sometimes needed for initial fetch depending on setup, though usually auth is required
