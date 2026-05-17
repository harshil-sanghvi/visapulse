-- Anonymized visa submissions (community benchmark data)
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('opt', 'stem_opt', 'h1b_pending', 'h1b_approved')),
  country_of_birth text,
  service_center text check (service_center in ('TSC', 'NSC', 'VSC', 'CSC')),
  degree_level text check (degree_level in ('BS', 'MS', 'PhD')),
  soc_code text,
  filing_date date,
  scores jsonb not null,
  result_mode text not null check (result_mode in ('FULL', 'DATA-ONLY', 'PARTIAL')),
  created_at timestamptz default now()
);

-- Index for fast community benchmark queries
create index if not exists submissions_benchmark_h1b
  on submissions (country_of_birth, service_center, status)
  where service_center is not null;

create index if not exists submissions_benchmark_opt
  on submissions (country_of_birth, status, degree_level)
  where service_center is null;

-- USCIS processing time cache (keyed by form+service_center)
create table if not exists uscis_cache (
  cache_key text primary key,
  data jsonb not null,
  fetched_at timestamptz default now()
);
