-- Fix RLS policies for ai_personas table
-- Run this in your Supabase SQL Editor
-- This script only updates policies, it does NOT recreate tables

-- Drop existing policies (if they exist)
drop policy if exists "Admins can manage personas" on public.ai_personas;
drop policy if exists "Authenticated users can insert personas" on public.ai_personas;
drop policy if exists "Admins can update personas" on public.ai_personas;
drop policy if exists "Admins can delete personas" on public.ai_personas;

-- Add policy to allow authenticated users to insert personas
create policy "Authenticated users can insert personas" 
on public.ai_personas 
for insert 
to authenticated 
with check (true);

-- Add policy to allow admins to update personas
create policy "Admins can update personas" 
on public.ai_personas 
for update 
to authenticated 
using (exists(select 1 from profiles where id = auth.uid() and role in ('ADMIN', 'SUPER_ADMIN')));

-- Add policy to allow admins to delete personas
create policy "Admins can delete personas" 
on public.ai_personas 
for delete 
to authenticated 
using (exists(select 1 from profiles where id = auth.uid() and role in ('ADMIN', 'SUPER_ADMIN')));

