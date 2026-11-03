create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles readable" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create or replace function public.handle_new_user_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) = 'alzubair@cybersignalx.app' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created_role after insert on auth.users
  for each row execute function public.handle_new_user_role();

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'Cyber Signal X',
  logo_url text,
  primary_hue int not null default 230,
  public_base_url text,
  collect_ip boolean not null default true,
  collect_geo boolean not null default true,
  log_retention_days int not null default 180,
  max_file_mb int not null default 2048,
  blocked_extensions text not null default 'exe,bat,cmd,msi,scr,com,js,vbs,ps1',
  privacy_text text,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1);
grant select, update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "admin read settings" on public.site_settings for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin update settings" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.files (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  display_name text not null,
  description text,
  original_name text not null,
  extension text,
  mime_type text not null default 'application/octet-stream',
  size_bytes bigint not null,
  sha256 text not null,
  sha256_verified_by_server boolean not null default false,
  storage_path text not null,
  status text not null default 'active' check (status in ('active','suspended','deleted')),
  expires_at timestamptz,
  allow_preview boolean not null default true,
  ask_device_label boolean not null default true,
  version int not null default 1,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status_changed_at timestamptz,
  status_changed_by uuid,
  deleted_at timestamptz,
  deleted_by uuid,
  image_width int,
  image_height int,
  preview_path text,
  thumbnail_path text,
  last_modified_at timestamptz,
  file_date date
);
create index files_created_idx on public.files(created_at desc);
grant select, update on public.files to authenticated;
grant all on public.files to service_role;
alter table public.files enable row level security;
create policy "admin read files" on public.files for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin update files" on public.files for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.admin_audit (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid,
  action text not null,
  file_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_created_idx on public.admin_audit(created_at desc);
grant select on public.admin_audit to authenticated;
grant all on public.admin_audit to service_role;
alter table public.admin_audit enable row level security;
create policy "admin read audit" on public.admin_audit for select to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.files_before_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if auth.uid() is not null then
    new.token := old.token; new.storage_path := old.storage_path; new.sha256 := old.sha256;
    new.size_bytes := old.size_bytes; new.original_name := old.original_name; new.mime_type := old.mime_type;
    new.version := old.version; new.sha256_verified_by_server := old.sha256_verified_by_server;
    new.image_width := old.image_width; new.image_height := old.image_height;
    if old.status = 'deleted' then new.status := 'deleted'; end if;
    if new.status = 'deleted' and old.status <> 'deleted' then new.status := old.status; end if;
  end if;
  if new.status is distinct from old.status then
    new.status_changed_at := now();
    new.status_changed_by := coalesce(auth.uid(), new.status_changed_by);
  end if;
  return new;
end $$;
create trigger files_before_update before update on public.files for each row execute function public.files_before_update();

create or replace function public.files_after_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then
    insert into public.admin_audit(admin_id, action, file_id, details) values (
      auth.uid(),
      case when new.status is distinct from old.status then 'status:' || new.status else 'edit' end,
      new.id,
      jsonb_build_object('display_name', new.display_name, 'from_status', old.status, 'to_status', new.status, 'expires_at', new.expires_at)
    );
  end if;
  return new;
end $$;
create trigger files_after_update after update on public.files for each row execute function public.files_after_update();

create table public.access_events (
  id uuid primary key default gen_random_uuid(),
  file_id uuid references public.files(id) on delete set null,
  file_name text,
  token text not null,
  event_type text not null check (event_type in ('page_open','preview_load','download_click','download_start','download_complete')),
  created_at timestamptz not null default now(),
  ip text, country text, region text, city text,
  browser text, browser_version text, os text, os_version text, device_type text,
  screen text, language text, timezone text, user_agent text, referrer text,
  visit_id text, device_label text,
  is_bot boolean not null default false,
  hash_verified boolean
);
create index access_events_created_idx on public.access_events(created_at desc);
create index access_events_file_idx on public.access_events(file_id, created_at desc);
grant select, delete on public.access_events to authenticated;
grant all on public.access_events to service_role;
alter table public.access_events enable row level security;
create policy "admin read events" on public.access_events for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete events" on public.access_events for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.admin_stats()
returns jsonb language plpgsql security definer set search_path = public as $$
declare r jsonb; days int;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'forbidden'; end if;
  select log_retention_days into days from public.site_settings where id = 1;
  if days > 0 then delete from public.access_events where created_at < now() - make_interval(days => days); end if;
  select jsonb_build_object(
    'total_files', (select count(*) from files where status <> 'deleted'),
    'active', (select count(*) from files where status = 'active' and (expires_at is null or expires_at > now())),
    'suspended', (select count(*) from files where status = 'suspended'),
    'expired', (select count(*) from files where status = 'active' and expires_at is not null and expires_at <= now()),
    'deleted', (select count(*) from files where status = 'deleted'),
    'storage_bytes', (select coalesce(sum(size_bytes),0) from files where status <> 'deleted'),
    'visits_raw', (select count(*) from access_events where event_type = 'page_open'),
    'visits_unique', (select count(distinct visit_id) from access_events where event_type = 'page_open' and not is_bot),
    'downloads_started', (select count(*) from access_events where event_type = 'download_start'),
    'downloads_completed', (select count(*) from access_events where event_type = 'download_complete')
  ) into r;
  return r;
