-- Alternative fix: More permissive RLS policies for communication_templates
-- Use this if the main fix doesn't work
-- Run this in your Supabase SQL Editor

-- Drop ALL existing policies
drop policy if exists "Admins can manage templates" on public.communication_templates;
drop policy if exists "Authenticated users can insert templates" on public.communication_templates;
drop policy if exists "Admins can update templates" on public.communication_templates;
drop policy if exists "Admins can delete templates" on public.communication_templates;
drop policy if exists "Templates viewable by everyone" on public.communication_templates;

-- Recreate all policies from scratch
-- Allow everyone to view templates
create policy "Templates viewable by everyone" 
on public.communication_templates 
for select 
using (true);

-- Allow any authenticated user to insert
create policy "Authenticated users can insert templates" 
on public.communication_templates 
for insert 
to authenticated 
with check (true);

-- Allow any authenticated user to update (more permissive)
create policy "Authenticated users can update templates" 
on public.communication_templates 
for update 
to authenticated 
using (true)
with check (true);

-- Allow admins to delete
create policy "Admins can delete templates" 
on public.communication_templates 
for delete 
to authenticated 
using (exists(select 1 from profiles where id = auth.uid() and role in ('ADMIN', 'SUPER_ADMIN')));

