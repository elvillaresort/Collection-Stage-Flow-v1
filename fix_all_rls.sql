-- ============================================
-- COMPLETE RLS FIX: Fix both tables at once
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- FIX 1: communication_templates
-- ============================================
drop policy if exists "Admins can manage templates" on public.communication_templates;
drop policy if exists "Authenticated users can insert templates" on public.communication_templates;
drop policy if exists "Admins can update templates" on public.communication_templates;
drop policy if exists "Admins can delete templates" on public.communication_templates;

create policy "Authenticated users can insert templates" 
on public.communication_templates 
for insert 
to authenticated 
with check (true);

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

-- ============================================
-- FIX 2: ai_personas
-- ============================================
drop policy if exists "Admins can manage personas" on public.ai_personas;
drop policy if exists "Authenticated users can insert personas" on public.ai_personas;
drop policy if exists "Admins can update personas" on public.ai_personas;
drop policy if exists "Admins can delete personas" on public.ai_personas;

create policy "Authenticated users can insert personas" 
on public.ai_personas 
for insert 
to authenticated 
with check (true);

create policy "Admins can update personas" 
on public.ai_personas 
for update 
to authenticated 
using (exists(select 1 from profiles where id = auth.uid() and role in ('ADMIN', 'SUPER_ADMIN')));

create policy "Admins can delete personas" 
on public.ai_personas 
for delete 
to authenticated 
using (exists(select 1 from profiles where id = auth.uid() and role in ('ADMIN', 'SUPER_ADMIN')));

