-- Fix RLS policies for communication_templates table
-- Run this in your Supabase SQL Editor
-- This script only updates policies, it does NOT recreate tables

-- Drop existing policies (if they exist)
drop policy if exists "Admins can manage templates" on public.communication_templates;
drop policy if exists "Authenticated users can insert templates" on public.communication_templates;
drop policy if exists "Admins can update templates" on public.communication_templates;
drop policy if exists "Admins can delete templates" on public.communication_templates;

-- Add policy to allow authenticated users to insert templates
create policy "Authenticated users can insert templates" 
on public.communication_templates 
for insert 
to authenticated 
with check (true);

-- Add policy to allow admins to update templates
create policy "Admins can update templates" 
on public.communication_templates 
for update 
to authenticated 
using (exists(select 1 from profiles where id = auth.uid() and role in ('ADMIN', 'SUPER_ADMIN')));

-- Add policy to allow admins to delete templates
create policy "Admins can delete templates" 
on public.communication_templates 
for delete 
to authenticated 
using (exists(select 1 from profiles where id = auth.uid() and role in ('ADMIN', 'SUPER_ADMIN')));

