-- Emergency Fix: Remove ALL policies on users to stop recursion
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Disable RLS temporarily to confirm it's the issue and let you login
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
