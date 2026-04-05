-- Three fixed homepage hero image URLs (slots 1–3). Run once in Supabase SQL editor.
-- Replaces variable-length hero_slides usage in app code; you can drop hero_slides after migrating URLs manually if desired.

create table if not exists public.hero_home_images (
  slot smallint primary key check (slot between 1 and 3),
  image_url text not null default ''
);

alter table public.hero_home_images enable row level security;

insert into public.hero_home_images (slot, image_url) values (1, ''), (2, ''), (3, '')
on conflict (slot) do nothing;

-- RLS with zero policies = anon gets empty reads (no error). Allow public read of these URLs.
drop policy if exists "hero_home_images_select_all" on public.hero_home_images;
create policy "hero_home_images_select_all"
  on public.hero_home_images
  for select
  using (true);

-- App reads via this RPC (bypasses RLS) so admin/home always see DB values.
create or replace function public.list_hero_home_images()
returns table (slot smallint, image_url text)
language sql
stable
security definer
set search_path = public
as $$
  select h.slot, h.image_url from public.hero_home_images h order by h.slot;
$$;

revoke all on function public.list_hero_home_images() from public;
grant execute on function public.list_hero_home_images() to anon, authenticated, service_role;
