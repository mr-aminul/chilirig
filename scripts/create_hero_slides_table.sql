create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  image text not null,
  alt_text text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hero_slides enable row level security;

with migrated as (
  select
    ss.image,
    coalesce(
      nullif(trim(ss.image_alt), ''),
      'Hero slide ' || row_number() over (
        order by coalesce(ss.sort_order, 0), ss.created_at, ss.id
      )
    ) as alt_text,
    row_number() over (
      order by coalesce(ss.sort_order, 0), ss.created_at, ss.id
    ) as sort_order
  from public.story_pages sp
  join public.story_sections ss on ss.page_id = sp.id
  where sp.slug = 'homepage-hero'
    and ss.section_type = 'hero'
    and ss.image is not null
)
insert into public.hero_slides (image, alt_text, sort_order)
select migrated.image, migrated.alt_text, migrated.sort_order
from migrated
where not exists (select 1 from public.hero_slides);

delete from public.story_sections
where page_id in (
  select id from public.story_pages where slug = 'homepage-hero'
)
and section_type = 'hero';

delete from public.story_pages where slug = 'homepage-hero';
