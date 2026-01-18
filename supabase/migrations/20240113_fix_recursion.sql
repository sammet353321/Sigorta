-- Recursive policy check fix
-- The issue is likely infinite recursion in the admin check:
-- "Users can view own profile" checks "EXISTS (SELECT 1 FROM users ...)"
-- which triggers the same policy again.

DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- Solution: Use a security definer function or avoid querying the table itself for the role check if possible.
-- Or simply allow users to see themselves, and handle admin visibility differently.
-- For now, let's simplify: Users can see themselves. Admins can see everyone.
-- To avoid recursion, we can rely on auth.jwt() -> role metadata if we had it, but we store role in table.
-- A common workaround is to separate the admin check or use a different approach.

-- Let's try the simplest non-recursive approach first:
-- Users can see rows where ID matches their auth UID.
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- For admins to see everyone, we need a way that doesn't query 'users' table recursively.
-- We can create a secure function/view, or rely on Supabase's service_role for admin tasks (but frontend uses anon).
-- Alternatively, we can assume for the *profile fetch* in context, we only need own profile.
-- The Admin Dashboard might need more.

-- Let's enable a separate policy for Admin viewing others if needed, 
-- but be careful about recursion.
-- IF we really need admin to view all users, we might need to bypass RLS for admin dashboard
-- or use a "security definer" view.

-- But for the immediate 500 error (recursion stack depth exceeded), 
-- let's just stick to "view own profile" for now to fix the login flow.
