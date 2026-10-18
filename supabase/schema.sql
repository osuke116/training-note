-- TRAINING NOTE: individual account state, no anonymous access.
create table if not exists public.training_note_user_state (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null default '{"logs":[],"customExercises":[],"manualItems":[]}'::jsonb,
 revision bigint not null default 0 check (revision >= 0),
 updated_at timestamptz not null default now(),
 constraint training_note_payload_object check (jsonb_typeof(payload) = 'object'),
 constraint training_note_payload_size check (octet_length(payload::text) <= 2000000)
);
alter table public.training_note_user_state enable row level security;
revoke all on public.training_note_user_state from anon;
grant select, insert, update, delete on public.training_note_user_state to authenticated;
create policy training_note_select_own on public.training_note_user_state for select to authenticated using ((select auth.uid()) = user_id);
create policy training_note_insert_own on public.training_note_user_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy training_note_update_own on public.training_note_user_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy training_note_delete_own on public.training_note_user_state for delete to authenticated using ((select auth.uid()) = user_id);
