-- 016: workspace contact fields + default_hashtags + sell_your_car_url

do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'workspaces' and column_name = 'contact_phone'
    ) then
        alter table public.workspaces add column contact_phone text;
    end if;

    if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'workspaces' and column_name = 'contact_email'
    ) then
        alter table public.workspaces add column contact_email text;
    end if;

    if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'workspaces' and column_name = 'website_url'
    ) then
        alter table public.workspaces add column website_url text;
    end if;

    if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'workspaces' and column_name = 'location'
    ) then
        alter table public.workspaces add column location text;
    end if;

    if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'workspaces' and column_name = 'default_hashtags'
    ) then
        alter table public.workspaces add column default_hashtags text[] default '{}';
    end if;

    if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'workspaces' and column_name = 'sell_your_car_url'
    ) then
        alter table public.workspaces add column sell_your_car_url text;
    end if;

    if not exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'posts' and column_name = 'cta_url'
    ) then
        alter table public.posts add column cta_url text;
    end if;
end
$$;

-- Seed Everest Motoring
update public.workspaces
  set contact_phone = '013 854 0600',
      contact_email = 'info@everestmotoring.co.za',
      website_url = 'https://everestmotoring.co.za',
      location = 'White River, Mpumalanga',
      default_hashtags = ARRAY[
        '#EverestMotoring','#WhiteRiver','#Mpumalanga','#PreOwnedCars',
        '#UsedCarsSA','#CarDealershipSA','#CarFinance','#TradeIns'
      ],
      sell_your_car_url = 'https://everestmotoring.co.za/value-my-car'
  where id = 'f7f5aa12-4dab-4aac-ad30-6ff8326c73c3';
