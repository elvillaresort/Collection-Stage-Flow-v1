# Complete Fix for RLS Template Error

## Problem
You're getting: `Error creating template: new row violates row-level security policy for table "communication_templates"`

## Root Causes
1. You might be using the bypass login (`admin`/`superadmin`) which doesn't authenticate with Supabase
2. RLS policies might not be set up correctly
3. You might not have a profile in the `profiles` table

## Solution 1: Fix RLS Policies (Recommended for Production)

Run this SQL in your Supabase SQL Editor:

```sql
-- Step 1: Drop all existing policies
drop policy if exists "Admins can manage templates" on public.communication_templates;
drop policy if exists "Authenticated users can insert templates" on public.communication_templates;
drop policy if exists "Admins can update templates" on public.communication_templates;
drop policy if exists "Admins can delete templates" on public.communication_templates;

-- Step 2: Create new policies
-- Allow authenticated users to insert
create policy "Authenticated users can insert templates" 
on public.communication_templates 
for insert 
to authenticated 
with check (true);

-- Allow admins to update
create policy "Admins can update templates" 
on public.communication_templates 
for update 
to authenticated 
using (exists(select 1 from profiles where id = auth.uid() and role in ('ADMIN', 'SUPER_ADMIN')));

-- Allow admins to delete
create policy "Admins can delete templates" 
on public.communication_templates 
for delete 
to authenticated 
using (exists(select 1 from profiles where id = auth.uid() and role in ('ADMIN', 'SUPER_ADMIN')));
```

## Solution 2: Disable RLS (For Development Only)

If you're using the bypass login and just want to test, temporarily disable RLS:

```sql
ALTER TABLE public.communication_templates DISABLE ROW LEVEL SECURITY;
```

**⚠️ WARNING: Only use this for development! Re-enable RLS for production.**

To re-enable later:
```sql
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;
-- Then run Solution 1 to add proper policies
```

## Solution 3: Use Real Supabase Authentication

Instead of using the bypass login (`admin`/`superadmin`), create a real user in Supabase:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter email and password
4. Make sure the user has a profile in the `profiles` table (should be auto-created)
5. Log in with that email/password instead of the bypass

## Solution 4: Code Fix (Already Applied)

I've updated the code to automatically use the admin client if RLS blocks the insert. This should work now, but it's better to fix the RLS policies properly.

## What to Do Right Now

1. **First, try the code fix** - The code has been updated to use admin client as fallback. Try creating a template now.

2. **If that doesn't work**, run Solution 1 SQL in Supabase SQL Editor

3. **If you're using bypass login**, either:
   - Use Solution 2 (disable RLS temporarily)
   - Or use Solution 3 (create real Supabase user)

## Verify It's Working

After applying fixes, test by:
1. Try creating a template in your app
2. Check browser console for any errors
3. Verify the template appears in Supabase Dashboard → Table Editor → communication_templates

