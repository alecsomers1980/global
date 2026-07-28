create or replace function is_admin() returns boolean language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'playwrights','plays','play_playwrights','play_roles','play_media',
    'play_press','play_productions','rights_availability','licence_tiers','enquiries'
  ] loop
    execute format(
      'create policy "admins write %1$s" on %1$I for all using (is_admin()) with check (is_admin())', t
    );
  end loop;
end $$;