end $$;
grant execute on function public.admin_stats() to authenticated;

create or replace view public.file_counters with (security_invoker = on) as
select f.id,
  count(*) filter (where e.event_type = 'page_open') as visits,
  count(distinct e.visit_id) filter (where e.event_type = 'page_open' and not e.is_bot) as unique_visits,
  count(*) filter (where e.event_type = 'download_start') as downloads,
  count(*) filter (where e.event_type = 'download_complete') as downloads_completed
from public.files f left join public.access_events e on e.file_id = f.id
group by f.id;
grant select on public.file_counters to authenticated;

create policy "admin insert files bucket" on storage.objects for insert to authenticated
  with check (bucket_id = 'files' and public.has_role(auth.uid(),'admin'));
create policy "admin select files bucket" on storage.objects for select to authenticated
  using (bucket_id = 'files' and public.has_role(auth.uid(),'admin'));
create policy "admin update files bucket" on storage.objects for update to authenticated
  using (bucket_id = 'files' and public.has_role(auth.uid(),'admin'));
create policy "admin delete files bucket" on storage.objects for delete to authenticated
  using (bucket_id = 'files' and public.has_role(auth.uid(),'admin'));

CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL DEFAULT '',
 avatar_url text,
 notifications_enabled boolean NOT NULL DEFAULT true,
 display_timezone text NOT NULL DEFAULT 'local',
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE FUNCTION public.create_user_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN INSERT INTO public.profiles(id, display_name) VALUES (NEW.id, coalesce(NEW.raw_user_meta_data->>'full_name', '')) ON CONFLICT DO NOTHING; RETURN NEW; END $$;
CREATE TRIGGER create_user_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

CREATE TABLE public.admin_notifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 admin_id uuid NOT NULL,
 event_id uuid NOT NULL REFERENCES public.access_events(id) ON DELETE CASCADE,
 file_id uuid REFERENCES public.files(id),
 file_name text,
 event_type text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 read_at timestamptz,
 UNIQUE (admin_id, event_id)
);
GRANT SELECT, UPDATE ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_read_own ON public.admin_notifications FOR SELECT TO authenticated USING (admin_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY notifications_update_own ON public.admin_notifications FOR UPDATE TO authenticated USING (admin_id = auth.uid() AND public.has_role(auth.uid(), 'admin')) WITH CHECK (admin_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));
CREATE FUNCTION public.notify_download_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN IF NEW.event_type IN ('download_start', 'download_complete') THEN INSERT INTO public.admin_notifications(admin_id, event_id, file_id, file_name, event_type) SELECT r.user_id, NEW.id, NEW.file_id, NEW.file_name, NEW.event_type FROM public.user_roles r WHERE r.role = 'admin'; END IF; RETURN NEW; END $$;
CREATE TRIGGER notify_download_event AFTER INSERT ON public.access_events FOR EACH ROW EXECUTE FUNCTION public.notify_download_event();
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

CREATE TABLE public.download_receipts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 file_id uuid NOT NULL REFERENCES public.files(id),
 visit_id text NOT NULL,
 sha256 text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 completed_at timestamptz
);
GRANT ALL ON public.download_receipts TO service_role;
ALTER TABLE public.download_receipts ENABLE ROW LEVEL SECURITY;
CREATE INDEX download_receipts_created_idx ON public.download_receipts(created_at);
CREATE INDEX admin_notifications_admin_created_idx ON public.admin_notifications(admin_id, created_at DESC);

CREATE TABLE public.ai_access_state (id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1), blocked boolean NOT NULL DEFAULT false, status integer, message text, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, UPDATE ON public.ai_access_state TO authenticated;
GRANT ALL ON public.ai_access_state TO service_role;
ALTER TABLE public.ai_access_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_state_admin ON public.ai_access_state FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));