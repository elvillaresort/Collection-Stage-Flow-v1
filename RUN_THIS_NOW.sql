-- ============================================
-- QUICK FIX: Run this in Supabase SQL Editor
-- ============================================

-- Drop old restrictive policy
drop policy if exists "Admins can manage templates" on public.communication_templates;

-- Drop any existing insert policy
drop policy if exists "Authenticated users can insert templates" on public.communication_templates;

-- Create new policy that allows ALL authenticated users to insert
create policy "Authenticated users can insert templates" 
on public.communication_templates 
for insert 
to authenticated 
with check (true);

-- Keep admin-only policies for update/delete
drop policy if exists "Admins can update templates" on public.communication_templates;
drop policy if exists "Admins can delete templates" on public.communication_templates;

create policy "Admins can update templates" 
on public.communication_templates 
for update 
to authenticated 
using (exists(select 1 from profiles where id = auth.uid() and role in ('ADMIN', 'SUPER_ADMIN')));

create policy "Admins can delete templates" 
on public.communication_templates 
for delete 
to authenticated 
using (exists(select 1 from profiles where id = auth.uid() and role in ('ADMIN', 'SUPER_ADMIN')));

