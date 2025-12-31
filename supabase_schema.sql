-- CLEAN START (Warning: This deletes existing data in these tables)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop tables with CASCADE to handle all dependencies automatically
drop table if exists public.attendance cascade;
drop table if exists public.omnichannel_messages cascade;
drop table if exists public.conversations cascade;
drop table if exists public.call_recordings cascade;
drop table if exists public.grievances cascade;
drop table if exists public.legal_cases cascade;
drop table if exists public.system_logs cascade;
drop table if exists public.campaigns cascade;
drop table if exists public.internal_messages cascade;
drop table if exists public.settlements cascade;
drop table if exists public.activities cascade;
drop table if exists public.debtors cascade;
drop table if exists public.profiles cascade;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE (Extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text default 'AGENT', -- 'ADMIN', 'AGENT', 'FIELD_AGENT', etc.
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using ( true );
create policy "Users can update own profile" on public.profiles for update using ( auth.uid() = id );

-- DEBTORS TABLE
create table public.debtors (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  loan_id text,
  amount_due numeric,
  status text, -- 'Pending', 'Contacted', 'PTP', etc.
  risk_score text, -- 'Low', 'Medium', 'High', 'Critical'
  overdue_days integer,
  bucket text,
  phone_number text,
  email text,
  assigned_agent_id uuid references public.profiles(id),
  campaign_id text,
  financial_detail jsonb default '{}'::jsonb,
  employment jsonb default '{}'::jsonb,
  emergency_contact jsonb default '{}'::jsonb,
  family_contacts jsonb default '[]'::jsonb,
  assets jsonb default '[]'::jsonb,
  workflow_nodes jsonb default '{}'::jsonb,
  raw_ingestion_data jsonb default '{}'::jsonb,
  transactions jsonb default '[]'::jsonb
);

alter table public.debtors enable row level security;
create policy "Admins can do everything on debtors" on public.debtors to authenticated using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));
create policy "Agents can view assigned debtors" on public.debtors for select to authenticated using (assigned_agent_id = auth.uid() or exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'ADMIN'));
create policy "Agents can update assigned debtors" on public.debtors for update to authenticated using (assigned_agent_id = auth.uid());

-- ACTIVITIES TABLE
create table public.activities (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  debtor_id uuid references public.debtors(id) on delete cascade,
  user_id uuid references public.profiles(id),
  type text,
  outcome text,
  notes text,
  date timestamp with time zone default now()
);

