-- Single-row homepage "Grow your cravings" / FeaturedBanner image. Run once in Supabase SQL editor.

create table if not exists public.featured_banner_section (
  id int primary key check (id = 1),
  image_url text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.featured_banner_section enable row level security;

insert into public.featured_banner_section (id, image_url)
values (1, '')
on conflict (id) do nothing;

drop policy if exists "featured_banner_section_select_all" on public.featured_banner_section;
create policy "featured_banner_section_select_all"
  on public.featured_banner_section
  for select
  using (true);
