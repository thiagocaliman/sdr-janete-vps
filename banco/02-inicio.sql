-- AI PRO Janete: o que o banco precisa além da estrutura, aplicado pelo instalador depois do
-- banco/01-estrutura.sql (como supabase_admin). Pode rodar de novo sem duplicar nada.

-- 1. Extensões: pg_net (o banco chama o motor do app) e pg_cron (o relógio de manutenção).
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- 2. O lugar das mídias (áudios, imagens e documentos das conversas), privado.
insert into storage.buckets (id, name, public)
values ('midias', 'midias', false)
on conflict (id) do nothing;

-- 3. Quem pode ler e gravar as mídias: só membros da equipe, e só na pasta de uma conversa.
drop policy if exists midias_membro_le on storage.objects;
create policy midias_membro_le on storage.objects as permissive for select to authenticated
  using ((bucket_id = 'midias'::text) and (select public.eh_membro() as eh_membro));

drop policy if exists midias_membro_grava on storage.objects;
create policy midias_membro_grava on storage.objects as permissive for insert to authenticated
  with check (
    (bucket_id = 'midias'::text)
    and (select public.eh_membro() as eh_membro)
    and (coalesce(array_length(storage.foldername(name), 1), 0) = 1)
    and (storage.filename(name) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'::text)
    and (exists (select 1 from public.conversas c where (c.id)::text = (storage.foldername(objects.name))[1]))
  );

-- 4. Dados iniciais (etapas do funil, configuração, preços), o gatilho que faz da 1ª conta a
-- dona do app, as tabelas do tempo real e o relógio: tudo pela função do próprio banco.
select public.preparar_copia();

-- 5. Preço da voz eleven_v4 (a voz padrão das respostas em áudio).
insert into public.ia_precos (provedor, modelo, vigente_desde, a_partir_de_tokens, por_mil_caracteres, fonte)
select 'elevenlabs', 'eleven_v4', current_date, 0, 0.08, 'https://elevenlabs.io/pricing/api'
where not exists (select 1 from public.ia_precos where provedor = 'elevenlabs' and modelo = 'eleven_v4');
