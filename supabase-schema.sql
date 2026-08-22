-- Supabase SQL Editor에서 한 번 실행하세요.
create table if not exists fishing_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  end_date date,
  event_time text,
  member text not null,
  inserted_at timestamptz not null default now()
);

-- 기존에 이미 테이블을 만들었다면 아래 두 줄만 추가로 실행하면 됩니다.
alter table fishing_events add column if not exists end_date date;
alter table fishing_events alter column event_time type text using event_time::text;

alter table fishing_events enable row level security;

-- 로그인 없이 누구나(anon) 이 테이블을 읽고 쓸 수 있도록 허용합니다.
-- 인증이 없으므로, URL/키를 아는 사람은 누구나 일정을 수정할 수 있습니다.
create policy "Allow anon select" on fishing_events
  for select to anon using (true);

create policy "Allow anon insert" on fishing_events
  for insert to anon with check (true);

create policy "Allow anon update" on fishing_events
  for update to anon using (true);

create policy "Allow anon delete" on fishing_events
  for delete to anon using (true);

-- 한 명이 일정을 추가/수정하면 다른 화면도 자동으로 갱신되도록
-- Realtime 발행 목록에 테이블을 추가합니다.
alter publication supabase_realtime add table fishing_events;
