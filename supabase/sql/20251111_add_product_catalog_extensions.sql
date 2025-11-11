-- Categories and subcategories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (category_id, slug)
);

alter table public.products
  add column if not exists category_id uuid references public.categories(id) on delete set null,
  add column if not exists subcategory_id uuid references public.subcategories(id) on delete set null,
  add column if not exists hs_code text,
  add column if not exists min_order_quantity integer,
  add column if not exists lead_time_days integer,
  add column if not exists packaging_length_cm numeric(10, 2),
  add column if not exists packaging_width_cm numeric(10, 2),
  add column if not exists packaging_height_cm numeric(10, 2),
  add column if not exists packaging_weight_kg numeric(10, 2),
  add column if not exists moq integer not null default 1,
  add column if not exists cartons_per_moq numeric(12, 2),
  add column if not exists pallets_per_moq numeric(12, 2),
  add column if not exists containers_20ft_per_moq numeric(12, 2),
  add column if not exists containers_40ft_per_moq numeric(12, 2),
  add column if not exists shipping_notes text;

alter table public.products
  drop column if exists image_url;
alter table public.products
  drop column if exists incoterm_term,
  drop column if exists incoterm_port;

drop table if exists public.product_incoterms cascade;

create table public.product_incoterms (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  term text not null,
  currency text not null,
  price numeric(12, 2) not null check (price >= 0),
  port text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint product_incoterms_term_check check (
    term in ('EXW','FOB','CFR')
  ),
  constraint product_incoterms_currency_check check (
    currency in ('USD','RMB')
  ),
  constraint product_incoterms_port_check check (
    port in ('Shanghai Port','Ningbo Port','Guangzhou Port','Bandar Abbas')
  )
);

alter table public.product_incoterms enable row level security;

create policy "Product incoterms are visible to owners"
  on public.product_incoterms
  for select using (
    auth.uid() is not null and exists (
      select 1
      from public.products p
      where p.id = product_incoterms.product_id
        and p.seller_id = auth.uid()
    )
  );

create policy "Product incoterms can be managed by owners"
  on public.product_incoterms
  using (
    auth.uid() is not null and exists (
      select 1
      from public.products p
      where p.id = product_incoterms.product_id
        and p.seller_id = auth.uid()
    )
  );

drop table if exists public.product_images cascade;

drop policy if exists "Authenticated users can manage own product images" on storage.objects;

do $$
begin
  if exists (select 1 from storage.buckets where name = 'product-images') then
    perform storage.empty_bucket('product-images');
    perform storage.delete_bucket('product-images');
  end if;
end;
$$;