alter table public.activities enable row level security;
create policy "Users can view activities for their debtors" on public.activities for select using (exists (select 1 from public.debtors where debtors.id = activities.debtor_id and (debtors.assigned_agent_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'))));
create policy "Users can insert activities for their debtors" on public.activities for insert with check (exists (select 1 from public.debtors where debtors.id = activities.debtor_id and (debtors.assigned_agent_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'))));

-- SETTLEMENTS
create table public.settlements (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  debtor_id uuid references public.debtors(id) on delete cascade,
  requested_by uuid references public.profiles(id),
  original_balance numeric,
  settlement_amount numeric,
  waiver_amount numeric,
  payment_mode text,
  installments integer default 1,
  reason text,
  status text default 'Pending',
  processed_by uuid references public.profiles(id),
  processed_at timestamp with time zone
);

alter table public.settlements enable row level security;
create policy "Users can see settlements for their debtors" on public.settlements for select using (exists (select 1 from public.debtors where debtors.id = settlements.debtor_id and (debtors.assigned_agent_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'))));

-- INTERNAL MESSAGES
create table public.internal_messages (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sender_id uuid references public.profiles(id),
  receiver_id uuid references public.profiles(id),
  content text,
  is_read boolean default false
);

alter table public.internal_messages enable row level security;
create policy "Users can see their own messages" on public.internal_messages for select using ( auth.uid() = sender_id or auth.uid() = receiver_id );

-- CAMPAIGNS
create table public.campaigns (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  type text,
  status text default 'active',
  strategy_id text,
  total_targets integer default 0,
  processed_count integer default 0,
  recovered_amount numeric default 0
);

alter table public.campaigns enable row level security;
create policy "All authenticated users can see campaigns" on public.campaigns for select using (auth.role() = 'authenticated');

-- SYSTEM LOGS
create table public.system_logs (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id),
  action text,
  details text,
  severity text,
  type text
);

alter table public.system_logs enable row level security;
create policy "Only admins can see system logs" on public.system_logs for select using (exists(select 1 from profiles where id = auth.uid() and role = 'ADMIN'));

-- LEGAL CASES TABLE
create table public.legal_cases (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  debtor_id uuid references public.debtors(id) on delete cascade,
  notice_type text, -- 'SEC-138 (BP 22)', 'Arbitration Notice', etc.
  status text default 'Drafting',
  next_hearing_date date,
  filing_date date,
  lawyer_name text,
  court_name text,
  case_number text,
  notes text,
  small_claims_stage text, -- For Small Claims Workflow
  case_details jsonb default '{}'::jsonb -- For complex compliance fields
);

alter table public.legal_cases enable row level security;
create policy "Users can see legal cases for their debtors" on public.legal_cases for select using (exists (select 1 from public.debtors where debtors.id = legal_cases.debtor_id and (debtors.assigned_agent_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'))));

-- GRIEVANCES TABLE
create table public.grievances (
  id uuid default uuid_generate_v4() primary key,
  ticket_number text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  debtor_id uuid references public.debtors(id) on delete set null,
  debtor_name text,
  debtor_account text,
  debtor_contact text,
  category text,
  complaint_description text,
  date_of_incident date,
  agent_narratives jsonb default '[]'::jsonb,
  ai_analysis jsonb default '{}'::jsonb,
  evidence jsonb default '[]'::jsonb,
  escalation_level text,
  status text default 'DRAFT',
  priority text default 'MEDIUM',
  approval_steps jsonb default '[]'::jsonb,
  incident_report jsonb default '{}'::jsonb,
  disputed_amount numeric,
  desired_resolution text,
  created_by_id uuid references public.profiles(id),
  assigned_to_id uuid references public.profiles(id)
);

alter table public.grievances enable row level security;
create policy "Grievances viewable by creator or assigned" on public.grievances for select using (auth.uid() = created_by_id or auth.uid() = assigned_to_id or exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'));

-- CALL RECORDINGS TABLE
create table public.call_recordings (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  debtor_id uuid references public.debtors(id) on delete set null,
  agent_id uuid references public.profiles(id),
  duration interval,
  status text,
  audit_score numeric,
  sentiment text,
  notes text,
  transcript jsonb default '[]'::jsonb,
  audio_url text
);

alter table public.call_recordings enable row level security;
create policy "Recordings viewable by agent or admin" on public.call_recordings for select using (auth.uid() = agent_id or exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN'));

-- CONVERSATIONS & MESSAGES
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  debtor_id uuid references public.debtors(id) on delete cascade,
  last_message text,
  last_timestamp timestamp with time zone,
  unread_count integer default 0,
  channel text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.omnichannel_messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_type text, -- 'agent', 'debtor', 'system'
  sender_id uuid references public.profiles(id),
  content text,
  timestamp timestamp with time zone default now(),
  channel text,
  status text -- 'sent', 'delivered', 'read'
);

alter table public.conversations enable row level security;
alter table public.omnichannel_messages enable row level security;

-- ATTENDANCE TABLE
create table public.attendance (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  date date not null default current_date,
  status text, -- 'OFFLINE', 'WORKING', 'ON_BREAK', 'ON_LUNCH'
  sessions jsonb default '[]'::jsonb,
  total_work_minutes integer default 0,
  total_break_minutes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

alter table public.attendance enable row level security;
create policy "Users can manage own attendance" on public.attendance for all using (auth.uid() = user_id);

-- COMMUNICATION TEMPLATES
create table public.communication_templates (
  id uuid default uuid_generate_v4() primary key,
  client_id text,
  client_name text,
  name text not null,
  content text not null,
  channel text,
  category text,
  version text default '1.0',
  is_official boolean default true,
  is_ai_enhanced boolean default false,
  last_modified timestamp with time zone default now(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.communication_templates enable row level security;
create policy "Templates viewable by everyone" on public.communication_templates for select using (true);
create policy "Authenticated users can insert templates" on public.communication_templates for insert to authenticated with check (auth.role() = 'authenticated');
create policy "Admins can update templates" on public.communication_templates for update to authenticated using (exists(select 1 from profiles where id = auth.uid() and role in ('ADMIN', 'SUPER_ADMIN')));
create policy "Admins can delete templates" on public.communication_templates for delete to authenticated using (exists(select 1 from profiles where id = auth.uid() and role in ('ADMIN', 'SUPER_ADMIN')));

-- AI PERSONAS
create table public.ai_personas (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  traits text[],
  base_tone text,
  instructions text,
  restricted_phrases text[],
  suggested_phrases text[],
  linked_template_id uuid references public.communication_templates(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ai_personas enable row level security;
create policy "Personas viewable by everyone" on public.ai_personas for select using (true);
create policy "Authenticated users can insert personas" on public.ai_personas for insert to authenticated with check (true);
create policy "Admins can update personas" on public.ai_personas for update to authenticated using (exists(select 1 from profiles where id = auth.uid() and role in ('ADMIN', 'SUPER_ADMIN')));
create policy "Admins can delete personas" on public.ai_personas for delete to authenticated using (exists(select 1 from profiles where id = auth.uid() and role in ('ADMIN', 'SUPER_ADMIN')));

-- AUTOMATIC PROFILE CREATION
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'AGENT');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

