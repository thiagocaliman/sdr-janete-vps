-- AI PRO Janete: a estrutura do banco (schema public), aplicada pelo instalador num Supabase novo.
-- Gerado a partir do banco em uso com pg_dump --schema-only --schema=public.
-- Os dados iniciais, o tempo real e o relógio vêm do banco/02-inicio.sql.

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--




--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--



--
-- Name: auditoria_acao; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.auditoria_acao AS ENUM (
    'chave_cadastrada',
    'chave_trocada',
    'chave_removida',
    'chave_recusada',
    'conexao_criada',
    'conexao_ativada',
    'conexao_desativada',
    'membro_convidado',
    'membro_desativado',
    'membro_papel_trocado',
    'contato_apagado',
    'membro_reativado',
    'convite_reenviado',
    'convite_cancelado',
    'membro_entrou',
    'ritmo_alterado',
    'voz_alterada'
);


ALTER TYPE public.auditoria_acao OWNER TO postgres;

--
-- Name: chamada_tipo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.chamada_tipo AS ENUM (
    'resposta',
    'transcricao',
    'onboarding',
    'fala'
);


ALTER TYPE public.chamada_tipo OWNER TO postgres;

--
-- Name: chave_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.chave_status AS ENUM (
    'ativa',
    'invalida',
    'sem_credito',
    'removida'
);


ALTER TYPE public.chave_status OWNER TO postgres;

--
-- Name: conexao_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.conexao_status AS ENUM (
    'conectando',
    'conectada',
    'desconectada',
    'erro'
);


ALTER TYPE public.conexao_status OWNER TO postgres;

--
-- Name: contexto_origem; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.contexto_origem AS ENUM (
    'onboarding',
    'edicao',
    'restauracao'
);


ALTER TYPE public.contexto_origem OWNER TO postgres;

--
-- Name: conversa_evento_tipo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.conversa_evento_tipo AS ENUM (
    'passou',
    'assumiu',
    'devolveu',
    'celular',
    'voltou_para_fila'
);


ALTER TYPE public.conversa_evento_tipo OWNER TO postgres;

--
-- Name: conversa_modo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.conversa_modo AS ENUM (
    'janete',
    'humano'
);


ALTER TYPE public.conversa_modo OWNER TO postgres;

--
-- Name: custo_origem; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.custo_origem AS ENUM (
    'provedor',
    'tabela',
    'sem_preco'
);


ALTER TYPE public.custo_origem OWNER TO postgres;

--
-- Name: etapa_tipo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.etapa_tipo AS ENUM (
    'aberta',
    'ganho',
    'perdido'
);


ALTER TYPE public.etapa_tipo OWNER TO postgres;

--
-- Name: gateway; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.gateway AS ENUM (
    'meta',
    'zernio',
    'zapi',
    'evolution'
);


ALTER TYPE public.gateway OWNER TO postgres;

--
-- Name: historico_ator; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.historico_ator AS ENUM (
    'membro',
    'janete',
    'sistema'
);


ALTER TYPE public.historico_ator OWNER TO postgres;

--
-- Name: ia_finalidade; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ia_finalidade AS ENUM (
    'resposta',
    'transcricao',
    'voz'
);


ALTER TYPE public.ia_finalidade OWNER TO postgres;

--
-- Name: ia_provedor; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ia_provedor AS ENUM (
    'anthropic',
    'openai',
    'openrouter',
    'groq',
    'elevenlabs'
);


ALTER TYPE public.ia_provedor OWNER TO postgres;

--
-- Name: identificador_tipo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.identificador_tipo AS ENUM (
    'telefone',
    'bsuid',
    'lid',
    'zernio_conversa'
);


ALTER TYPE public.identificador_tipo OWNER TO postgres;

--
-- Name: mensagem_direcao; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.mensagem_direcao AS ENUM (
    'entrada',
    'saida'
);


ALTER TYPE public.mensagem_direcao OWNER TO postgres;

--
-- Name: mensagem_origem; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.mensagem_origem AS ENUM (
    'lead',
    'janete',
    'humano_tela',
    'humano_celular'
);


ALTER TYPE public.mensagem_origem OWNER TO postgres;

--
-- Name: mensagem_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.mensagem_status AS ENUM (
    'recebida',
    'na_fila',
    'enviando',
    'enviada',
    'entregue',
    'lida',
    'falhou',
    'cancelada'
);


ALTER TYPE public.mensagem_status OWNER TO postgres;

--
-- Name: mensagem_tipo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.mensagem_tipo AS ENUM (
    'texto',
    'imagem',
    'audio',
    'video',
    'documento',
    'figurinha',
    'outro'
);


ALTER TYPE public.mensagem_tipo OWNER TO postgres;

--
-- Name: midia_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.midia_status AS ENUM (
    'pendente',
    'copiada',
    'falhou',
    'expirada'
);


ALTER TYPE public.midia_status OWNER TO postgres;

--
-- Name: motivo_humano; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.motivo_humano AS ENUM (
    'janete_passou',
    'humano_tela',
    'humano_celular',
    'chave_invalida',
    'sem_credito',
    'audio_sem_transcricao',
    'limite_passos',
    'erro_provedor',
    'envio_falhou'
);


ALTER TYPE public.motivo_humano OWNER TO postgres;

--
-- Name: papel_membro; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.papel_membro AS ENUM (
    'admin',
    'atendente'
);


ALTER TYPE public.papel_membro OWNER TO postgres;

--
-- Name: rodada_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rodada_status AS ENUM (
    'rodando',
    'concluida',
    'falhou',
    'cancelada'
);


ALTER TYPE public.rodada_status OWNER TO postgres;

--
-- Name: acordar_motor(boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.acordar_motor(p_renovar boolean DEFAULT false) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_url    text;
  v_chave  text;
  v_tocado timestamptz;
  v_visto  timestamptz;
begin
  select mo.url, mo.chave, mo.tocado_em into v_url, v_chave, v_tocado
    from public.motor mo where mo.id
     for update;
  if v_url is null then
    return 'sem_endereco';
  end if;
  if coalesce(p_renovar, false) then
    if v_tocado > now() - interval '10 seconds' then
      return 'recente';
    end if;
  else
    select cf.worker_visto_em into v_visto from public.configuracao cf where cf.id = 1;
    if v_tocado > now() - interval '40 seconds' or v_visto > now() - interval '40 seconds' then
      return 'recente';
    end if;
  end if;
  perform net.http_post(
    url := v_url || '/api/public/cron/mensageria',
    body := '{}'::jsonb,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-janete-motor', v_chave),
    timeout_milliseconds := 60000
  );
  update public.motor mo set tocado_em = now() where mo.id;
  return 'tocado';
end;
$$;


ALTER FUNCTION public.acordar_motor(p_renovar boolean) OWNER TO postgres;

--
-- Name: assumir_conversa(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assumir_conversa(p_conversa uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_membro uuid := public.membro_atual();
  v_antes public.conversas;
  v_de text;
begin
  -- novo: espera o desativar_membro que estiver rodando (for update no membro) e
  -- confere de novo que a pessoa continua ativa. Sem isso, quem é desativado
  -- enquanto clica em Assumir fica com a conversa (decisão 4). Ordem das travas
  -- igual à do desativar_membro: membro, depois conversa.
  perform 1 from public.membros mb where mb.id = v_membro and mb.ativo for share;
  if not found then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;

  -- novo: o estado de antes (travado), para o evento
  select * into v_antes from public.conversas c where c.id = p_conversa for update;
  if not found then
    raise exception using message = 'conversa_nao_encontrada', errcode = 'P0001';
  end if;

  update public.conversas c
     set modo = 'humano',
         responsavel_id = v_membro,
         aguardando_humano_desde = null,
         motivo_humano = case when c.modo = 'janete' then 'humano_tela'::public.motivo_humano
                              else c.motivo_humano end,
         responder_apos = null
   where c.id = p_conversa;
  if not found then
    raise exception using message = 'conversa_nao_encontrada', errcode = 'P0001';
  end if;

  update public.mensagens m
     set status = 'cancelada', status_em = now()
   where m.conversa_id = p_conversa and m.origem = 'janete' and m.status = 'na_fila';

  with canceladas as (
    update public.rodadas r
       set status = 'cancelada', terminada_em = now()
     where r.conversa_id = p_conversa and r.status = 'rodando' and not r.passou_humano
    returning r.id
  )
  update public.mensagens m
     set rodada_id = null
    from canceladas k
   where m.rodada_id = k.id and m.direcao = 'entrada';

  -- novo
  if v_antes.modo = 'janete' or v_antes.responsavel_id is distinct from v_membro then
    v_de := case when v_antes.modo = 'janete' then 'janete'
                 when v_antes.responsavel_id is not null then 'outro'
                 when v_antes.aguardando_humano_desde is null then 'celular'
                 else 'espera' end;
    insert into public.conversa_eventos (conversa_id, tipo, membro_id, de, de_membro_id, por_envio)
    values (p_conversa, 'assumiu', v_membro, v_de,
            case when v_de = 'outro' then v_antes.responsavel_id end, false);
  end if;
end;
$$;


ALTER FUNCTION public.assumir_conversa(p_conversa uuid) OWNER TO postgres;

--
-- Name: atualizar_status(uuid, text, public.mensagem_status, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.atualizar_status(p_conexao uuid, p_id text, p_status public.mensagem_status, p_momento timestamp with time zone) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_casaram int;
begin
  if nullif(btrim(coalesce(p_id, '')), '') is null then
    return 0;
  end if;

  with alvo as (
    select m.id, m.status
    from public.mensagens m
    where m.conexao_id = p_conexao
      and m.direcao = 'saida'
      and (m.id_externo = p_id or m.id_gateway = p_id)
    for update
  ), muda as (
    update public.mensagens m
       set status = p_status,
           status_em = coalesce(p_momento, now()),
           erro = case when p_status = 'falhou' then 'falha_no_gateway' else m.erro end,
           momento = case when a.status in ('na_fila', 'enviando') and p_status <> 'falhou'
                          then coalesce(m.status_em, m.momento) else m.momento end
      from alvo a
     where m.id = a.id
       and (
         (p_status in ('enviada', 'entregue', 'lida')
          and a.status in ('na_fila', 'enviando', 'enviada', 'entregue')
          and array_position(array['na_fila', 'enviando', 'enviada', 'entregue', 'lida'], p_status::text)
            > array_position(array['na_fila', 'enviando', 'enviada', 'entregue', 'lida'], a.status::text))
         or (p_status = 'falhou' and a.status in ('enviando', 'enviada'))
       )
    returning m.id
  )
  select count(*) into v_casaram from alvo;

  return v_casaram;
end;
$$;


ALTER FUNCTION public.atualizar_status(p_conexao uuid, p_id text, p_status public.mensagem_status, p_momento timestamp with time zone) OWNER TO postgres;

--
-- Name: buscar_quadro(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.buscar_quadro(p_q text) RETURNS SETOF uuid
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_membro uuid := public.membro_atual();
  v_q      text := nullif(public.texto_busca(p_q), '');
begin
  if v_q is null then
    return;
  end if;
  return query
  select c.id
    from public.contatos c
    left join public.conversas cv on cv.contato_id = c.id
   where strpos(public.texto_busca(c.nome), v_q) > 0
      or strpos(public.texto_busca(c.empresa), v_q) > 0
      or strpos(public.texto_busca(c.nome_whatsapp), v_q) > 0
      or (cv.id is not null and exists (
            select 1
              from public.mensagens m
             where m.conversa_id = cv.id
               and m.apagada_em is null
               and (strpos(public.texto_busca(m.texto), v_q) > 0
                    or strpos(public.texto_busca(m.transcricao), v_q) > 0)))
   order by cv.ultima_mensagem_em desc nulls last, c.id
   limit 50;
end;
$$;


ALTER FUNCTION public.buscar_quadro(p_q text) OWNER TO postgres;

--
-- Name: concluir_envio(uuid, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.concluir_envio(p_msg uuid, p_id_externo text, p_id_gateway text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_m   public.mensagens;
  v_id  text := nullif(btrim(coalesce(p_id_externo, '')), '');
  v_gw  text := nullif(btrim(coalesce(p_id_gateway, '')), '');
  v_dup public.mensagens;
  v_rod public.rodadas;
  v_volta int := 0;
begin
  select * into v_m from public.mensagens m where m.id = p_msg for update;
  if not found then
    raise exception using message = 'mensagem_nao_encontrada', errcode = 'P0001';
  end if;

  loop
    v_volta := v_volta + 1;

    if v_id is not null and v_id is distinct from v_m.id_externo then
      select * into v_dup
      from public.mensagens d
      where d.conexao_id = v_m.conexao_id and d.id_externo = v_id and d.id <> p_msg
      for update;

      if found then
        if v_dup.conversa_id = v_m.conversa_id
           and v_dup.origem = 'humano_celular'
           and v_dup.criado_em > now() - interval '60 seconds' then
          delete from public.mensagens d where d.id = v_dup.id;
          -- novo: o evento "celular" da duplicata não aconteceu
          delete from public.conversa_eventos e
           where e.conversa_id = v_m.conversa_id
             and e.tipo = 'celular'
             and e.criado_em = v_dup.criado_em;

          if v_m.origem = 'janete'
             and not exists (select 1 from public.mensagens h
                             where h.conversa_id = v_m.conversa_id
                               and h.origem in ('humano_tela', 'humano_celular')
                               and h.criado_em >= v_m.criado_em) then
            update public.conversas c
               set modo = 'janete',
                   motivo_humano = null
             where c.id = v_m.conversa_id
               and c.modo = 'humano'
               and c.motivo_humano = 'humano_celular'
               and c.responsavel_id is null;
            if found then
              -- So o que o insert da duplicata desfez: o gatilho dela grava
              -- status_em / terminada_em = now() da transacao em que ela entrou,
              -- que e o criado_em dela. Cancelado por outro motivo fica.
              update public.mensagens n
                 set status = 'na_fila', status_em = now()
               where n.conversa_id = v_m.conversa_id
                 and n.origem = 'janete' and n.status = 'cancelada'
                 and n.status_em = v_dup.criado_em;

              select * into v_rod
              from public.rodadas r
              where r.conversa_id = v_m.conversa_id
                and r.status = 'cancelada'
                and r.terminada_em = v_dup.criado_em
              order by r.iniciada_em desc
              limit 1
              for update;

              if found then
                if exists (select 1 from public.mensagens s
                           where s.rodada_id = v_rod.id and s.direcao = 'saida')
                   or coalesce(v_rod.ferramentas, '[]'::jsonb) <> '[]'::jsonb
                   or coalesce(v_rod.passos, 0) > 0 then
                  -- o worker ja concluiu a rodada cancelada (gravou respostas,
                  -- ferramentas ou passos): as respostas dela, gravadas como
                  -- canceladas so por causa da duplicata, voltam. Conclusao sem
                  -- nada disso nao se distingue: volta a rodar e, se ninguem a
                  -- concluir, expira em 5 min como falha passageira.
                  update public.mensagens s
                     set status = 'na_fila', status_em = now()
                   where s.rodada_id = v_rod.id and s.direcao = 'saida'
                     and s.origem = 'janete' and s.status = 'cancelada';
                  update public.rodadas r set status = 'concluida' where r.id = v_rod.id;
                elsif not exists (select 1 from public.rodadas o
                                  where o.conversa_id = v_m.conversa_id and o.status = 'rodando') then
                  -- o worker ainda esta com ela: volta a rodar
                  update public.rodadas r
                     set status = 'rodando', terminada_em = null
                   where r.id = v_rod.id;
                else
                  v_rod := null;
                end if;

                if v_rod.id is not null then
                  -- religa as entradas que ela lia (o pegar_rodadas liga todas as
                  -- soltas de antes do inicio dela)
                  update public.mensagens e
                     set rodada_id = v_rod.id
                   where e.conversa_id = v_m.conversa_id and e.direcao = 'entrada'
                     and e.rodada_id is null and e.criado_em <= v_rod.iniciada_em;
                end if;
              end if;

              -- Re-arma se sobrou entrada sem leitura depois da ultima rodada que
              -- concluiu ou esta rodando (o gatilho da duplicata limpou o armado).
              update public.conversas c
                 set responder_apos = coalesce(c.responder_apos, now())
               where c.id = v_m.conversa_id
                 and exists (select 1 from public.mensagens e
                             where e.conversa_id = c.id and e.direcao = 'entrada'
                               and e.rodada_id is null
                               and e.criado_em > coalesce(
                                     (select max(r.iniciada_em) from public.rodadas r
                                      where r.conversa_id = c.id
                                        and r.status in ('concluida', 'rodando')),
                                     '-infinity'::timestamptz));
            end if;
          end if;
        else
          v_id := null;
        end if;
      end if;
    end if;

    begin
      update public.mensagens m
         set status = case when m.status in ('na_fila', 'enviando')
                             or (m.status = 'falhou' and m.erro = 'sem_resposta_do_envio')
                           then 'enviada'::public.mensagem_status else m.status end,
             status_em = case when m.status in ('na_fila', 'enviando')
                                or (m.status = 'falhou' and m.erro = 'sem_resposta_do_envio')
                              then now() else m.status_em end,
             erro = case when m.status in ('na_fila', 'enviando')
                           or (m.status = 'falhou' and m.erro = 'sem_resposta_do_envio')
                         then null else m.erro end,
             id_externo = coalesce(v_id, m.id_externo),
             id_gateway = coalesce(v_gw, m.id_gateway),
             momento = case when m.status in ('na_fila', 'enviando')
                              or (m.status = 'falhou' and m.erro = 'sem_resposta_do_envio')
                            then now() else m.momento end
       where m.id = p_msg;
      return;
    exception when unique_violation then
      -- um eco entrou com esse id entre a conferencia e o update: confere de novo
      if v_volta >= 2 then
        v_id := null;
      end if;
    end;
  end loop;
end;
$$;


ALTER FUNCTION public.concluir_envio(p_msg uuid, p_id_externo text, p_id_gateway text) OWNER TO postgres;

--
-- Name: concluir_midia(uuid, text, text, bigint, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.concluir_midia(p_msg uuid, p_caminho text, p_mime text, p_tamanho bigint, p_ok boolean) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_m public.mensagens;
begin
  select * into v_m from public.mensagens m where m.id = p_msg for update;
  if not found then
    raise exception using message = 'mensagem_nao_encontrada', errcode = 'P0001';
  end if;

  if coalesce(p_ok, false) then
    update public.mensagens m
       set midia_status = 'copiada',
           midia_caminho = p_caminho,
           midia_mime = coalesce(nullif(p_mime, ''), m.midia_mime),
           midia_tamanho = coalesce(p_tamanho, m.midia_tamanho),
           midia_pega_em = null
     where m.id = p_msg;
  else
    update public.mensagens m
       set midia_status = case when m.midia_tentativas >= 3 then 'falhou'::public.midia_status
                               else 'pendente'::public.midia_status end,
           midia_pega_em = null
     where m.id = p_msg and m.midia_status = 'pendente';
  end if;
end;
$$;


ALTER FUNCTION public.concluir_midia(p_msg uuid, p_caminho text, p_mime text, p_tamanho bigint, p_ok boolean) OWNER TO postgres;

--
-- Name: concluir_onboarding(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.concluir_onboarding() RETURNS timestamp with time zone
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_em timestamptz;
begin
  if not coalesce(public.eh_admin(), false) then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;

  select cf.onboarding_concluido_em into v_em from public.configuracao cf where cf.id = 1 for update;
  if v_em is not null then
    return v_em;
  end if;

  insert into public.configuracao as cf (id, onboarding_concluido_em)
  values (1, now())
  on conflict (id) do update
    set onboarding_concluido_em = coalesce(cf.onboarding_concluido_em, excluded.onboarding_concluido_em)
  returning onboarding_concluido_em into v_em;

  return v_em;
end;
$$;


ALTER FUNCTION public.concluir_onboarding() OWNER TO postgres;

--
-- Name: concluir_rodada(uuid, jsonb, jsonb, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.concluir_rodada(p_rodada uuid, p_respostas jsonb, p_ferramentas jsonb, p_passos integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
declare
  v_r       public.rodadas;
  v_c       public.conversas;
  v_status  public.mensagem_status;
  v_conexao uuid;
begin
  select * into v_r from public.rodadas r where r.id = p_rodada for update;
  if not found or v_r.status not in ('rodando', 'cancelada') then
    raise exception using message = 'rodada_nao_rodando', errcode = 'P0001';
  end if;

  select * into v_c from public.conversas c where c.id = v_r.conversa_id for update;

  if v_r.status = 'rodando'
     and (v_c.modo = 'janete' or coalesce(v_r.passou_humano, false))
     and not exists (select 1 from public.mensagens h
                     where h.conversa_id = v_c.id
                       and h.origem in ('humano_tela', 'humano_celular')
                       and h.criado_em >= v_r.iniciada_em) then
    v_status := 'na_fila';
  else
    v_status := 'cancelada';
  end if;

  select cx.id into v_conexao from public.conexoes cx where cx.ativa limit 1;
  v_conexao := coalesce(v_conexao, v_c.conexao_id);

  with itens as (
    select e.ord,
           case when e.val ->> 'tipo' = 'audio' then 'audio' else 'texto' end as tipo,
           e.val ->> 'texto' as texto,
           btrim(coalesce(e.val ->> 'transcricao', '')) as transcricao,
           case when (e.val ->> 'id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                then (e.val ->> 'id')::uuid end as id,
           e.val ->> 'midia_caminho' as caminho,
           e.val ->> 'midia_mime' as mime,
           -- CASE aninhado: só converte depois de saber que é número (a ordem de um AND não é garantida)
           case when jsonb_typeof(e.val -> 'midia_tamanho') = 'number' then
             case when (e.val ->> 'midia_tamanho')::numeric between 1 and 104857600
                  then round((e.val ->> 'midia_tamanho')::numeric)::bigint end
           end as tamanho,
           case when jsonb_typeof(e.val -> 'midia_duracao_s') = 'number' then
             case when (e.val ->> 'midia_duracao_s')::numeric between 0 and 86400
                  then round((e.val ->> 'midia_duracao_s')::numeric)::integer end
           end as duracao
    from jsonb_array_elements(case when jsonb_typeof(p_respostas) = 'array' then p_respostas else '[]'::jsonb end)
         with ordinality as e(val, ord)
    where jsonb_typeof(e.val) = 'object'
  ), validos as (
    select i.*, row_number() over (order by i.ord) as n
    from itens i
    where (i.tipo = 'texto' and btrim(coalesce(i.texto, '')) <> '')
       or (i.tipo = 'audio'
           and i.id is not null
           and i.caminho = v_c.id::text || '/' || i.id::text
           and i.transcricao <> ''
           and coalesce(i.mime, '') ~* '^audio/[a-z0-9.+-]+(;.*)?$')
  )
  insert into public.mensagens (id, conversa_id, conexao_id, direcao, origem, tipo, texto,
                                transcricao, midia_caminho, midia_mime, midia_tamanho,
                                midia_duracao_s, midia_status, status, ordem, enviar_apos,
                                rodada_id, momento)
  select case when x.tipo = 'audio' then x.id else gen_random_uuid() end,
         v_c.id, v_conexao, 'saida', 'janete', x.tipo::public.mensagem_tipo,
         case when x.tipo = 'texto' then x.texto end,
         case when x.tipo = 'audio' then x.transcricao end,
         case when x.tipo = 'audio' then x.caminho end,
         case when x.tipo = 'audio' then x.mime end,
         case when x.tipo = 'audio' then x.tamanho end,
         case when x.tipo = 'audio' then x.duracao end,
         case when x.tipo = 'audio' then 'copiada'::public.midia_status end,
         v_status, x.n, now() + (x.n - 1)::int * interval '2 seconds', p_rodada, now()
  from validos x
  order by x.n;

  update public.rodadas r
     set status = case when r.status = 'cancelada' then r.status
                       else 'concluida'::public.rodada_status end,
         ferramentas = coalesce(p_ferramentas, r.ferramentas),
         passos = coalesce(p_passos, r.passos),
         terminada_em = coalesce(r.terminada_em, now())
   where r.id = p_rodada;
end;
$_$;


ALTER FUNCTION public.concluir_rodada(p_rodada uuid, p_respostas jsonb, p_ferramentas jsonb, p_passos integer) OWNER TO postgres;

--
-- Name: contato_por_ids(uuid, jsonb, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.contato_por_ids(p_conexao uuid, p_ids jsonb, p_nome_whatsapp text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_ids jsonb := public.ids_normalizados(p_ids);
  v_nome text := nullif(btrim(coalesce(p_nome_whatsapp, '')), '');
  v_tel text;
  v_contato uuid;
  v_volta int := 0;
begin
  if jsonb_array_length(v_ids) = 0 then
    raise exception using message = 'sem_identificador', errcode = 'P0001';
  end if;

  select i.valor into v_tel
  from jsonb_to_recordset(v_ids) as i(tipo text, valor text, prio int)
  where i.tipo = 'telefone'
  order by i.valor
  limit 1;

  loop
    v_volta := v_volta + 1;

    select ci.contato_id into v_contato
    from public.contato_identificadores ci
    join jsonb_to_recordset(v_ids) as i(tipo text, valor text, prio int)
      on ci.tipo = i.tipo::public.identificador_tipo and ci.valor = i.valor
    order by i.prio
    limit 1;

    if v_contato is not null then
      -- liga os ids que ainda nao existem; id de outro contato fica onde esta
      insert into public.contato_identificadores (contato_id, tipo, valor, conexao_id)
      select v_contato, i.tipo::public.identificador_tipo, i.valor, p_conexao
      from jsonb_to_recordset(v_ids) as i(tipo text, valor text, prio int)
      order by i.prio, i.valor
      on conflict (tipo, valor) do nothing;

      -- telefone na ficha so se o identificador de telefone e deste contato
      if v_tel is not null and not exists (
        select 1 from public.contato_identificadores ci
        where ci.tipo = 'telefone' and ci.valor = v_tel and ci.contato_id = v_contato) then
        v_tel := null;
      end if;

      update public.contatos c
         set nome_whatsapp = coalesce(v_nome, c.nome_whatsapp),
             telefone      = coalesce(c.telefone, v_tel),
             atualizado_em = now()
       where c.id = v_contato
         and ((v_nome is not null and c.nome_whatsapp is distinct from v_nome)
              or (c.telefone is null and v_tel is not null));

      return v_contato;
    end if;

    begin
      insert into public.contatos (nome_whatsapp, telefone)
      values (v_nome, v_tel)
      returning id into v_contato;

      insert into public.contato_identificadores (contato_id, tipo, valor, conexao_id)
      select v_contato, i.tipo::public.identificador_tipo, i.valor, p_conexao
      from jsonb_to_recordset(v_ids) as i(tipo text, valor text, prio int)
      order by i.prio, i.valor;

      return v_contato;
    exception when unique_violation then
      -- outra chamada criou o contato ao mesmo tempo: desfeito, busca de novo
      v_contato := null;
      if v_volta >= 5 then
        raise;
      end if;
    end;
  end loop;
end;
$$;


ALTER FUNCTION public.contato_por_ids(p_conexao uuid, p_ids jsonb, p_nome_whatsapp text) OWNER TO postgres;

--
-- Name: contatos_contadores(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.contatos_contadores() RETURNS jsonb
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_membro uuid := public.membro_atual();
  v_hoje   date := (now() at time zone 'America/Sao_Paulo')::date;
  v_r      jsonb;
begin
  select jsonb_build_object(
           'todos', count(*),
           'precisam', count(*) filter (
             where c.primeira_mensagem_em is not null and cv.modo = 'humano'
               and cv.responsavel_id is null and cv.aguardando_humano_desde is not null),
           'novos_hoje', count(*) filter (
             where c.primeira_mensagem_em is not null
               and (c.primeira_mensagem_em at time zone 'America/Sao_Paulo')::date = v_hoje),
           'com_janete', count(*) filter (
             where c.primeira_mensagem_em is not null and cv.modo = 'janete'),
           'comigo', count(*) filter (
             where c.primeira_mensagem_em is not null and cv.modo = 'humano'
               and cv.responsavel_id = v_membro))
    into v_r
    from public.contatos c
    left join public.conversas cv on cv.contato_id = c.id;
  return v_r;
end;
$$;


ALTER FUNCTION public.contatos_contadores() OWNER TO postgres;

--
-- Name: contatos_lista(text, text, uuid[], date, date, text, text, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.contatos_lista(p_busca text, p_recorte text, p_etapas uuid[], p_entrada_de date, p_entrada_ate date, p_ordem text, p_direcao text, p_limite integer, p_deslocamento integer) RETURNS jsonb
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_membro  uuid := public.membro_atual();
  v_recorte text := coalesce(nullif(btrim(p_recorte), ''), 'todos');
  v_ordem   text := coalesce(nullif(btrim(p_ordem), ''), 'ultima');
  v_direcao text := coalesce(nullif(btrim(p_direcao), ''), 'desc');
  v_asc     boolean;
  v_limite  int := coalesce(p_limite, 50);
  v_desloc  int := greatest(coalesce(p_deslocamento, 0), 0);
  v_q       text := nullif(public.texto_busca(p_busca), '');
  v_digitos text := regexp_replace(coalesce(p_busca, ''), '[^0-9]', '', 'g');
  v_hoje    date := (now() at time zone 'America/Sao_Paulo')::date;
  v_de      timestamptz;
  v_ate     timestamptz;
  v_total   bigint;
  v_linhas  jsonb;
begin
  if v_recorte not in ('todos', 'precisam', 'novos_hoje', 'com_janete', 'comigo') then
    raise exception using message = 'parametro_invalido', errcode = '22023', detail = 'p_recorte';
  end if;
  if v_ordem not in ('contato', 'etapa', 'ultima', 'entrada') then
    raise exception using message = 'parametro_invalido', errcode = '22023', detail = 'p_ordem';
  end if;
  if v_direcao not in ('asc', 'desc') then
    raise exception using message = 'parametro_invalido', errcode = '22023', detail = 'p_direcao';
  end if;
  if v_limite < 1 or v_limite > 200 then
    raise exception using message = 'parametro_invalido', errcode = '22023', detail = 'p_limite';
  end if;
  v_asc := v_direcao = 'asc';
  if length(v_digitos) < 4 then
    v_digitos := null;
  end if;
  -- [de 00:00 SP, ate + 1 dia 00:00 SP): o mesmo que comparar a data de SP, usando o índice.
  if p_entrada_de is not null then
    v_de := p_entrada_de::timestamp at time zone 'America/Sao_Paulo';
  end if;
  if p_entrada_ate is not null then
    v_ate := (p_entrada_ate + 1)::timestamp at time zone 'America/Sao_Paulo';
  end if;

  with base as (
    select c.id, c.nome, c.nome_whatsapp, c.telefone, c.email, c.empresa, c.etapa_id,
           c.primeira_mensagem_em, c.criado_em,
           coalesce(c.primeira_mensagem_em, c.criado_em) as entrou_em,
           e.ordem as etapa_ordem,
           public.texto_busca(coalesce(nullif(btrim(c.nome), ''), nullif(btrim(c.nome_whatsapp), ''),
                                       nullif(btrim(c.telefone), ''), 'Sem nome')) as nome_ordem,
           cv.id as conversa_id, cv.modo, cv.responsavel_id, cv.motivo_humano,
           cv.aguardando_humano_desde, cv.ultima_mensagem_em, cv.ultima_do_lead_em,
           cv.ultima_da_janete_em, cv.nao_lidas
      from public.contatos c
      join public.etapas e on e.id = c.etapa_id
      left join public.conversas cv on cv.contato_id = c.id
     where coalesce(case v_recorte
             when 'todos' then true
             when 'precisam' then c.primeira_mensagem_em is not null and cv.modo = 'humano'
                                  and cv.responsavel_id is null and cv.aguardando_humano_desde is not null
             when 'novos_hoje' then c.primeira_mensagem_em is not null
                                  and (c.primeira_mensagem_em at time zone 'America/Sao_Paulo')::date = v_hoje
             when 'com_janete' then c.primeira_mensagem_em is not null and cv.modo = 'janete'
             when 'comigo' then c.primeira_mensagem_em is not null and cv.modo = 'humano'
                                  and cv.responsavel_id = v_membro
           end, false)
       and (p_etapas is null or cardinality(p_etapas) = 0 or c.etapa_id = any (p_etapas))
       and (v_de is null or c.primeira_mensagem_em >= v_de)
       and (v_ate is null or c.primeira_mensagem_em < v_ate)
       and (v_q is null and v_digitos is null
            or (v_q is not null and (
                  strpos(public.texto_busca(c.nome), v_q) > 0
                  or strpos(public.texto_busca(c.nome_whatsapp), v_q) > 0
                  or strpos(public.texto_busca(c.empresa), v_q) > 0
                  or strpos(public.texto_busca(c.email), v_q) > 0))
            or (v_digitos is not null and strpos(c.telefone, v_digitos) > 0))
  ),
  numeradas as (
    select b.*,
           row_number() over (order by
             case when v_ordem = 'contato' and v_asc then b.nome_ordem end asc,
             case when v_ordem = 'contato' and not v_asc then b.nome_ordem end desc,
             case when v_ordem = 'etapa' and v_asc then b.etapa_ordem end asc,
             case when v_ordem = 'etapa' and not v_asc then b.etapa_ordem end desc,
             case when v_ordem = 'ultima' and v_asc then b.ultima_mensagem_em end asc nulls last,
             case when v_ordem = 'ultima' and not v_asc then b.ultima_mensagem_em end desc nulls last,
             case when v_ordem = 'entrada' and v_asc then b.entrou_em end asc,
             case when v_ordem = 'entrada' and not v_asc then b.entrou_em end desc,
             b.nome_ordem asc,
             b.id asc
           ) as pos
      from base b
  )
  select (select count(*) from numeradas),
         coalesce((
           select jsonb_agg(jsonb_build_object(
                    'contato_id', n.id,
                    'nome', n.nome,
                    'nome_whatsapp', n.nome_whatsapp,
                    'telefone', n.telefone,
                    'email', n.email,
                    'empresa', n.empresa,
                    'etapa_id', n.etapa_id,
                    'etapa_ordem', n.etapa_ordem,
                    'primeira_mensagem_em', n.primeira_mensagem_em,
                    'criado_em', n.criado_em,
                    'entrou_em', n.entrou_em,
                    'ultima_mensagem_em', n.ultima_mensagem_em,
                    'conversa', case when n.conversa_id is null then null else jsonb_build_object(
                      'id', n.conversa_id,
                      'modo', n.modo,
                      'responsavel_id', n.responsavel_id,
                      'motivo_humano', n.motivo_humano,
                      'aguardando_humano_desde', n.aguardando_humano_desde,
                      'ultima_mensagem_em', n.ultima_mensagem_em,
                      'ultima_do_lead_em', n.ultima_do_lead_em,
                      'ultima_da_janete_em', n.ultima_da_janete_em,
                      'nao_lidas', n.nao_lidas) end
                  ) order by n.pos)
             from numeradas n
            where n.pos > v_desloc and n.pos <= v_desloc + v_limite
         ), '[]'::jsonb)
    into v_total, v_linhas;

  return jsonb_build_object('total', v_total, 'linhas', v_linhas);
end;
$$;


ALTER FUNCTION public.contatos_lista(p_busca text, p_recorte text, p_etapas uuid[], p_entrada_de date, p_entrada_ate date, p_ordem text, p_direcao text, p_limite integer, p_deslocamento integer) OWNER TO postgres;

--
-- Name: contexto_restaurar(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.contexto_restaurar(p_versao bigint) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_eu      uuid;
  v_alvo    public.contexto_versoes%rowtype;
  v_atual   bigint;
  v_numero  int;
  v_id      bigint;
begin
  if not coalesce(public.eh_admin(), false) then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;
  v_eu := public.membro_atual();

  perform pg_advisory_xact_lock(hashtext('janete.contexto'));

  select cv.* into v_alvo from public.contexto_versoes cv where cv.id = p_versao;
  if not found then
    raise exception using message = 'nao_encontrado', errcode = 'P0001';
  end if;

  select cv.id, cv.numero into v_atual, v_numero
    from public.contexto_versoes cv
   order by cv.id desc
   limit 1;
  if v_atual = p_versao then
    return jsonb_build_object('id', v_atual, 'numero', v_numero);
  end if;

  insert into public.contexto_versoes (empresa_oferta, cliente_ideal, preco, diferenciais, objecoes,
                                       quando_passar_humano, tom_voz, horario, itens, origem,
                                       criado_por, restaurada_de)
  values (v_alvo.empresa_oferta, v_alvo.cliente_ideal, v_alvo.preco, v_alvo.diferenciais,
          v_alvo.objecoes, v_alvo.quando_passar_humano, v_alvo.tom_voz, v_alvo.horario,
          v_alvo.itens, 'restauracao', v_eu, v_alvo.id)
  returning id, numero into v_id, v_numero;

  return jsonb_build_object('id', v_id, 'numero', v_numero);
end;
$$;


ALTER FUNCTION public.contexto_restaurar(p_versao bigint) OWNER TO postgres;

--
-- Name: contexto_salvar(bigint, jsonb, public.contexto_origem); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.contexto_salvar(p_base bigint, p_mudancas jsonb, p_origem public.contexto_origem DEFAULT 'edicao'::public.contexto_origem) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  c_campos constant text[] := array['empresa_oferta', 'cliente_ideal', 'preco', 'diferenciais',
                                    'objecoes', 'quando_passar_humano', 'tom_voz', 'horario'];
  c_limite constant int := 2000;
  c_max_itens constant int := 50;
  v_eu      uuid;
  v_origem  public.contexto_origem := coalesce(p_origem, 'edicao');
  v_atual   jsonb;
  v_base    jsonb;
  v_novo    jsonb;
  v_chave   text;
  v_valor   jsonb;
  v_item    jsonb;
  v_itens   jsonb;
  v_id      bigint;
  v_numero  int;
begin
  if not coalesce(public.eh_admin(), false) then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;
  v_eu := public.membro_atual();

  if v_origem = 'restauracao' then
    raise exception using message = 'mudancas_invalidas', errcode = '22023';
  end if;
  if p_mudancas is null or jsonb_typeof(p_mudancas) <> 'object' then
    raise exception using message = 'mudancas_invalidas', errcode = '22023';
  end if;

  -- Formato e tamanho de cada mudança.
  for v_chave, v_valor in select k.key, k.value from jsonb_each(p_mudancas) k loop
    if v_chave = 'itens' then
      if jsonb_typeof(v_valor) <> 'array' then
        raise exception using message = 'mudancas_invalidas', errcode = '22023';
      end if;
      -- novo: no máximo 50 itens livres
      if jsonb_array_length(v_valor) > c_max_itens then
        raise exception using message = 'limite_itens', errcode = 'P0001';
      end if;
      v_itens := '[]'::jsonb;
      for v_item in select e.value from jsonb_array_elements(v_valor) e loop
        if jsonb_typeof(v_item) <> 'object'
           or jsonb_typeof(v_item -> 'pergunta') is distinct from 'string'
           or jsonb_typeof(v_item -> 'resposta') is distinct from 'string' then
          raise exception using message = 'mudancas_invalidas', errcode = '22023';
        end if;
        -- novo: a pergunta passa pelo mesmo limite da resposta
        if char_length(v_item ->> 'pergunta') > c_limite
           or char_length(v_item ->> 'resposta') > c_limite then
          raise exception using message = 'limite_tamanho', errcode = 'P0001';
        end if;
        v_itens := v_itens || jsonb_build_array(jsonb_build_object(
                     'pergunta', v_item ->> 'pergunta', 'resposta', v_item ->> 'resposta'));
      end loop;
    elsif v_chave = any (c_campos) then
      if jsonb_typeof(v_valor) <> 'string' then
        raise exception using message = 'mudancas_invalidas', errcode = '22023';
      end if;
      if char_length(v_valor #>> '{}') > c_limite then
        raise exception using message = 'limite_tamanho', errcode = 'P0001';
      end if;
    else
      raise exception using message = 'mudancas_invalidas', errcode = '22023';
    end if;
  end loop;

  -- Um admin por vez daqui até o insert.
  perform pg_advisory_xact_lock(hashtext('janete.contexto'));

  select to_jsonb(cv) into v_atual
    from public.contexto_versoes cv
   order by cv.id desc
   limit 1;

  if p_base is null then
    if v_atual is not null then
      raise exception using message = 'contexto_mudou', errcode = 'P0001';
    end if;
    v_base := '{}'::jsonb;
  else
    select to_jsonb(cv) into v_base from public.contexto_versoes cv where cv.id = p_base;
    if v_base is null then
      raise exception using message = 'nao_encontrado', errcode = 'P0001';
    end if;
  end if;

  -- Junta: parte da atual (ou do vazio) e põe por cima o que mudou.
  v_novo := jsonb_build_object('itens', coalesce(v_atual -> 'itens', '[]'::jsonb));
  foreach v_chave in array c_campos loop
    v_novo := v_novo || jsonb_build_object(v_chave, coalesce(v_atual ->> v_chave, ''));
  end loop;

  for v_chave, v_valor in select k.key, k.value from jsonb_each(p_mudancas) k loop
    if v_chave = 'itens' then
      v_valor := v_itens;
    end if;
    -- igual ao que a tela abriu: não é mudança
    if p_base is not null and v_valor = (v_base -> v_chave) then
      continue;
    end if;
    -- mudou também entre a base e a atual: outro admin mexeu no mesmo campo
    if p_base is not null and (v_base -> v_chave) is distinct from (v_atual -> v_chave) then
      raise exception using message = 'contexto_mudou', errcode = 'P0001';
    end if;
    v_novo := v_novo || jsonb_build_object(v_chave, v_valor);
  end loop;

  -- Nada diferente da atual: não grava versão nova.
  if v_atual is not null
     and v_novo = (select jsonb_object_agg(k.key, k.value)
                     from jsonb_each(v_atual) k
                    where k.key = any (c_campos) or k.key = 'itens') then
    return jsonb_build_object('id', (v_atual ->> 'id')::bigint, 'numero', (v_atual ->> 'numero')::int);
  end if;

  insert into public.contexto_versoes (empresa_oferta, cliente_ideal, preco, diferenciais, objecoes,
                                       quando_passar_humano, tom_voz, horario, itens, origem, criado_por)
  values (v_novo ->> 'empresa_oferta', v_novo ->> 'cliente_ideal', v_novo ->> 'preco',
          v_novo ->> 'diferenciais', v_novo ->> 'objecoes', v_novo ->> 'quando_passar_humano',
          v_novo ->> 'tom_voz', v_novo ->> 'horario', v_novo -> 'itens', v_origem, v_eu)
  returning id, numero into v_id, v_numero;

  return jsonb_build_object('id', v_id, 'numero', v_numero);
end;
$$;


ALTER FUNCTION public.contexto_salvar(p_base bigint, p_mudancas jsonb, p_origem public.contexto_origem) OWNER TO postgres;

--
-- Name: conversa_do_contato(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.conversa_do_contato(p_contato uuid, p_conexao uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_conv uuid;
begin
  insert into public.conversas (contato_id, conexao_id)
  values (p_contato, p_conexao)
  on conflict (contato_id) do nothing
  returning id into v_conv;

  if v_conv is null then
    select c.id into v_conv from public.conversas c where c.contato_id = p_contato;
  end if;
  return v_conv;
end;
$$;


ALTER FUNCTION public.conversa_do_contato(p_contato uuid, p_conexao uuid) OWNER TO postgres;

--
-- Name: custo_das_conversas(uuid[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.custo_das_conversas(p_conversas uuid[]) RETURNS TABLE(conversa_id uuid, custo_usd numeric)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
#variable_conflict use_column
begin
  if not coalesce(public.eh_admin(), false) then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;
  if p_conversas is null or cardinality(p_conversas) = 0 then
    return;
  end if;
  if cardinality(p_conversas) > 200 then
    raise exception using message = 'parametro_invalido', errcode = '22023', detail = 'p_conversas';
  end if;
  return query
  select cv.id, coalesce(sum(k.custo_usd), 0)::numeric
    from public.conversas cv
    left join (
      select coalesce(ch.conversa_id, r.conversa_id) as conversa_id, ch.custo_usd
        from public.ia_chamadas ch
        left join public.rodadas r on r.id = ch.rodada_id
       where coalesce(ch.conversa_id, r.conversa_id) = any (p_conversas)
    ) k on k.conversa_id = cv.id
   where cv.id = any (p_conversas)
   group by cv.id;
end;
$$;


ALTER FUNCTION public.custo_das_conversas(p_conversas uuid[]) OWNER TO postgres;

--
-- Name: dashboard(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.dashboard(p_inicio date, p_fim date) RETURNS jsonb
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_admin boolean;
  v_de timestamptz;
  v_ate timestamptz;
  v_custo numeric;
  v_sem_preco bigint;
  v_res jsonb;
begin
  if not coalesce(public.eh_membro(), false) then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;

  v_admin := coalesce(public.eh_admin(), false);

  -- Meia-noite de São Paulo do primeiro dia e do dia seguinte ao último.
  v_de  := p_inicio::timestamp at time zone 'America/Sao_Paulo';
  v_ate := (p_fim + 1)::timestamp at time zone 'America/Sao_Paulo';

  with coorte as (
    select c.id, c.etapa_id, c.primeira_mensagem_em
    from public.contatos c
    where c.primeira_mensagem_em >= v_de
      and c.primeira_mensagem_em <  v_ate
  ),
  -- Etapas por onde cada contato da coorte passou: destino e origem do histórico
  -- e a etapa atual (a atual entra para não depender só do histórico).
  passagens as (
    select h.contato_id, h.para_etapa_id as etapa_id
    from public.contato_etapa_historico h
    join coorte k on k.id = h.contato_id
    where h.para_etapa_id is not null
    union
    select h.contato_id, h.de_etapa_id
    from public.contato_etapa_historico h
    join coorte k on k.id = h.contato_id
    where h.de_etapa_id is not null
    union
    select k.id, k.etapa_id
    from coorte k
    where k.etapa_id is not null
  ),
  resumo as (
    select p.contato_id,
           max(e.ordem) filter (where e.tipo <> 'perdido') as max_ordem_nao_perdida,
           array_agg(p.etapa_id) as etapas
    from passagens p
    join public.etapas e on e.id = p.etapa_id
    group by p.contato_id
  ),
  funil as (
    select e.id, e.nome, e.ordem, e.tipo,
           count(r.contato_id) as chegaram
    from public.etapas e
    left join resumo r
      on r.max_ordem_nao_perdida > e.ordem
      or e.id = any (r.etapas)
    where not e.arquivada
    group by e.id, e.nome, e.ordem, e.tipo
  ),
  primeiras_respostas as (
    select k.id,
           extract(epoch from (min(m.momento) - k.primeira_mensagem_em)) as segundos
    from coorte k
    join public.conversas cv on cv.contato_id = k.id
    join public.mensagens m on m.conversa_id = cv.id
    where m.direcao = 'saida'
      and m.status in ('enviada', 'entregue', 'lida')
      and m.momento >= k.primeira_mensagem_em
    group by k.id, k.primeira_mensagem_em
  )
  select jsonb_build_object(
    'leads_novos', (select count(*) from coorte),
    'funil', coalesce(
      (select jsonb_agg(
                jsonb_build_object(
                  'etapa_id', f.id,
                  'nome', f.nome,
                  'ordem', f.ordem,
                  'tipo', f.tipo,
                  'chegaram', f.chegaram
                )
                order by f.ordem, f.nome, f.id
              )
       from funil f),
      '[]'::jsonb),
    'ganhos', (select count(*)
               from coorte k
               join public.etapas e on e.id = k.etapa_id
               where e.tipo = 'ganho'),
    'perdidos', (select count(*)
                 from coorte k
                 join public.etapas e on e.id = k.etapa_id
                 where e.tipo = 'perdido'),
    'mediana_primeira_resposta_s', (select (percentile_cont(0.5) within group (order by pr.segundos))::numeric
                                    from primeiras_respostas pr),
    'passados_para_humano', (select count(*)
                             from coorte k
                             where exists (
                               select 1
                               from public.conversas cv
                               join public.rodadas r on r.conversa_id = cv.id
                               where cv.contato_id = k.id
                                 and r.passou_humano
                             )),
    'aguardando_agora', (select count(*)
                         from public.conversas cv
                         where cv.aguardando_humano_desde is not null)
  )
  into v_res;

  if v_admin then
    select coalesce(sum(ch.custo_usd), 0),
           count(*) filter (where ch.custo_origem = 'sem_preco')
    into v_custo, v_sem_preco
    from public.ia_chamadas ch
    where ch.criado_em >= v_de
      and ch.criado_em <  v_ate;

    v_res := v_res || jsonb_build_object('custo_usd', v_custo, 'chamadas_sem_preco', v_sem_preco);
  else
    v_res := v_res || jsonb_build_object('custo_usd', null, 'chamadas_sem_preco', null);
  end if;

  return v_res;
end;
$$;


ALTER FUNCTION public.dashboard(p_inicio date, p_fim date) OWNER TO postgres;

--
-- Name: dashboard_agora(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.dashboard_agora() RETURNS jsonb
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_res jsonb;
  v_ultima_janete timestamptz;
begin
  if not coalesce(public.eh_membro(), false) then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;

  select max(cv.ultima_da_janete_em) into v_ultima_janete from public.conversas cv;
  if v_ultima_janete is null then
    select max(m.momento) into v_ultima_janete
      from public.mensagens m
     where m.origem = 'janete' and m.status in ('enviada', 'entregue', 'lida');
  end if;

  with cv as (
    select c.id, c.contato_id, c.modo, c.responsavel_id, c.aguardando_humano_desde, c.motivo_humano,
           c.nao_lidas, c.ultima_do_lead_em, c.ultima_mensagem_em,
           ct.nome, ct.nome_whatsapp, ct.telefone, et.tipo as etapa_tipo,
           (c.modo = 'humano' and c.responsavel_id is null and c.aguardando_humano_desde is not null) as aguardando
      from public.conversas c
      join public.contatos ct on ct.id = c.contato_id
      left join public.etapas et on et.id = ct.etapa_id
  ),
  ativas as (
    select cv.id, cv.contato_id, cv.nome, cv.nome_whatsapp, cv.telefone,
           (select max(r.iniciada_em) from public.rodadas r where r.conversa_id = cv.id and r.status = 'rodando') as rodando_desde
      from cv
     where cv.modo = 'janete'
       and (cv.etapa_tipo is null or cv.etapa_tipo = 'aberta')
  ),
  ativas_agora as (
    select a.*
      from ativas a
     where a.rodando_desde is not null
        or exists (select 1 from public.mensagens m
                    where m.conversa_id = a.id
                      and m.origem in ('janete', 'lead')
                      and m.status not in ('cancelada', 'falhou')
                      and m.momento >= now() - interval '5 minutes')
  ),
  ve as (
    select e.id, e.nome, e.tipo, e.ordem from public.etapas e where not e.arquivada
  ),
  leads as (
    select ct.id, ct.etapa_id, ct.nome, ct.nome_whatsapp, ct.telefone, ct.etapa_desde,
           c.id as conversa_id,
           now() - coalesce(c.ultima_do_lead_em, ct.primeira_mensagem_em, ct.criado_em) > interval '7 days' as parado
      from public.contatos ct
      left join public.conversas c on c.contato_id = ct.id
  )
  select jsonb_build_object(
    'aguardando', jsonb_build_object(
      'total', (select count(*) from cv where cv.aguardando),
      'maisAntigaDesde', (select min(cv.aguardando_humano_desde) from cv where cv.aguardando),
      'itens', coalesce((select jsonb_agg(jsonb_build_object(
                                  'conversaId', cv.id, 'contatoId', cv.contato_id,
                                  'nome', cv.nome, 'nomeWhatsapp', cv.nome_whatsapp, 'telefone', cv.telefone,
                                  'motivo', cv.motivo_humano, 'aguardandoDesde', cv.aguardando_humano_desde)
                                order by cv.aguardando_humano_desde, cv.id)
                           from cv where cv.aguardando), '[]'::jsonb)),
    'naoLidas', jsonb_build_object(
      'conversas', (select count(*) from cv where cv.nao_lidas > 0),
      'mensagens', (select coalesce(sum(cv.nao_lidas), 0) from cv)),
    'comQuem', jsonb_build_object(
      'janete', (select count(*) from cv where cv.modo = 'janete'),
      'membros', coalesce((select jsonb_agg(jsonb_build_object('membroId', x.id, 'nome', x.nome, 'n', x.n)
                                            order by x.n desc, x.nome, x.id)
                             from (select m.id, m.nome, count(*) as n
                                     from cv join public.membros m on m.id = cv.responsavel_id
                                    where cv.modo = 'humano'
                                    group by m.id, m.nome) x), '[]'::jsonb),
      'celular', (select count(*) from cv
                   where cv.modo = 'humano' and cv.responsavel_id is null and cv.aguardando_humano_desde is null)),
    'janeteAtiva', jsonb_build_object(
      'conversas', (select count(*) from ativas_agora),
      'digitando', (select jsonb_build_object('contatoId', a.contato_id, 'nome', a.nome,
                                              'nomeWhatsapp', a.nome_whatsapp, 'telefone', a.telefone)
                      from ativas a
                     where a.rodando_desde is not null
                     order by a.rodando_desde desc, a.id
                     limit 1)),
    'kanban', coalesce((select jsonb_agg(jsonb_build_object(
                                 'etapaId', ve.id, 'nome', ve.nome, 'tipo', ve.tipo,
                                 'n', (select count(*) from public.contatos ct where ct.etapa_id = ve.id))
                               order by ve.ordem, ve.nome, ve.id)
                          from ve), '[]'::jsonb),
    'esfriando', (select count(*) from cv
                   where not cv.aguardando
                     and cv.etapa_tipo = 'aberta'
                     and cv.ultima_do_lead_em is not null
                     and cv.ultima_mensagem_em > cv.ultima_do_lead_em
                     and now() - cv.ultima_do_lead_em >= interval '24 hours'),
    'porEtapa', coalesce((select jsonb_agg(jsonb_build_object(
                                   'etapaId', ve.id,
                                   'paradosMais7d', case when ve.tipo = 'aberta'
                                                         then (select count(*) from leads l where l.etapa_id = ve.id and l.parado)
                                                         else 0 end,
                                   'leads', coalesce((select jsonb_agg(jsonb_build_object(
                                                               'contatoId', y.id, 'conversaId', y.conversa_id,
                                                               'nome', y.nome, 'nomeWhatsapp', y.nome_whatsapp,
                                                               'telefone', y.telefone, 'etapaDesde', y.etapa_desde)
                                                             order by y.etapa_desde, y.id)
                                                        from (select l.* from leads l
                                                               where l.etapa_id = ve.id
                                                               order by l.etapa_desde, l.id
                                                               limit 5) y), '[]'::jsonb))
                                 order by ve.ordem, ve.nome, ve.id)
                            from ve), '[]'::jsonb),
    'ultimaRecebidaEm', (select max(cv.ultima_do_lead_em) from cv),
    'ultimaDaJaneteEm', v_ultima_janete
  )
  into v_res;

  return v_res;
end;
$$;


ALTER FUNCTION public.dashboard_agora() OWNER TO postgres;

--
-- Name: dashboard_custo(timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.dashboard_custo(p_de timestamp with time zone, p_ate timestamp with time zone) RETURNS jsonb
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_res jsonb;
  v_resposta numeric;
  v_no_funil numeric;
  v_conv bigint;
begin
  if not coalesce(public.eh_admin(), false) then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;
  if p_de is null or p_ate is null or p_ate <= p_de or p_ate - p_de > interval '367 days' then
    raise exception using message = 'periodo_invalido', errcode = 'P0001';
  end if;

  with ch as (
    select x.tipo, x.provedor, x.modelo, x.custo_usd, x.custo_origem
      from public.ia_chamadas x
     where x.criado_em >= p_de and x.criado_em < p_ate
  )
  select jsonb_build_object(
           'total', coalesce((select sum(ch.custo_usd) from ch), 0),
           'porTipo', jsonb_build_object(
             'resposta', coalesce((select sum(ch.custo_usd) from ch where ch.tipo = 'resposta'), 0),
             'transcricao', coalesce((select sum(ch.custo_usd) from ch where ch.tipo = 'transcricao'), 0),
             'onboarding', coalesce((select sum(ch.custo_usd) from ch where ch.tipo = 'onboarding'), 0),
             'fala', coalesce((select sum(ch.custo_usd) from ch where ch.tipo::text = 'fala'), 0)),
           'semPreco', (select count(*) from ch where ch.custo_origem = 'sem_preco'),
           'porModelo', coalesce((
             select jsonb_agg(jsonb_build_object('provedor', pm.provedor, 'modelo', pm.modelo, 'usd', pm.usd)
                              order by pm.usd desc, pm.provedor, pm.modelo)
               from (select ch.provedor::text as provedor, ch.modelo, sum(ch.custo_usd) as usd
                       from ch
                      group by ch.provedor, ch.modelo
                     having coalesce(sum(ch.custo_usd), 0) > 0) pm), '[]'::jsonb))
    into v_res;

  v_resposta := (v_res -> 'porTipo' ->> 'resposta')::numeric;

  select count(distinct m.conversa_id) into v_conv
    from public.mensagens m
   where m.origem = 'janete' and m.status in ('enviada', 'entregue', 'lida')
     and m.momento >= p_de and m.momento < p_ate;

  select coalesce(sum(ce.usd), 0) into v_no_funil
    from public.dashboard_custo_por_etapa(p_de, p_ate, now()) ce
    join public.etapas e on e.id = ce.etapa_id
   where not e.arquivada and e.tipo in ('aberta', 'ganho');

  return v_res || jsonb_build_object(
    'conversasComJanete', v_conv,
    'porConversaUsd', case when v_conv > 0 then round(v_resposta / v_conv, 6) end,
    'foraDaCoorteUsd', v_resposta - v_no_funil
  );
end;
$$;


ALTER FUNCTION public.dashboard_custo(p_de timestamp with time zone, p_ate timestamp with time zone) OWNER TO postgres;

--
-- Name: dashboard_custo_por_etapa(timestamp with time zone, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.dashboard_custo_por_etapa(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) RETURNS TABLE(etapa_id uuid, usd numeric)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select public.dashboard_etapa_em(c.id, ch.criado_em) as etapa_id,
         sum(ch.custo_usd) as usd
    from public.ia_chamadas ch
    left join public.rodadas r on r.id = ch.rodada_id
    join public.conversas cv on cv.id = coalesce(ch.conversa_id, r.conversa_id)
    join public.contatos c on c.id = cv.contato_id
   where ch.tipo = 'resposta'
     and ch.custo_usd is not null
     and ch.criado_em >= p_de and ch.criado_em < p_ate and ch.criado_em <= p_estado_em
     and c.primeira_mensagem_em >= p_de and c.primeira_mensagem_em < p_ate
     and c.primeira_mensagem_em <= p_estado_em
   group by 1
$$;


ALTER FUNCTION public.dashboard_custo_por_etapa(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) OWNER TO postgres;

--
-- Name: dashboard_etapa_em(uuid, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.dashboard_etapa_em(p_contato uuid, p_instante timestamp with time zone) RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select coalesce(
    (select h.para_etapa_id
       from public.contato_etapa_historico h
      where h.contato_id = p_contato and h.criado_em <= p_instante
      order by h.criado_em desc, h.id desc
      limit 1),
    (select coalesce(h.de_etapa_id, h.para_etapa_id)
       from public.contato_etapa_historico h
      where h.contato_id = p_contato
      order by h.criado_em, h.id
      limit 1),
    (select c.etapa_id from public.contatos c where c.id = p_contato)
  )
$$;


ALTER FUNCTION public.dashboard_etapa_em(p_contato uuid, p_instante timestamp with time zone) OWNER TO postgres;

--
-- Name: dashboard_funil(timestamp with time zone, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.dashboard_funil(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) RETURNS jsonb
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_admin boolean;
  v_estado timestamptz;
  v_d0 date;
  v_d1 date;
  v_res jsonb;
begin
  if not coalesce(public.eh_membro(), false) then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;
  if p_de is null or p_ate is null or p_ate <= p_de or p_ate - p_de > interval '367 days' then
    raise exception using message = 'periodo_invalido', errcode = 'P0001';
  end if;

  v_admin := coalesce(public.eh_admin(), false);
  v_estado := coalesce(p_estado_em, now());
  v_d0 := (p_de at time zone 'America/Sao_Paulo')::date;
  v_d1 := ((p_ate - interval '1 microsecond') at time zone 'America/Sao_Paulo')::date;

  with fe as (
    select e.id, e.nome, e.ordem, e.tipo, e.janete_pode_mover,
           row_number() over (order by e.ordem, e.nome, e.id) as pos
      from public.etapas e
     where not e.arquivada and e.tipo in ('aberta', 'ganho')
  ),
  k as (
    select c.id, c.primeira_mensagem_em as t0
      from public.contatos c
     where c.primeira_mensagem_em >= p_de and c.primeira_mensagem_em < p_ate
       and c.primeira_mensagem_em <= v_estado
  ),
  h as (
    select hh.id, hh.contato_id, hh.de_etapa_id, hh.para_etapa_id, hh.ator, hh.criado_em
      from public.contato_etapa_historico hh
      join k on k.id = hh.contato_id
     where hh.criado_em <= v_estado
  ),
  em as (
    select k.id, k.t0, public.dashboard_etapa_em(k.id, v_estado) as etapa_id from k
  ),
  vis as (
    select h.contato_id, h.para_etapa_id as etapa_id from h
    union
    select h.contato_id, h.de_etapa_id from h where h.de_etapa_id is not null
    union
    select em.id, em.etapa_id from em
  ),
  pc as (
    select em.id, em.t0, em.etapa_id, et.tipo as tipo_em,
           (select max(fe.pos) from vis join fe on fe.id = vis.etapa_id where vis.contato_id = em.id) as alcance,
           v_estado - coalesce(
             (select max(m.momento)
                from public.conversas cv
                join public.mensagens m on m.conversa_id = cv.id
               where cv.contato_id = em.id and m.direcao = 'entrada' and m.momento <= v_estado),
             em.t0) > interval '7 days' as calado
      from em
      left join public.etapas et on et.id = em.etapa_id
  ),
  est as (
    select h.contato_id, h.para_etapa_id as etapa_id, h.criado_em as ini,
           lead(h.criado_em) over (partition by h.contato_id order by h.criado_em, h.id) as fim,
           row_number() over (partition by h.contato_id, h.para_etapa_id order by h.criado_em, h.id) as n
      from h
  ),
  tempos as (
    select est.etapa_id,
           percentile_cont(0.5) within group (order by extract(epoch from (est.fim - est.ini))::float8 / 3600) as med
      from est
     where est.n = 1 and est.fim is not null
     group by est.etapa_id
  ),
  entradas as (
    select est.etapa_id, (est.ini at time zone 'America/Sao_Paulo')::date as dia, count(*) as n
      from est
     where est.n = 1 and est.ini >= p_de and est.ini < p_ate
     group by 1, 2
  ),
  dias as (
    select d::date as dia from generate_series(v_d0, v_d1, interval '1 day') d
  ),
  msgs as (
    select public.dashboard_etapa_em(k.id, m.momento) as etapa_id,
           count(*) filter (where m.direcao = 'entrada') as recebidas,
           count(*) filter (where m.direcao = 'saida') as enviadas
      from k
      join public.conversas cv on cv.contato_id = k.id
      join public.mensagens m on m.conversa_id = cv.id
     where m.momento >= p_de and m.momento < p_ate and m.momento <= v_estado
       and (m.direcao = 'entrada' or m.status in ('enviada', 'entregue', 'lida'))
     group by 1
  ),
  pas as (
    select public.dashboard_etapa_em(k.id, e.criado_em) as etapa_id, count(*) as n
      from k
      join public.conversas cv on cv.contato_id = k.id
      join public.conversa_eventos e on e.conversa_id = cv.id
     where e.tipo = 'passou' and e.criado_em >= p_de and e.criado_em < p_ate and e.criado_em <= v_estado
     group by 1
  ),
  mov as (
    select f.id as etapa_id,
           count(*) filter (where x.ator = 'janete') as janete,
           count(*) filter (where x.ator is distinct from 'janete') as equipe
      from fe f
      join pc on pc.alcance > f.pos
      left join lateral (
        select hh.ator
          from h hh
          join fe f2 on f2.id = hh.para_etapa_id
         where hh.contato_id = pc.id and f2.pos > f.pos
         order by hh.criado_em, hh.id
         limit 1
      ) x on true
     where f.tipo = 'aberta'
     group by f.id
  ),
  custo as (
    select ce.etapa_id, ce.usd
      from public.dashboard_custo_por_etapa(p_de, p_ate, v_estado) ce
     where v_admin
  ),
  ciclo as (
    select percentile_cont(0.5) within group (order by extract(epoch from (g.t - pc.t0))::float8 / 86400) as med
      from pc
      join lateral (
        select min(hh.criado_em) as t
          from h hh
          join public.etapas e on e.id = hh.para_etapa_id
         where hh.contato_id = pc.id and e.tipo = 'ganho'
      ) g on true
     where pc.tipo_em = 'ganho' and g.t is not null
  ),
  linhas as (
    select f.pos,
           f.tipo,
           f.id,
           (select count(*) from pc where pc.alcance >= f.pos) as chegaram,
           case when f.tipo = 'aberta' then (select count(*) from pc where pc.alcance > f.pos) else 0 end as avancaram,
           case when f.tipo = 'aberta'
                then (select count(*) from pc where pc.alcance = f.pos and pc.tipo_em = 'perdido') else 0 end as perdido,
           case when f.tipo = 'aberta'
                then (select count(*) from pc where pc.alcance = f.pos and pc.tipo_em = 'aberta' and pc.calado) else 0 end as sem_resposta,
           case when f.tipo = 'aberta'
                then (select count(*) from pc
                       where pc.alcance = f.pos
                         and pc.tipo_em is distinct from 'perdido'
                         and not (pc.tipo_em = 'aberta' and pc.calado))
                else (select count(*) from pc where pc.etapa_id = f.id) end as ainda
      from fe f
  )
  select jsonb_build_object(
           'leadsNovos', (select count(*) from k),
           'ganhos', (select count(*) from pc where pc.tipo_em = 'ganho'),
           'cicloMedianoDias', (select round(c.med::numeric, 1) from ciclo c),
           'etapas', coalesce((
             select jsonb_agg(jsonb_build_object(
                      'etapaId', f.id,
                      'nome', f.nome,
                      'ordem', f.ordem,
                      'tipo', f.tipo,
                      'janetePodeMover', f.janete_pode_mover,
                      'chegaram', l.chegaram,
                      'avancaram', l.avancaram,
                      'aindaEstao', l.ainda,
                      'abandonaram', jsonb_build_object('total', l.perdido + l.sem_resposta,
                                                        'perdido', l.perdido,
                                                        'semResposta', l.sem_resposta),
                      'tempoMedianoH', case when f.tipo = 'aberta'
                                            then (select round(t.med::numeric, 1) from tempos t where t.etapa_id = f.id) end,
                      'custoUsd', case when v_admin
                                       then coalesce((select c.usd from custo c where c.etapa_id = f.id), 0) end,
                      'mensagens', jsonb_build_object(
                                     'recebidas', coalesce((select ms.recebidas from msgs ms where ms.etapa_id = f.id), 0),
                                     'enviadas', coalesce((select ms.enviadas from msgs ms where ms.etapa_id = f.id), 0)),
                      'movimentos', jsonb_build_object(
                                      'janete', coalesce((select mv.janete from mov mv where mv.etapa_id = f.id), 0),
                                      'equipe', coalesce((select mv.equipe from mov mv where mv.etapa_id = f.id), 0)),
                      'passadosParaEquipe', coalesce((select p.n from pas p where p.etapa_id = f.id), 0),
                      'entradasPorDia', (select jsonb_agg(jsonb_build_object('dia', to_char(d.dia, 'YYYY-MM-DD'),
                                                                             'valor', coalesce(en.n, 0)) order by d.dia)
                                           from dias d
                                           left join entradas en on en.etapa_id = f.id and en.dia = d.dia))
                    order by f.pos)
               from fe f
               join linhas l on l.id = f.id), '[]'::jsonb))
    into v_res;

  return v_res;
end;
$$;


ALTER FUNCTION public.dashboard_funil(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) OWNER TO postgres;

--
-- Name: dashboard_periodo(timestamp with time zone, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.dashboard_periodo(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) RETURNS jsonb
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_admin boolean;
  v_estado timestamptz;
  v_d0 date;
  v_d1 date;
  v_msg jsonb;
  v_resp jsonb;
  v_coorte jsonb;
  v_pass jsonb;
  v_custo jsonb;
  v_conversas bigint;
  v_autonomas bigint;
begin
  if not coalesce(public.eh_membro(), false) then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;
  if p_de is null or p_ate is null or p_ate <= p_de or p_ate - p_de > interval '367 days' then
    raise exception using message = 'periodo_invalido', errcode = 'P0001';
  end if;

  v_admin := coalesce(public.eh_admin(), false);
  v_estado := coalesce(p_estado_em, now());
  v_d0 := (p_de at time zone 'America/Sao_Paulo')::date;
  v_d1 := ((p_ate - interval '1 microsecond') at time zone 'America/Sao_Paulo')::date;

  -- 1. Mensagens: contagens, origem, autonomia e as séries por dia.
  with msg as (
    select m.conversa_id, m.direcao, m.origem, m.status,
           (m.momento at time zone 'America/Sao_Paulo')::date as dia,
           (m.direcao = 'saida' and m.status in ('enviada', 'entregue', 'lida')) as saiu
      from public.mensagens m
     where m.momento >= p_de and m.momento < p_ate
  ),
  conv as (
    select x.conversa_id,
           bool_or(x.direcao = 'entrada' or x.saiu) as conta,
           bool_or(x.origem in ('humano_tela', 'humano_celular') and x.status <> 'cancelada') as humano
      from msg x
     group by x.conversa_id
  ),
  passou as (
    -- passagem: a Janete passou ou alguém assumiu (pelo botão ou mandando mensagem)
    select distinct e.conversa_id
      from public.conversa_eventos e
     where e.tipo in ('passou', 'assumiu') and e.criado_em >= p_de and e.criado_em < p_ate
  ),
  dias as (
    select d::date as dia from generate_series(v_d0, v_d1, interval '1 day') d
  ),
  por_dia as (
    select x.dia,
           count(distinct x.conversa_id) filter (where x.direcao = 'entrada' or x.saiu) as conversas,
           count(*) filter (where x.direcao = 'entrada') as recebidas,
           count(*) filter (where x.saiu) as enviadas
      from msg x
     group by x.dia
  )
  select jsonb_build_object(
           'conversas', (select count(*) from conv c where c.conta),
           'conversasAutonomas', (select count(*) from conv c
                                   where c.conta and not c.humano
                                     and not exists (select 1 from passou p where p.conversa_id = c.conversa_id)),
           'recebidas', (select count(*) from msg x where x.direcao = 'entrada'),
           'enviadas', (select count(*) from msg x where x.saiu),
           'enviadasPorOrigem', jsonb_build_object(
             'janete', (select count(*) from msg x where x.saiu and x.origem = 'janete'),
             'humano_tela', (select count(*) from msg x where x.saiu and x.origem = 'humano_tela'),
             'humano_celular', (select count(*) from msg x where x.saiu and x.origem = 'humano_celular')),
           'series', jsonb_build_object(
             'conversas', (select jsonb_agg(jsonb_build_object('dia', to_char(d.dia, 'YYYY-MM-DD'), 'valor', coalesce(p.conversas, 0)) order by d.dia)
                             from dias d left join por_dia p on p.dia = d.dia),
             'recebidas', (select jsonb_agg(jsonb_build_object('dia', to_char(d.dia, 'YYYY-MM-DD'), 'valor', coalesce(p.recebidas, 0)) order by d.dia)
                             from dias d left join por_dia p on p.dia = d.dia),
             'enviadas', (select jsonb_agg(jsonb_build_object('dia', to_char(d.dia, 'YYYY-MM-DD'), 'valor', coalesce(p.enviadas, 0)) order by d.dia)
                            from dias d left join por_dia p on p.dia = d.dia)))
    into v_msg;

  v_conversas := (v_msg ->> 'conversas')::bigint;
  v_autonomas := (v_msg ->> 'conversasAutonomas')::bigint;

  -- 2. Respostas da Janete: por rodada, a 1ª bolha que saiu (na janela) menos a
  --    última mensagem do lead que a rodada leu (ou, sem ela, a última do lead
  --    antes da bolha). Mediana, p90 (posição mais próxima) e a mediana por dia.
  with bolhas as (
    select m.rodada_id, min(m.momento) as t
      from public.mensagens m
     where m.origem = 'janete' and m.status in ('enviada', 'entregue', 'lida')
       and m.rodada_id in (select m2.rodada_id
                             from public.mensagens m2
                            where m2.origem = 'janete' and m2.status in ('enviada', 'entregue', 'lida')
                              and m2.momento >= p_de and m2.momento < p_ate)
     group by m.rodada_id
  ),
  resp as (
    select b.t, (b.t at time zone 'America/Sao_Paulo')::date as dia,
           extract(epoch from (b.t - coalesce(
             (select max(e.momento) from public.mensagens e
               where e.rodada_id = b.rodada_id and e.direcao = 'entrada' and e.momento <= b.t),
             (select max(e.momento) from public.mensagens e
                join public.rodadas r on r.id = b.rodada_id
               where e.conversa_id = r.conversa_id and e.direcao = 'entrada' and e.momento <= b.t))))::float8 as s
      from bolhas b
     where b.t >= p_de and b.t < p_ate
  ),
  validas as (
    select r.dia, r.s from resp r where r.s is not null and r.s >= 0
  ),
  dias as (
    select d::date as dia from generate_series(v_d0, v_d1, interval '1 day') d
  ),
  med_dia as (
    select v.dia, percentile_cont(0.5) within group (order by v.s) as med from validas v group by v.dia
  )
  select jsonb_build_object(
           'respostaJaneteS', (select round((percentile_cont(0.5) within group (order by v.s))::numeric)::bigint from validas v),
           'respostaJaneteP90S', (select round((percentile_disc(0.9) within group (order by v.s))::numeric)::bigint from validas v),
           'serie', (select jsonb_agg(jsonb_build_object('dia', to_char(d.dia, 'YYYY-MM-DD'),
                                                         'valor', coalesce(round(md.med::numeric)::bigint, 0)) order by d.dia)
                       from dias d left join med_dia md on md.dia = d.dia))
    into v_resp;

  -- 3. Coorte: leads novos e a 1ª resposta (de qualquer origem, que saiu até p_estado_em).
  with coorte as (
    select c.id, c.primeira_mensagem_em as t0
      from public.contatos c
     where c.primeira_mensagem_em >= p_de and c.primeira_mensagem_em < p_ate
  ),
  primeiras as (
    select k.id,
           (select extract(epoch from (min(m.momento) - k.t0))::float8
              from public.conversas cv
              join public.mensagens m on m.conversa_id = cv.id
             where cv.contato_id = k.id
               and m.direcao = 'saida' and m.status in ('enviada', 'entregue', 'lida')
               and m.momento >= k.t0 and m.momento <= v_estado) as s
      from coorte k
  )
  select jsonb_build_object(
           'leadsNovos', (select count(*) from coorte),
           'primeiraRespostaS', (select round((percentile_cont(0.5) within group (order by p.s))::numeric)::bigint
                                   from primeiras p where p.s is not null))
    into v_coorte;

  -- 4. Passados para a equipe (9a): as passagens da janela, decisão × falha.
  --    novo: envio_falhou entra nas duas listas de falha.
  with ev as (
    select e.motivo
      from public.conversa_eventos e
     where e.tipo = 'passou' and e.criado_em >= p_de and e.criado_em < p_ate
  )
  select jsonb_build_object(
           'falha', (select count(*) from ev
                      where ev.motivo in ('chave_invalida', 'sem_credito', 'audio_sem_transcricao', 'limite_passos', 'erro_provedor', 'envio_falhou')),
           'janetePassou', (select count(*) from ev
                           where ev.motivo is null
                              or ev.motivo not in ('chave_invalida', 'sem_credito', 'audio_sem_transcricao', 'limite_passos', 'erro_provedor', 'envio_falhou')),
           'porMotivo', coalesce((select jsonb_object_agg(x.motivo, x.n)
                                    from (select ev.motivo::text as motivo, count(*) as n
                                            from ev where ev.motivo is not null group by ev.motivo) x), '{}'::jsonb))
    into v_pass;

  -- 5. Custo por dia (só o admin): todas as chamadas com preço, pela data do gasto.
  if v_admin then
    with dias as (
      select d::date as dia from generate_series(v_d0, v_d1, interval '1 day') d
    ),
    por_dia as (
      select (ch.criado_em at time zone 'America/Sao_Paulo')::date as dia, sum(ch.custo_usd) as usd
        from public.ia_chamadas ch
       where ch.criado_em >= p_de and ch.criado_em < p_ate and ch.custo_usd is not null
       group by 1
    )
    select jsonb_agg(jsonb_build_object('dia', to_char(d.dia, 'YYYY-MM-DD'), 'valor', coalesce(p.usd, 0)) order by d.dia)
      into v_custo
      from dias d left join por_dia p on p.dia = d.dia;
  else
    v_custo := null;
  end if;

  return jsonb_build_object(
    'conversas', v_conversas,
    'leadsNovos', (v_coorte -> 'leadsNovos'),
    'recebidas', (v_msg -> 'recebidas'),
    'enviadas', (v_msg -> 'enviadas'),
    'enviadasPorOrigem', (v_msg -> 'enviadasPorOrigem'),
    'primeiraRespostaS', (v_coorte -> 'primeiraRespostaS'),
    'respostaJaneteS', (v_resp -> 'respostaJaneteS'),
    'respostaJaneteP90S', (v_resp -> 'respostaJaneteP90S'),
    'conversasAutonomas', v_autonomas,
    'autonomiaPct', case when v_conversas > 0 then round(v_autonomas * 100.0 / v_conversas, 1) end,
    'passados', v_pass,
    'series', (v_msg -> 'series')
                || jsonb_build_object('respostaJaneteS', v_resp -> 'serie', 'custoUsd', v_custo)
  );
end;
$$;


ALTER FUNCTION public.dashboard_periodo(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) OWNER TO postgres;

--
-- Name: dashboard_problemas(timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.dashboard_problemas(p_de timestamp with time zone, p_ate timestamp with time zone) RETURNS jsonb
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_corte timestamptz;
  v_ia jsonb;
  v_envio jsonb;
  v_midia jsonb;
  v_conexao jsonb;
begin
  if not coalesce(public.eh_membro(), false) then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;
  if p_de is null or p_ate is null or p_ate <= p_de or p_ate - p_de > interval '367 days' then
    raise exception using message = 'periodo_invalido', errcode = 'P0001';
  end if;

  -- 1. Falhas da IA. Começa da última rodada concluída antes do período: o que
  --    vem antes dela é outro problema.
  select max(r.terminada_em) into v_corte
    from public.rodadas r
   where r.status = 'concluida' and r.terminada_em < p_de;

  with ev as (
    select r.id, r.conversa_id, (r.status = 'falhou') as falhou, r.motivo, r.terminada_em as t
      from public.rodadas r
     where r.status in ('concluida', 'falhou')
       and r.terminada_em is not null
       and r.terminada_em > coalesce(v_corte, '-infinity'::timestamptz)
       and r.terminada_em < p_ate
  ),
  l as (
    select ev.*,
           lag(ev.falhou) over w as falhou_antes,
           lag(ev.motivo) over w as motivo_antes
      from ev
    window w as (order by ev.t, ev.id)
  ),
  g as (
    select l.*,
           sum(case when l.falhou and (l.falhou_antes is distinct from true or l.motivo_antes is distinct from l.motivo)
                    then 1 else 0 end) over (order by l.t, l.id) as grupo
      from l
  ),
  runs as (
    select g.grupo, g.motivo, min(g.t) as inicio, max(g.t) as fim, count(*) as falhas,
           (array_agg(g.id order by g.t, g.id))[1] as primeira
      from g
     where g.falhou
     group by g.grupo, g.motivo
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', 'falha_ia:' || x.primeira::text,
           'tipo', 'falha_ia',
           'quando', x.inicio,
           'fim', x.fim,
           'durMin', round(extract(epoch from (x.fim - x.inicio))::numeric / 60)::bigint,
           'motivo', x.motivo,
           'quantidade', x.falhas,
           'conversasAfetadas', (select count(distinct e.conversa_id)
                                   from public.conversa_eventos e
                                  where e.tipo = 'passou' and e.motivo is not distinct from x.motivo
                                    and e.criado_em >= x.inicio and e.criado_em <= x.fim))), '[]'::jsonb)
    into v_ia
    from runs x
   where x.inicio >= p_de;

  -- 2. Envios que falharam (Janete e tela; o celular não passa pelo nosso envio).
  select max(m.momento) into v_corte
    from public.mensagens m
   where m.direcao = 'saida' and m.origem in ('janete', 'humano_tela')
     and m.status in ('enviada', 'entregue', 'lida') and m.momento < p_de;

  with ev as (
    select x.id, x.conversa_id, x.falhou, x.t
      from (select m.id, m.conversa_id, (m.status = 'falhou') as falhou,
                   case when m.status = 'falhou' then coalesce(m.status_em, m.momento) else m.momento end as t
              from public.mensagens m
             where m.direcao = 'saida' and m.origem in ('janete', 'humano_tela')
               and m.status in ('enviada', 'entregue', 'lida', 'falhou')) x
     where x.t > coalesce(v_corte, '-infinity'::timestamptz) and x.t < p_ate
  ),
  g as (
    select ev.*, sum(case when ev.falhou then 0 else 1 end) over (order by ev.t, ev.id) as grupo
      from ev
  ),
  runs as (
    select g.grupo, min(g.t) as inicio, max(g.t) as fim, count(*) as n,
           count(distinct g.conversa_id) as conversas,
           (array_agg(g.id order by g.t, g.id))[1] as primeira
      from g
     where g.falhou
     group by g.grupo
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', 'envio:' || x.primeira::text,
           'tipo', 'envio',
           'quando', x.inicio,
           'fim', x.fim,
           'durMin', round(extract(epoch from (x.fim - x.inicio))::numeric / 60)::bigint,
           'motivo', null,
           'quantidade', x.n,
           'conversasAfetadas', x.conversas)), '[]'::jsonb)
    into v_envio
    from runs x
   where x.inicio >= p_de;

  -- 3. Mídias recebidas que não foram copiadas.
  select max(m.momento) into v_corte
    from public.mensagens m
   where m.midia_ref_externa is not null and m.midia_status = 'copiada' and m.momento < p_de;

  with ev as (
    select m.id, m.conversa_id, (m.midia_status = 'falhou') as falhou, m.momento as t
      from public.mensagens m
     where m.midia_ref_externa is not null
       and m.midia_status in ('copiada', 'falhou')
       and m.momento > coalesce(v_corte, '-infinity'::timestamptz) and m.momento < p_ate
  ),
  g as (
    select ev.*, sum(case when ev.falhou then 0 else 1 end) over (order by ev.t, ev.id) as grupo
      from ev
  ),
  runs as (
    select g.grupo, min(g.t) as inicio, max(g.t) as fim, count(*) as n,
           count(distinct g.conversa_id) as conversas,
           (array_agg(g.id order by g.t, g.id))[1] as primeira
      from g
     where g.falhou
     group by g.grupo
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', 'midia:' || x.primeira::text,
           'tipo', 'midia',
           'quando', x.inicio,
           'fim', x.fim,
           'durMin', round(extract(epoch from (x.fim - x.inicio))::numeric / 60)::bigint,
           'motivo', null,
           'quantidade', x.n,
           'conversasAfetadas', x.conversas)), '[]'::jsonb)
    into v_midia
    from runs x
   where x.inicio >= p_de;

  -- 4. Quedas da conexão ativa: de uma ida para desconectada/erro até a volta a conectada.
  with ev as (
    select e.id, e.conexao_id, e.status_para, e.ativa_para, e.criado_em as t,
           sum(case when e.status_para = 'conectada' then 1 else 0 end)
             over (partition by e.conexao_id order by e.criado_em, e.id) as grupo
      from public.conexao_eventos e
     where e.criado_em < p_ate
  ),
  runs as (
    select ev.conexao_id, ev.grupo, min(ev.t) as inicio, count(*) as n,
           (array_agg(ev.id order by ev.t, ev.id))[1] as primeira
      from ev
     where ev.status_para in ('desconectada', 'erro') and ev.ativa_para
     group by ev.conexao_id, ev.grupo
  ),
  com_fim as (
    select x.*,
           (select min(e2.criado_em)
              from public.conexao_eventos e2
             where e2.conexao_id = x.conexao_id and e2.status_para = 'conectada' and e2.criado_em > x.inicio) as fim
      from runs x
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', 'conexao:' || x.primeira::text,
           'tipo', 'conexao',
           'quando', x.inicio,
           'fim', x.fim,
           'durMin', round(extract(epoch from (coalesce(x.fim, now()) - x.inicio))::numeric / 60)::bigint,
           'motivo', null,
           'quantidade', x.n,
           'conversasAfetadas', 0)), '[]'::jsonb)
    into v_conexao
    from com_fim x
   where x.inicio >= p_de;

  return coalesce((
    select jsonb_agg(p.v order by (p.v ->> 'quando')::timestamptz desc, p.v ->> 'id')
      from jsonb_array_elements(v_ia || v_envio || v_midia || v_conexao) as p(v)
  ), '[]'::jsonb);
end;
$$;


ALTER FUNCTION public.dashboard_problemas(p_de timestamp with time zone, p_ate timestamp with time zone) OWNER TO postgres;

--
-- Name: desativar_membro(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.desativar_membro(p_membro uuid) RETURNS uuid[]
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_eu     uuid;
  v_alvo   public.membros%rowtype;
  v_ids    uuid[];
begin
  if not coalesce(public.eh_admin(), false) then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;
  v_eu := public.membro_atual();
  if p_membro = v_eu then
    raise exception using message = 'proprio_membro', errcode = 'P0001';
  end if;

  select m.* into v_alvo from public.membros m where m.id = p_membro for update;
  if not found then
    raise exception using message = 'nao_encontrado', errcode = 'P0001';
  end if;

  if v_alvo.ativo then
    update public.membros m set ativo = false where m.id = p_membro;
  end if;

  with devolvidas as (
    update public.conversas c
       set responsavel_id = null,
           aguardando_humano_desde = now()
     where c.responsavel_id = p_membro
    returning c.id
  ), eventos as (
    insert into public.conversa_eventos (conversa_id, tipo, de, de_membro_id)
    select d.id, 'voltou_para_fila', 'outro', p_membro from devolvidas d
    returning conversa_id
  )
  select coalesce(array_agg(e.conversa_id order by e.conversa_id), '{}'::uuid[])
    into v_ids
    from eventos e;

  if v_alvo.ativo or cardinality(v_ids) > 0 then
    insert into public.auditoria (ator_membro_id, acao, alvo, detalhe)
    values (v_eu, 'membro_desativado', p_membro::text,
            jsonb_build_object('nome', v_alvo.nome, 'conversas_devolvidas', cardinality(v_ids)));
  end if;

  return v_ids;
end;
$$;


ALTER FUNCTION public.desativar_membro(p_membro uuid) OWNER TO postgres;

--
-- Name: desistir_midia(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.desistir_midia(p_msg uuid, p_erro text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_m public.mensagens;
begin
  select * into v_m from public.mensagens m where m.id = p_msg for update;
  if not found then
    raise exception using message = 'mensagem_nao_encontrada', errcode = 'P0001';
  end if;

  update public.mensagens m
     set midia_status = 'falhou',
         midia_pega_em = null,
         erro = case when m.direcao = 'entrada'
                     then coalesce(nullif(btrim(coalesce(p_erro, '')), ''), m.erro)
                     else m.erro end
   where m.id = p_msg and m.midia_status = 'pendente';
end;
$$;


ALTER FUNCTION public.desistir_midia(p_msg uuid, p_erro text) OWNER TO postgres;

--
-- Name: devolver_para_janete(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.devolver_para_janete(p_conversa uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_membro uuid := public.membro_atual();
  v_ult_entrada timestamptz;
  v_ult_saida   timestamptz;
  v_janela      boolean;
  v_modo        public.conversa_modo;
begin
  select (not exists (select 1 from public.conexoes cx where cx.ativa and cx.oficial))
         or (c.ultima_do_lead_em is not null and c.ultima_do_lead_em + interval '24 hours' > now()),
         c.modo
    into v_janela, v_modo
  from public.conversas c where c.id = p_conversa for update;
  if not found then
    raise exception using message = 'conversa_nao_encontrada', errcode = 'P0001';
  end if;

  select max(m.criado_em) filter (where m.direcao = 'entrada'),
         max(m.criado_em) filter (where m.direcao = 'saida' and m.status not in ('cancelada', 'falhou'))
    into v_ult_entrada, v_ult_saida
  from public.mensagens m
  where m.conversa_id = p_conversa;

  update public.conversas c
     set modo = 'janete',
         motivo_humano = null,
         aguardando_humano_desde = null,
         responsavel_id = null,
         devolvida_em = now(),
         responder_apos = case when v_ult_entrada is not null
                                    and (v_ult_saida is null or v_ult_entrada > v_ult_saida)
                                    and v_janela
                               then now() else null end
   where c.id = p_conversa;

  -- novo
  if v_modo = 'humano' then
    insert into public.conversa_eventos (conversa_id, tipo, membro_id)
    values (p_conversa, 'devolveu', v_membro);
  end if;
end;
$$;


ALTER FUNCTION public.devolver_para_janete(p_conversa uuid) OWNER TO postgres;

--
-- Name: eh_admin(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.eh_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select exists (
    select 1 from public.membros m
    where m.user_id = auth.uid() and m.ativo and m.papel = 'admin'
  );
$$;


ALTER FUNCTION public.eh_admin() OWNER TO postgres;

--
-- Name: eh_membro(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.eh_membro() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select exists (
    select 1 from public.membros m
    where m.user_id = auth.uid() and m.ativo
  );
$$;


ALTER FUNCTION public.eh_membro() OWNER TO postgres;

--
-- Name: falhar_envio(uuid, text, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.falhar_envio(p_msg uuid, p_erro text, p_definitivo boolean) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_m public.mensagens;
begin
  select * into v_m from public.mensagens m where m.id = p_msg for update;
  if not found then
    raise exception using message = 'mensagem_nao_encontrada', errcode = 'P0001';
  end if;
  if v_m.status not in ('na_fila', 'enviando') then
    return;
  end if;

  if coalesce(p_definitivo, false) or coalesce(v_m.tentativas, 0) >= 3 then
    update public.mensagens m
       set status = 'falhou', erro = p_erro, status_em = now()
     where m.id = p_msg;
  else
    update public.mensagens m
       set status = 'na_fila', erro = p_erro, status_em = now(),
           enviar_apos = now() + interval '30 seconds'
     where m.id = p_msg;
  end if;
end;
$$;


ALTER FUNCTION public.falhar_envio(p_msg uuid, p_erro text, p_definitivo boolean) OWNER TO postgres;

--
-- Name: falhar_evento(bigint, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.falhar_evento(p_id bigint, p_erro text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  update public.eventos_webhook e
     set erro = left(p_erro, 200),
         tentativas = e.tentativas + 1,
         pego_em = null
   where e.id = p_id
     and e.processado_em is null;
end;
$$;


ALTER FUNCTION public.falhar_evento(p_id bigint, p_erro text) OWNER TO postgres;

--
-- Name: falhar_rodada(uuid, public.motivo_humano, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.falhar_rodada(p_rodada uuid, p_motivo public.motivo_humano, p_passageiro boolean) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_r public.rodadas;
  v_modo public.conversa_modo;
begin
  if exists (select 1 from public.rodadas r where r.id = p_rodada and r.status = 'cancelada') then
    return;
  end if;
  v_r := public.rodada_rodando(p_rodada);

  update public.rodadas r
     set status = 'falhou', motivo = p_motivo, terminada_em = now()
   where r.id = p_rodada;

  update public.mensagens m
     set rodada_id = null
   where m.rodada_id = p_rodada and m.direcao = 'entrada';

  select c.modo into v_modo from public.conversas c where c.id = v_r.conversa_id for update;

  -- se a conversa ja saiu do modo janete (humano assumiu), nao mexe nela
  if v_modo is distinct from 'janete' then
    return;
  end if;

  if coalesce(p_passageiro, false) and coalesce(v_r.tentativa, 1) < 3 then
    update public.conversas c
       set responder_apos = now() + interval '30 seconds'
     where c.id = v_r.conversa_id;
  else
    update public.conversas c
       set modo = 'humano',
           aguardando_humano_desde = now(),
           motivo_humano = p_motivo,
           responder_apos = null
     where c.id = v_r.conversa_id;

    -- novo
    update public.rodadas r set foi_para_equipe = true where r.id = p_rodada;
    insert into public.conversa_eventos (conversa_id, tipo, motivo)
    values (v_r.conversa_id, 'passou', p_motivo);
  end if;
end;
$$;


ALTER FUNCTION public.falhar_rodada(p_rodada uuid, p_motivo public.motivo_humano, p_passageiro boolean) OWNER TO postgres;

--
-- Name: ids_normalizados(jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.ids_normalizados(p_ids jsonb) RETURNS jsonb
    LANGUAGE sql IMMUTABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select coalesce(jsonb_agg(jsonb_build_object('tipo', x.tipo, 'valor', x.valor, 'prio', x.prio)
                            order by x.prio, x.valor), '[]'::jsonb)
  from (
    select distinct t.tipo, t.valor,
           array_position(array['bsuid', 'lid', 'telefone', 'zernio_conversa'], t.tipo) as prio
    from (
      select e ->> 'tipo' as tipo,
             case when e ->> 'tipo' = 'telefone'
                  then regexp_replace(coalesce(e ->> 'valor', ''), '[^0-9]', '', 'g')
                  else btrim(coalesce(e ->> 'valor', ''))
             end as valor
      from jsonb_array_elements(case when jsonb_typeof(p_ids) = 'array' then p_ids else '[]'::jsonb end) as e
      where jsonb_typeof(e) = 'object'
    ) t
    where t.tipo in ('bsuid', 'lid', 'telefone', 'zernio_conversa')
      and t.valor <> ''
  ) x
$$;


ALTER FUNCTION public.ids_normalizados(p_ids jsonb) OWNER TO postgres;

--
-- Name: janete_atualizar_contato(uuid, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.janete_atualizar_contato(p_rodada uuid, p_campos jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_r public.rodadas := public.rodada_rodando(p_rodada);
  v_contato uuid;
  v_fatos jsonb;
  v_passo jsonb;
  v_anot jsonb := '{}'::jsonb;
begin
  if jsonb_typeof(p_campos) is distinct from 'object'
     or exists (select 1 from jsonb_object_keys(p_campos) k
                where k not in ('nome', 'email', 'empresa', 'resumo_janete', 'fatos', 'proximo_passo')) then
    raise exception using message = 'campo_nao_permitido', errcode = 'P0001';
  end if;
  if p_campos = '{}'::jsonb then
    return;
  end if;

  -- novo: formato das anotações
  if p_campos ? 'fatos' then
    v_fatos := p_campos -> 'fatos';
    if jsonb_typeof(v_fatos) <> 'array'
       or exists (select 1 from jsonb_array_elements(v_fatos) f
                  where jsonb_typeof(f) <> 'object'
                     or jsonb_typeof(f -> 'rotulo') is distinct from 'string'
                     or jsonb_typeof(f -> 'valor') is distinct from 'string'
                     or (f ? 'mensagem_id' and jsonb_typeof(f -> 'mensagem_id') not in ('string', 'null'))) then
      raise exception using message = 'campo_nao_permitido', errcode = 'P0001';
    end if;
    v_anot := v_anot || jsonb_build_object('fatos', v_fatos);
  end if;
  if p_campos ? 'proximo_passo' then
    v_passo := p_campos -> 'proximo_passo';
    if jsonb_typeof(v_passo) <> 'null'
       and (jsonb_typeof(v_passo) <> 'object'
            or jsonb_typeof(v_passo -> 'titulo') is distinct from 'string'
            or jsonb_typeof(v_passo -> 'texto') is distinct from 'string') then
      raise exception using message = 'campo_nao_permitido', errcode = 'P0001';
    end if;
    v_anot := v_anot || jsonb_build_object('proximo_passo', v_passo);
  end if;

  select c.contato_id into v_contato from public.conversas c where c.id = v_r.conversa_id;

  update public.contatos c
     set nome        = case when p_campos ? 'nome'
                                 and nullif(btrim(coalesce(c.nome, '')), '') is null
                                 and nullif(btrim(coalesce(p_campos ->> 'nome', '')), '') is not null
                            then p_campos ->> 'nome' else c.nome end,
         email       = case when p_campos ? 'email'
                                 and nullif(btrim(coalesce(c.email, '')), '') is null
                                 and nullif(btrim(coalesce(p_campos ->> 'email', '')), '') is not null
                            then p_campos ->> 'email' else c.email end,
         empresa     = case when p_campos ? 'empresa'
                                 and nullif(btrim(coalesce(c.empresa, '')), '') is null
                                 and nullif(btrim(coalesce(p_campos ->> 'empresa', '')), '') is not null
                            then p_campos ->> 'empresa' else c.empresa end,
         resumo_janete = case when p_campos ? 'resumo_janete' then p_campos ->> 'resumo_janete' else c.resumo_janete end,
         resumo_janete_em = case when p_campos ? 'resumo_janete' then now() else c.resumo_janete_em end,
         anotacoes_janete = case when v_anot <> '{}'::jsonb
                               then coalesce(c.anotacoes_janete, '{}'::jsonb) || v_anot
                               else c.anotacoes_janete end,
         atualizado_em = now()
   where c.id = v_contato;
end;
$$;


ALTER FUNCTION public.janete_atualizar_contato(p_rodada uuid, p_campos jsonb) OWNER TO postgres;

--
-- Name: janete_mover_etapa(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.janete_mover_etapa(p_rodada uuid, p_etapa uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_r public.rodadas := public.rodada_rodando(p_rodada);
  v_contato uuid;
  v_devolvida timestamptz;
  v_atual uuid;
  v_tipo public.etapa_tipo;
  v_ator public.historico_ator;
  v_movido_em timestamptz;
begin
  if not exists (select 1 from public.etapas e
                 where e.id = p_etapa and e.janete_pode_mover and not e.arquivada) then
    raise exception using message = 'etapa_nao_permitida', errcode = 'P0001';
  end if;

  select c.contato_id, c.devolvida_em into v_contato, v_devolvida
  from public.conversas c where c.id = v_r.conversa_id;

  -- novo: as travas da decisão 3 (o contato fica travado até o fim, contra um
  -- movimento de pessoa ao mesmo tempo)
  select ct.etapa_id, e.tipo into v_atual, v_tipo
  from public.contatos ct
  join public.etapas e on e.id = ct.etapa_id
  where ct.id = v_contato
  for update of ct;

  if v_atual is not distinct from p_etapa then
    return;
  end if;
  if v_tipo in ('ganho', 'perdido') then
    raise exception using message = 'etapa_travada', errcode = 'P0001';
  end if;

  select h.ator, h.criado_em into v_ator, v_movido_em
  from public.contato_etapa_historico h
  where h.contato_id = v_contato
  order by h.criado_em desc, h.id desc
  limit 1;
  if v_ator = 'membro' and (v_devolvida is null or v_devolvida <= v_movido_em) then
    raise exception using message = 'etapa_travada', errcode = 'P0001';
  end if;

  -- o gatilho de historico le esta marca e grava ator = janete
  perform set_config('janete.rodada_id', p_rodada::text, true);

  update public.contatos c
     set etapa_id = p_etapa, etapa_desde = now(), atualizado_em = now()
   where c.id = v_contato and c.etapa_id is distinct from p_etapa;
end;
$$;


ALTER FUNCTION public.janete_mover_etapa(p_rodada uuid, p_etapa uuid) OWNER TO postgres;

--
-- Name: janete_passar_para_humano(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.janete_passar_para_humano(p_rodada uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_r public.rodadas := public.rodada_rodando(p_rodada);
begin
  update public.rodadas r set passou_humano = true where r.id = p_rodada;

  update public.conversas c
     set modo = 'humano',
         motivo_humano = 'janete_passou',
         aguardando_humano_desde = coalesce(c.aguardando_humano_desde, now()),
         responder_apos = null
   where c.id = v_r.conversa_id and c.modo = 'janete';

  -- novo
  if found then
    update public.rodadas r set foi_para_equipe = true where r.id = p_rodada;
    insert into public.conversa_eventos (conversa_id, tipo, motivo)
    values (v_r.conversa_id, 'passou', 'janete_passou');
  end if;
end;
$$;


ALTER FUNCTION public.janete_passar_para_humano(p_rodada uuid) OWNER TO postgres;

--
-- Name: manutencao_janete(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.manutencao_janete() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  delete from public.eventos_webhook e
   where e.recebido_em < now() - interval '30 days';
end;
$$;


ALTER FUNCTION public.manutencao_janete() OWNER TO postgres;

--
-- Name: marcar_lida(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.marcar_lida(p_conversa uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_membro uuid := public.membro_atual();
begin
  update public.conversas c set nao_lidas = 0 where c.id = p_conversa;
  if not found then
    raise exception using message = 'conversa_nao_encontrada', errcode = 'P0001';
  end if;
end;
$$;


ALTER FUNCTION public.marcar_lida(p_conversa uuid) OWNER TO postgres;

--
-- Name: marcar_visto(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.marcar_visto(p_onde text) RETURNS timestamp with time zone
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_membro uuid := public.membro_atual();
  v_agora  timestamptz := now();
begin
  if p_onde is null or p_onde not in ('kanban', 'tour') then
    raise exception using message = 'parametro_invalido', errcode = '22023', detail = 'p_onde';
  end if;
  update public.membros m
     set vistos = coalesce(m.vistos, '{}'::jsonb) || jsonb_build_object(p_onde, v_agora)
   where m.id = v_membro;
  if not found then
    raise exception using message = 'nao_encontrado', errcode = 'P0001';
  end if;
  return v_agora;
end;
$$;


ALTER FUNCTION public.marcar_visto(p_onde text) OWNER TO postgres;

--
-- Name: membro_atual(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.membro_atual() RETURNS uuid
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_membro uuid;
begin
  if not coalesce(public.eh_membro(), false) then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;
  select m.id into v_membro from public.membros m where m.user_id = auth.uid() and m.ativo;
  if v_membro is null then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;
  return v_membro;
end;
$$;


ALTER FUNCTION public.membro_atual() OWNER TO postgres;

--
-- Name: mensagem_da_conversa(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.mensagem_da_conversa(p_msg uuid, p_conversa uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select exists (
    select 1 from public.mensagens m where m.id = p_msg and m.conversa_id = p_conversa
  );
$$;


ALTER FUNCTION public.mensagem_da_conversa(p_msg uuid, p_conversa uuid) OWNER TO postgres;

--
-- Name: motor_confere(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.motor_confere(p_chave text) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  return p_chave is not null
     and exists (select 1 from public.motor mo where mo.id and mo.chave = p_chave);
end;
$$;


ALTER FUNCTION public.motor_confere(p_chave text) OWNER TO postgres;

--
-- Name: motor_endereco(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.motor_endereco(p_url text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
begin
  insert into public.motor (id) values (true)
  on conflict (id) do nothing;
  if p_url is null
     or char_length(p_url) > 261
     or p_url !~ '^https://([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]([a-z0-9-]*[a-z0-9])?$' then
    return false;
  end if;
  update public.motor mo
     set url = p_url, url_em = now()
   where mo.id and mo.url is distinct from p_url;
  return found;
end;
$_$;


ALTER FUNCTION public.motor_endereco(p_url text) OWNER TO postgres;

--
-- Name: motor_pendencias(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.motor_pendencias() RETURNS TABLE(proximo_em timestamp with time zone, vencido_desde timestamp with time zone, atrasado_desde timestamp with time zone)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role'
     and not coalesce(public.eh_membro(), false) then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;

  return query
  with ativas as (
    -- Cada conexão ativa e desde quando: a última ativação em conexao_eventos (o gatilho grava só
    -- as mudanças); sem evento, a conexão nasceu ativa.
    select a.id, a.oficial,
           coalesce((select max(ev.criado_em) from public.conexao_eventos ev
                      where ev.conexao_id = a.id and ev.ativa_para
                        and ev.ativa_de is distinct from true),
                    a.criado_em) as desde
    from public.conexoes a
    where a.ativa
  ), onboarding as (
    select cf.onboarding_concluido_em as desde from public.configuracao cf where cf.id = 1
  ), primeiras as (
    -- pegar_envios (0002:773-777): só a 1ª saída na fila de cada conversa pode sair
    select distinct on (m.conversa_id) m.id
    from public.mensagens m
    where m.direcao = 'saida' and m.status = 'na_fila'
    order by m.conversa_id, m.criado_em, m.ordem nulls last, m.id
  ), itens as (
    -- Conversa armada: pegar_rodadas (0006:595-598, o onboarding, e 0006:605-620, a conversa).
    -- Pronta em responder_apos; com uma rodada rodando, só depois da limpeza dela (5 min); com
    -- mídia de entrada pendente, só 2 min depois da última (as duas travas de 0006:610-615). Nunca
    -- antes da conclusão do onboarding nem da 1ª conexão ativa que serve a conversa.
    select greatest(
             c.responder_apos,
             (select ob.desde from onboarding ob),
             (select min(av.desde) from ativas av
               where not av.oficial
                  or (c.ultima_do_lead_em is not null
                      and c.ultima_do_lead_em + interval '24 hours' > now())),
             (select max(r.iniciada_em) + interval '5 minutes' from public.rodadas r
               where r.conversa_id = c.id and r.status = 'rodando'),
             (select max(m.criado_em) + interval '2 minutes' from public.mensagens m
               where m.conversa_id = c.id and m.direcao = 'entrada'
                 and m.midia_status = 'pendente')
           ) as pronto,
           false as evento
    from public.conversas c
    where c.responder_apos is not null
      and c.modo = 'janete'
      and exists (select 1 from public.configuracao cf
                  where cf.id = 1 and cf.onboarding_concluido_em is not null)
      and exists (select 1 from public.conexoes cx
                  where cx.ativa
                    and (not cx.oficial
                         or (c.ultima_do_lead_em is not null
                             and c.ultima_do_lead_em + interval '24 hours' > now())))

    union all
    -- Rodada presa: pegar_rodadas (0006:585-592) falha a rodada rodando há mais de 5 min.
    select r.iniciada_em + interval '5 minutes', false
    from public.rodadas r
    where r.status = 'rodando'

    union all
    -- Saída na fila em conexão ativa: pegar_envios (0002:778-790). Pronta em
    -- coalesce(enviar_apos, criado_em); com outra saída enviando na conversa, só depois da
    -- limpeza dela (2 min, 0002:739-745). Nunca antes da ativação da conexão dela.
    select greatest(
             coalesce(m.enviar_apos, m.criado_em),
             av.desde,
             (select max(coalesce(e.status_em, e.criado_em)) + interval '2 minutes'
                from public.mensagens e
               where e.conversa_id = m.conversa_id
                 and e.direcao = 'saida' and e.status = 'enviando')
           ),
           false
    from public.mensagens m
    join primeiras p on p.id = m.id
    join ativas av on av.id = m.conexao_id
    where m.status = 'na_fila'

    union all
    -- Órfã de conexão inativa, quando há outra conexão ativa: pegar_envios (0002:758-769) a
    -- falha logo. Pronta quando ficou órfã: a saída ou a 1ª ativação entre as conexões ativas, a
    -- mais nova.
    select greatest(
             coalesce(m.status_em, m.criado_em),
             (select min(av.desde) from ativas av)
           ),
           false
    from public.mensagens m
    where m.direcao = 'saida' and m.status = 'na_fila'
      and exists (select 1 from ativas)
      and not exists (select 1 from ativas av where av.id = m.conexao_id)

    union all
    -- Enviando há mais de 2 min: pegar_envios (0002:739-745) devolve à fila ou fecha.
    select coalesce(m.status_em, m.criado_em) + interval '2 minutes', false
    from public.mensagens m
    where m.direcao = 'saida' and m.status = 'enviando'

    union all
    -- Mídia pendente: pegar_midias (0002:1030-1039, a cópia, com referência e menos de 3
    -- tentativas, e 0002:1015-1021, a esgotada, com 3 ou mais). As duas esperam a trava de 2 min.
    select coalesce(m.midia_pega_em + interval '2 minutes', m.criado_em), false
    from public.mensagens m
    where m.midia_status = 'pendente'
      and ((m.midia_ref_externa is not null and m.midia_tentativas < 3)
           or m.midia_tentativas >= 3)

    union all
    -- Evento do webhook não processado: pegar_eventos_pendentes (abaixo), com menos de 5
    -- tentativas, recebido há mais de 30 s e a trava de 2 min vencida.
    select greatest(e.recebido_em + interval '30 seconds', e.pego_em + interval '2 minutes'), true
    from public.eventos_webhook e
    where e.processado_em is null and e.tentativas < 5
  )
  select min(i.pronto) filter (where i.pronto > now()),
         min(i.pronto) filter (where i.pronto <= now()),
         min(i.pronto) filter (where i.pronto <= now() and not i.evento)
  from itens i;
end;
$$;


ALTER FUNCTION public.motor_pendencias() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: mensagens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mensagens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversa_id uuid NOT NULL,
    conexao_id uuid NOT NULL,
    direcao public.mensagem_direcao NOT NULL,
    origem public.mensagem_origem NOT NULL,
    tipo public.mensagem_tipo DEFAULT 'texto'::public.mensagem_tipo NOT NULL,
    texto text,
    transcricao text,
    midia_ref_externa text,
    midia_caminho text,
    midia_mime text,
    midia_tamanho bigint,
    midia_nome text,
    midia_status public.midia_status,
    midia_tentativas smallint DEFAULT 0 NOT NULL,
    midia_pega_em timestamp with time zone,
    id_externo text,
    id_gateway text,
    status public.mensagem_status DEFAULT 'recebida'::public.mensagem_status NOT NULL,
    erro text,
    tentativas smallint DEFAULT 0 NOT NULL,
    enviar_apos timestamp with time zone,
    autor_membro_id uuid,
    rodada_id uuid,
    ordem integer,
    editada boolean DEFAULT false NOT NULL,
    apagada_em timestamp with time zone,
    momento timestamp with time zone DEFAULT now() NOT NULL,
    status_em timestamp with time zone,
    evento_id bigint,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    responde_a_id uuid,
    midia_duracao_s integer,
    reenvios integer DEFAULT 0 NOT NULL,
    CONSTRAINT mensagens_entrada_e_lead CHECK (((direcao = 'entrada'::public.mensagem_direcao) = (origem = 'lead'::public.mensagem_origem))),
    CONSTRAINT mensagens_entrada_recebida CHECK (((direcao = 'entrada'::public.mensagem_direcao) = (status = 'recebida'::public.mensagem_status))),
    CONSTRAINT mensagens_humano_tela_autor CHECK (((origem <> 'humano_tela'::public.mensagem_origem) OR (autor_membro_id IS NOT NULL))),
    CONSTRAINT mensagens_janete_rodada CHECK (((origem <> 'janete'::public.mensagem_origem) OR (rodada_id IS NOT NULL))),
    CONSTRAINT mensagens_midia_duracao_s CHECK (((midia_duracao_s IS NULL) OR (midia_duracao_s >= 0))),
    CONSTRAINT mensagens_reenvios_nao_negativo CHECK ((reenvios >= 0))
);


ALTER TABLE public.mensagens OWNER TO postgres;

--
-- Name: pegar_envios(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.pegar_envios(p_limite integer) RETURNS SETOF public.mensagens
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  with presas as (
    select m.id
    from public.mensagens m
    where m.direcao = 'saida' and m.status = 'enviando'
      and coalesce(m.status_em, m.criado_em) < now() - interval '2 minutes'
    for update skip locked
  )
  update public.mensagens m
     set status    = case when m.id_externo is not null then 'enviada'::public.mensagem_status
                          when m.tentativas >= 3 then 'falhou'::public.mensagem_status
                          else 'na_fila'::public.mensagem_status end,
         erro      = case when m.id_externo is null and m.tentativas >= 3 then 'sem_resposta_do_envio'
                          else m.erro end,
         momento   = case when m.id_externo is not null then coalesce(m.status_em, m.momento)
                          else m.momento end,
         status_em = now()
    from presas p
   where m.id = p.id;

  with orfas as (
    select m.id
    from public.mensagens m
    where m.direcao = 'saida' and m.status = 'na_fila'
      and exists (select 1 from public.conexoes a where a.ativa)
      and not exists (select 1 from public.conexoes cx where cx.id = m.conexao_id and cx.ativa)
    for update skip locked
  )
  update public.mensagens m
     set status = 'falhou', erro = 'conexao_inativa', status_em = now()
    from orfas o
   where m.id = o.id;

  -- instrucao unica: trava (SKIP LOCKED) e passa para 'enviando'
  return query
  with primeiras as (
    select distinct on (m.conversa_id) m.id
    from public.mensagens m
    where m.direcao = 'saida' and m.status = 'na_fila'
    order by m.conversa_id, m.criado_em, m.ordem nulls last, m.id
  ), alvo as (
    select m.id
    from public.mensagens m
    join primeiras p on p.id = m.id
    join public.conexoes cx on cx.id = m.conexao_id and cx.ativa
    where m.status = 'na_fila'
      and coalesce(m.enviar_apos, m.criado_em) <= now()
      and not exists (select 1 from public.mensagens e
                      where e.conversa_id = m.conversa_id
                        and e.direcao = 'saida' and e.status = 'enviando')
    order by coalesce(m.enviar_apos, m.criado_em), m.id
    limit greatest(coalesce(p_limite, 0), 0)
    for update of m skip locked
  )
  update public.mensagens m
     set status = 'enviando',
         tentativas = coalesce(m.tentativas, 0) + 1,
         status_em = now()
    from alvo a
   where m.id = a.id
  returning m.*;
end;
$$;


ALTER FUNCTION public.pegar_envios(p_limite integer) OWNER TO postgres;

--
-- Name: pegar_eventos_pendentes(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.pegar_eventos_pendentes(p_limite integer) RETURNS TABLE(id bigint, gateway public.gateway, conexao_id uuid, payload jsonb, tentativas smallint)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
#variable_conflict use_column
begin
  return query
  with alvo as (
    select e.id
    from public.eventos_webhook e
    where e.processado_em is null
      and e.tentativas < 5
      and e.recebido_em < now() - interval '30 seconds'
      and (e.pego_em is null or e.pego_em < now() - interval '2 minutes')
    order by e.id
    limit greatest(coalesce(p_limite, 0), 0)
    for update of e skip locked
  ), pegos as (
    update public.eventos_webhook e
       set pego_em = now()
      from alvo a
     where e.id = a.id
    returning e.id, e.gateway, e.conexao_id, e.payload, e.tentativas
  )
  select p.id, p.gateway, p.conexao_id, p.payload, p.tentativas
  from pegos p
  order by p.id;
end;
$$;


ALTER FUNCTION public.pegar_eventos_pendentes(p_limite integer) OWNER TO postgres;

--
-- Name: pegar_midias(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.pegar_midias(p_limite integer) RETURNS SETOF public.mensagens
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  with esgotadas as (
    select m.id
    from public.mensagens m
    where m.midia_status = 'pendente'
      and m.midia_tentativas >= 3
      and (m.midia_pega_em is null or m.midia_pega_em < now() - interval '2 minutes')
    for update skip locked
  )
  update public.mensagens m
     set midia_status = 'falhou', midia_pega_em = null
    from esgotadas e
   where m.id = e.id;

  -- instrucao unica: trava (SKIP LOCKED) e marca como pega
  return query
  with alvo as (
    select m.id
    from public.mensagens m
    where m.midia_status = 'pendente'
      and m.midia_ref_externa is not null
      and m.midia_tentativas < 3
      and (m.midia_pega_em is null or m.midia_pega_em < now() - interval '2 minutes')
    order by m.criado_em, m.id
    limit greatest(coalesce(p_limite, 0), 0)
    for update of m skip locked
  )
  update public.mensagens m
     set midia_pega_em = now(),
         midia_tentativas = m.midia_tentativas + 1
    from alvo a
   where m.id = a.id
  returning m.*;
end;
$$;


ALTER FUNCTION public.pegar_midias(p_limite integer) OWNER TO postgres;

--
-- Name: rodadas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rodadas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversa_id uuid NOT NULL,
    status public.rodada_status DEFAULT 'rodando'::public.rodada_status NOT NULL,
    motivo public.motivo_humano,
    contexto_versao_id bigint,
    provedor public.ia_provedor,
    modelo text,
    passos integer DEFAULT 0 NOT NULL,
    tentativa smallint DEFAULT 1 NOT NULL,
    passou_humano boolean DEFAULT false NOT NULL,
    ferramentas jsonb DEFAULT '[]'::jsonb NOT NULL,
    iniciada_em timestamp with time zone DEFAULT now() NOT NULL,
    terminada_em timestamp with time zone,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    foi_para_equipe boolean DEFAULT false NOT NULL,
    CONSTRAINT rodadas_passos_check CHECK ((passos >= 0)),
    CONSTRAINT rodadas_tentativa_check CHECK ((tentativa >= 1))
);


ALTER TABLE public.rodadas OWNER TO postgres;

--
-- Name: pegar_rodadas(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.pegar_rodadas(p_limite integer) RETURNS SETOF public.rodadas
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_velha  uuid;
  v_ctx    bigint;
  v_prov   public.ia_provedor;
  v_modelo text;
  v_ids    uuid[];
begin
  for v_velha in
    select r.id from public.rodadas r
    where r.status = 'rodando' and r.iniciada_em < now() - interval '5 minutes'
    order by r.iniciada_em
    for update skip locked
  loop
    perform public.falhar_rodada(v_velha, 'erro_provedor', true);
  end loop;

  -- novo
  if not exists (select 1 from public.configuracao cf
                 where cf.id = 1 and cf.onboarding_concluido_em is not null) then
    return;
  end if;

  select max(cv.id) into v_ctx from public.contexto_versoes cv;
  select k.provedor, k.modelo into v_prov, v_modelo
  from public.ia_chaves k where k.finalidade = 'resposta';

  -- instrucao unica: trava (SKIP LOCKED), limpa responder_apos e cria a rodada
  with alvo as (
    select c.id
    from public.conversas c
    where c.responder_apos <= now()
      and c.modo = 'janete'
      and not exists (select 1 from public.rodadas r
                      where r.conversa_id = c.id and r.status = 'rodando')
      and not exists (select 1 from public.mensagens m
                      where m.conversa_id = c.id and m.direcao = 'entrada'
                        and m.midia_status = 'pendente'
                        and m.criado_em > now() - interval '2 minutes')
      and exists (select 1 from public.conexoes cx
                  where cx.ativa
                    and (not cx.oficial
                         or (c.ultima_do_lead_em is not null
                             and c.ultima_do_lead_em + interval '24 hours' > now())))
    order by c.responder_apos, c.id
    limit greatest(coalesce(p_limite, 0), 0)
    for update of c skip locked
  ), limpa as (
    update public.conversas c
       set responder_apos = null
      from alvo a
     where c.id = a.id
    returning c.id
  ), nova as (
    insert into public.rodadas (conversa_id, status, contexto_versao_id, provedor, modelo,
                                passos, tentativa, passou_humano, iniciada_em)
    select l.id, 'rodando', v_ctx, v_prov, v_modelo, 0,
           1 + (select count(*) from public.rodadas f
                where f.conversa_id = l.id and f.status = 'falhou'
                  and f.criado_em > greatest(
                        coalesce((select max(k.criado_em) from public.rodadas k
                                  where k.conversa_id = l.id and k.status = 'concluida'),
                                 '-infinity'::timestamptz),
                        coalesce((select cv.devolvida_em from public.conversas cv where cv.id = l.id),
                                 '-infinity'::timestamptz))),
           false, now()
    from limpa l
    returning id
  )
  select array_agg(n.id) into v_ids from nova n;

  if v_ids is null then
    return;
  end if;

  -- liga as entradas ainda nao lidas a rodada
  update public.mensagens m
     set rodada_id = r.id
    from public.rodadas r
   where r.id = any (v_ids)
     and m.conversa_id = r.conversa_id
     and m.direcao = 'entrada'
     and m.rodada_id is null;

  return query
    select r.* from public.rodadas r where r.id = any (v_ids) order by r.criado_em, r.id;
end;
$$;


ALTER FUNCTION public.pegar_rodadas(p_limite integer) OWNER TO postgres;

--
-- Name: preparar_copia(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.preparar_copia() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_preparada timestamptz;
  v_relogio   timestamptz;
  v_tabela    text;
begin
  select mo.preparada_em, mo.relogio_em into v_preparada, v_relogio
    from public.motor mo where mo.id;
  if v_preparada is not null and v_relogio > now() - interval '1 day' then
    return 'pronta';
  end if;

  insert into public.motor (id) values (true)
  on conflict (id) do nothing;
  select mo.preparada_em, mo.relogio_em into v_preparada, v_relogio
    from public.motor mo where mo.id
     for update;
  if v_preparada is not null and v_relogio > now() - interval '1 day' then
    return 'pronta';
  end if;

  if v_preparada is null then
    -- 0001_janete_dados_iniciais, 1. Etapas do funil
    insert into public.etapas (chave, nome, ordem, tipo, janete_pode_mover) values
      ('novo',           'Novo',            10, 'aberta', false),
      ('em_qualificacao','Em qualificação', 20, 'aberta', true),
      ('qualificado',    'Qualificado',     30, 'aberta', true),
      ('em_negociacao',  'Em negociação',   40, 'aberta', false),
      ('ganho',          'Ganho',           50, 'ganho',  false),
      ('perdido',        'Perdido',         60, 'perdido', true)
    on conflict (chave) do nothing;

    -- 0001_janete_dados_iniciais, 2. Configuracao
    insert into public.configuracao (id) values (1)
    on conflict (id) do nothing;

    -- 0001_janete_dados_iniciais, 3. Precos da IA
    insert into public.ia_precos
      (provedor, modelo, vigente_desde, a_partir_de_tokens,
       entrada, cache_leitura, cache_escrita, saida, audio_por_minuto, fonte)
    values
      ('anthropic', 'claude-haiku-5-5', '2026-10-28', 0,
       0.10, 0.01, 0.125, 0.50, null,
       'https://platform.claude.com/docs/en/models/haiku-5-5/overview'),
      ('anthropic', 'claude-haiku-5-5', '2026-10-28', 100001,
       0.50, null, null, 2.50, null,
       'https://platform.claude.com/docs/en/models/haiku-5-5/overview'),
      ('anthropic', 'claude-sonnet-5-5', '2026-10-28', 0,
       2, 0.10, 2.50, 10, null,
       'https://platform.claude.com/docs/en/about-claude/pricing'),
      ('anthropic', 'claude-opus-5-5', '2026-10-28', 0,
       4, 0.20, 5, 20, null,
       'https://platform.claude.com/docs/en/about-claude/pricing'),
      ('anthropic', 'claude-fable-5-1', '2026-10-28', 0,
       10, 0.25, null, 50, null,
       'https://platform.claude.com/docs/en/about-claude/pricing'),
      ('anthropic', 'claude-haiku-4-5-20251001', '2026-10-28', 0,
       1, 0.10, null, 5, null,
       'https://platform.claude.com/docs/en/about-claude/pricing'),
      ('anthropic', 'claude-haiku-4-5', '2026-10-28', 0,
       1, 0.10, null, 5, null,
       'https://platform.claude.com/docs/en/about-claude/pricing'),
      ('openai', 'gpt-6-luna', '2026-10-28', 0,
       0.10, 0.01, 0.125, 0.50, null,
       'https://developers.openai.com/api/docs/models/gpt-6-luna'),
      ('openai', 'gpt-6.1-terra', '2026-10-28', 0,
       1, 0.05, 1.25, 5, null,
       'https://developers.openai.com/api/docs/models/gpt-6.1-terra'),
      ('openai', 'gpt-6.1-sol', '2026-10-28', 0,
       2, 0.10, 2.50, 10, null,
       'https://developers.openai.com/api/docs/models/gpt-6.1-sol'),
      ('openai', 'gpt-6-astra', '2026-10-28', 0,
       10, 1, null, 50, null,
       'https://developers.openai.com/api/docs/pricing'),
      ('openai', 'gpt-5.4-mini', '2026-10-28', 0,
       0.75, 0.075, null, 4.50, null,
       'https://developers.openai.com/api/docs/models/gpt-5.4-mini'),
      ('openai', 'gpt-5.6-luna', '2026-10-28', 0,
       0.20, null, null, 1.20, null,
       'https://developers.openai.com/api/docs/pricing'),
      ('openai', 'gpt-5.6-terra', '2026-10-28', 0,
       2, null, null, 12, null,
       'https://developers.openai.com/api/docs/pricing'),
      ('openai', 'gpt-6-sol', '2026-10-28', 0,
       2, 0.20, null, 10, null,
       'https://developers.openai.com/api/docs/pricing'),
      ('openai', 'gpt-6-luna', '2026-10-28', 272001,
       null, null, null, null, null,
       'https://developers.openai.com/api/docs/pricing'),
      ('openai', 'gpt-6.1-terra', '2026-10-28', 272001,
       null, null, null, null, null,
       'https://developers.openai.com/api/docs/pricing'),
      ('openai', 'gpt-6.1-sol', '2026-10-28', 272001,
       null, null, null, null, null,
       'https://developers.openai.com/api/docs/pricing'),
      ('openai', 'gpt-6-astra', '2026-10-28', 272001,
       null, null, null, null, null,
       'https://developers.openai.com/api/docs/pricing'),
      ('openai', 'gpt-5.6-luna', '2026-10-28', 272001,
       null, null, null, null, null,
       'https://developers.openai.com/api/docs/pricing'),
      ('openai', 'gpt-5.6-terra', '2026-10-28', 272001,
       null, null, null, null, null,
       'https://developers.openai.com/api/docs/pricing'),
      ('openai', 'gpt-6-sol', '2026-10-28', 272001,
       null, null, null, null, null,
       'https://developers.openai.com/api/docs/pricing'),
      ('openai', 'gpt-transcribe', '2026-10-28', 0,
       null, null, null, null, 0.0045,
       'https://developers.openai.com/api/docs/pricing'),
      ('openai', 'gpt-4o-transcribe', '2026-10-28', 0,
       null, null, null, null, 0.006,
       'https://developers.openai.com/api/docs/pricing'),
      ('openai', 'gpt-4o-mini-transcribe', '2026-10-28', 0,
       null, null, null, null, 0.003,
       'https://developers.openai.com/api/docs/pricing'),
      ('openai', 'whisper-1', '2026-10-28', 0,
       null, null, null, null, 0.006,
       'https://developers.openai.com/api/docs/pricing'),
      ('groq', 'whisper-large-v3-turbo', '2026-10-28', 0,
       null, null, null, null, 0.04::numeric / 60,
       'https://console.groq.com/docs/speech-to-text'),
      ('groq', 'whisper-large-v3', '2026-10-28', 0,
       null, null, null, null, 0.111::numeric / 60,
       'https://console.groq.com/docs/speech-to-text')
    on conflict (provedor, modelo, vigente_desde, a_partir_de_tokens) do nothing;

    -- 0015_janete_voz_uso_precos, com a mesma proteção do valor de enum (55P04)
    begin
      insert into public.ia_precos
        (provedor, modelo, vigente_desde, a_partir_de_tokens,
         entrada, cache_leitura, cache_escrita, saida, audio_por_minuto, por_mil_caracteres, fonte)
      values
        ('elevenlabs', 'eleven_multilingual_v2', '2026-11-02', 0,
         null, null, null, null, null, 0.08,
         'https://elevenlabs.io/pricing/api'),
        ('elevenlabs', 'scribe_v2', '2026-11-02', 0,
         null, null, null, null, 0.22::numeric / 60, null,
         'https://elevenlabs.io/pricing/api')
      on conflict (provedor, modelo, vigente_desde, a_partir_de_tokens) do nothing;
    exception when sqlstate '55P04' then
      raise warning 'precos_elevenlabs_nao_gravados';
    end;
  end if;

  -- O gatilho da 1ª conta (o mesmo da 0000): a 1ª conta criada vira admin.
  create or replace trigger membros_primeira_conta
    after insert on auth.users
    for each row execute function public.tg_auth_primeira_conta();

  -- As 8 tabelas do tempo real (as mesmas da 0000 e da 0010).
  foreach v_tabela in array array['contato_etapa_historico', 'contatos', 'conversa_eventos', 'conversas',
                                  'etapas', 'membros', 'mensagens', 'rodadas'] loop
    if not exists (select 1 from pg_catalog.pg_publication_tables pt
                    where pt.pubname = 'supabase_realtime' and pt.schemaname = 'public'
                      and pt.tablename = v_tabela) then
      execute format('alter publication supabase_realtime add table public.%I', v_tabela);
    end if;
  end loop;

  -- O relógio: com o mesmo nome, o pg_cron troca o job que já existe em vez de criar outro. É a
  -- peça menos essencial: se o cron recusar, o resto fica gravado, relogio_em fica nulo e a
  -- chamada seguinte tenta só o relógio de novo (os dados iniciais não voltam).
  begin
    perform cron.schedule('janete-relogio', '17 * * * *', 'select public.manutencao_janete()');
    v_relogio := now();
  exception when others then
    raise warning 'relogio_nao_instalado: %', sqlerrm;
    v_relogio := null;
  end;

  update public.motor mo
     set preparada_em = coalesce(mo.preparada_em, now()),
         relogio_em = v_relogio
   where mo.id;
  return 'preparada';
end;
$$;


ALTER FUNCTION public.preparar_copia() OWNER TO postgres;

--
-- Name: reativar_membro(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reativar_membro(p_membro uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_eu   uuid;
  v_alvo public.membros%rowtype;
begin
  if not coalesce(public.eh_admin(), false) then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;
  v_eu := public.membro_atual();
  if p_membro = v_eu then
    raise exception using message = 'proprio_membro', errcode = 'P0001';
  end if;

  select m.* into v_alvo from public.membros m where m.id = p_membro for update;
  if not found then
    raise exception using message = 'nao_encontrado', errcode = 'P0001';
  end if;
  if v_alvo.ativo then
    return;
  end if;

  update public.membros m set ativo = true where m.id = p_membro;

  insert into public.auditoria (ator_membro_id, acao, alvo, detalhe)
  values (v_eu, 'membro_reativado', p_membro::text, jsonb_build_object('nome', v_alvo.nome));
end;
$$;


ALTER FUNCTION public.reativar_membro(p_membro uuid) OWNER TO postgres;

--
-- Name: reenviar_mensagem(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reenviar_mensagem(p_msg uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_membro uuid := public.membro_atual();
  v_m public.mensagens;
  v_ativa uuid;
  v_oficial boolean;
  v_ultima_lead timestamptz;
begin
  select * into v_m from public.mensagens m where m.id = p_msg for update;
  if not found then
    raise exception using message = 'nao_encontrado', errcode = 'P0001';
  end if;

  if v_m.direcao <> 'saida' or v_m.origem <> 'humano_tela' or v_m.status <> 'falhou' then
    raise exception using message = 'nao_reenviavel', errcode = 'P0001';
  end if;
  -- falha_no_gateway: o gateway aceitou e depois avisou que a entrega falhou, então a
  -- mensagem não chegou e pode sair de novo (decisão 8). Os outros casos podem ter chegado.
  if coalesce(v_m.erro, '') <> 'falha_no_gateway'
     and (v_m.id_externo is not null
          or v_m.id_gateway is not null
          or coalesce(v_m.erro, '') in ('sem_resposta_do_envio', 'tempo_esgotado', 'falha_de_rede')
          or coalesce(v_m.erro, '') ~ '^(http_|http:|meta_|zernio_http_)5[0-9][0-9]') then
    raise exception using message = 'nao_reenviavel', errcode = 'P0001';
  end if;

  select c.id, c.oficial into v_ativa, v_oficial from public.conexoes c where c.ativa;
  if v_ativa is null then
    raise exception using message = 'sem_conexao_ativa', errcode = 'P0001';
  end if;
  if v_oficial then
    select cv.ultima_do_lead_em into v_ultima_lead
    from public.conversas cv where cv.id = v_m.conversa_id;
    if v_ultima_lead is null or v_ultima_lead + interval '24 hours' <= now() then
      raise exception using message = 'janela_fechada', errcode = 'P0001';
    end if;
  end if;

  update public.mensagens m
     set status = 'na_fila',
         erro = null,
         tentativas = 0,
         enviar_apos = now(),
         status_em = now(),
         conexao_id = v_ativa,
         id_externo = null,
         id_gateway = null,
         -- novo: conta o reenvio (a chave da Zernio muda a cada um)
         reenvios = m.reenvios + 1
   where m.id = p_msg;
end;
$$;


ALTER FUNCTION public.reenviar_mensagem(p_msg uuid) OWNER TO postgres;

--
-- Name: registrar_entrada(uuid, jsonb, text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.registrar_entrada(p_conexao uuid, p_ids jsonb, p_nome_whatsapp text, p_msg jsonb) RETURNS TABLE(mensagem_id uuid, conversa_id uuid, nova boolean)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
#variable_conflict use_column
declare
  v_id_ext  text := nullif(btrim(coalesce(p_msg ->> 'id_externo', '')), '');
  v_momento timestamptz;
  v_ref     text := nullif(btrim(coalesce(p_msg ->> 'midia_ref_externa', '')), '');
  v_cita    text := nullif(btrim(coalesce(p_msg ->> 'responde_a_id_externo', '')), '');
  v_resp    uuid;
  v_contato uuid;
  v_conv    uuid;
  v_msg     uuid;
begin
  if v_id_ext is null or nullif(p_msg ->> 'tipo', '') is null or nullif(p_msg ->> 'momento', '') is null then
    raise exception using message = 'mensagem_invalida', errcode = 'P0001';
  end if;
  v_momento := (p_msg ->> 'momento')::timestamptz;

  -- ja existe (reentrega do webhook, edicao ou apagamento)
  select m.id, m.conversa_id into v_msg, v_conv
  from public.mensagens m
  where m.conexao_id = p_conexao and m.id_externo = v_id_ext;

  if v_msg is null then
    -- Apagamento de mensagem que nunca foi gravada (enviada antes da conexao, ou a
    -- original ainda em nova tentativa): nao cria contato, conversa nem mensagem
    -- (nao arma a Janete nem conta lead novo).
    if coalesce((p_msg ->> 'apagada')::boolean, false) then
      return query select null::uuid, null::uuid, false;
      return;
    end if;

    v_contato := public.contato_por_ids(p_conexao, p_ids, p_nome_whatsapp);
    -- Trava o contato antes da conversa (o gatilho do insert trava a conversa), na
    -- mesma ordem para todas as chamadas: duas entradas ao mesmo tempo nao se travam.
    perform 1 from public.contatos c where c.id = v_contato for update;
    v_conv := public.conversa_do_contato(v_contato, p_conexao);

    update public.conversas c
       set conexao_id = p_conexao
     where c.id = v_conv and c.conexao_id is distinct from p_conexao;

    -- novo: a citação, pela mesma conexão
    if v_cita is not null then
      select m.id into v_resp
      from public.mensagens m
      where m.conexao_id = p_conexao and m.id_externo = v_cita;
    end if;

    insert into public.mensagens (
      conversa_id, conexao_id, direcao, origem, tipo, texto, status,
      midia_ref_externa, midia_mime, midia_nome, midia_tamanho, midia_status,
      id_externo, id_gateway, momento, evento_id, editada, responde_a_id)
    values (
      v_conv, p_conexao, 'entrada', 'lead', public.tipo_de_mensagem(p_msg ->> 'tipo'),
      p_msg ->> 'texto', 'recebida',
      v_ref, p_msg ->> 'midia_mime', p_msg ->> 'midia_nome',
      (nullif(p_msg ->> 'midia_tamanho', ''))::bigint,
      case when v_ref is not null then 'pendente'::public.midia_status end,
      v_id_ext, nullif(p_msg ->> 'id_gateway', ''), v_momento,
      (nullif(p_msg ->> 'evento_id', ''))::bigint,
      -- edicao que chega antes da original ja entra marcada como editada
      coalesce((p_msg ->> 'editada')::boolean, false),
      v_resp)
    on conflict (conexao_id, id_externo) where id_externo is not null do nothing
    returning id into v_msg;

    if v_msg is not null then
      update public.contatos c
         set primeira_mensagem_em = v_momento
       where c.id = v_contato
         and (c.primeira_mensagem_em is null or c.primeira_mensagem_em > v_momento);

      return query select v_msg, v_conv, true;
      return;
    end if;

    -- outra chamada gravou o mesmo id agora ha pouco
    select m.id, m.conversa_id into v_msg, v_conv
    from public.mensagens m
    where m.conexao_id = p_conexao and m.id_externo = v_id_ext;
  end if;

  if coalesce((p_msg ->> 'editada')::boolean, false) then
    update public.mensagens m
       set texto = p_msg ->> 'texto', editada = true
     where m.id = v_msg;
  end if;
  if coalesce((p_msg ->> 'apagada')::boolean, false) then
    update public.mensagens m
       set apagada_em = coalesce(m.apagada_em, now())
     where m.id = v_msg;
  end if;

  return query select v_msg, v_conv, false;
end;
$$;


ALTER FUNCTION public.registrar_entrada(p_conexao uuid, p_ids jsonb, p_nome_whatsapp text, p_msg jsonb) OWNER TO postgres;

--
-- Name: registrar_saida_celular(uuid, jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.registrar_saida_celular(p_conexao uuid, p_ids jsonb, p_msg jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_id_ext  text := nullif(btrim(coalesce(p_msg ->> 'id_externo', '')), '');
  v_gw      text := nullif(btrim(coalesce(p_msg ->> 'id_gateway', '')), '');
  v_ref     text := nullif(btrim(coalesce(p_msg ->> 'midia_ref_externa', '')), '');
  v_texto   text := public.texto_normalizado(p_msg ->> 'texto');
  v_tipo    public.mensagem_tipo := public.tipo_de_mensagem(p_msg ->> 'tipo');
  v_cita    text := nullif(btrim(coalesce(p_msg ->> 'responde_a_id_externo', '')), '');
  v_resp    uuid;
  v_momento timestamptz;
  v_contato uuid;
  v_conv    uuid;
  v_msg     uuid;
begin
  if v_id_ext is null or nullif(p_msg ->> 'tipo', '') is null or nullif(p_msg ->> 'momento', '') is null then
    raise exception using message = 'mensagem_invalida', errcode = 'P0001';
  end if;
  v_momento := (p_msg ->> 'momento')::timestamptz;

  select m.id into v_msg
  from public.mensagens m
  where m.conexao_id = p_conexao and m.id_externo = v_id_ext;
  if v_msg is not null then
    return v_msg;
  end if;

  -- conhecida pelo id do gateway (o envio devolveu so esse id)
  if v_gw is not null then
    select m.id into v_msg
    from public.mensagens m
    where m.conexao_id = p_conexao and m.direcao = 'saida' and m.id_gateway = v_gw
    order by m.criado_em desc, m.id
    limit 1
    for update;
    if v_msg is not null then
      update public.mensagens m
         set id_externo = v_id_ext
       where m.id = v_msg and m.id_externo is null;
      return v_msg;
    end if;
  end if;

  v_contato := public.contato_por_ids(p_conexao, p_ids, null);
  v_conv := public.conversa_do_contato(v_contato, p_conexao);

  -- eco do nosso envio
  select m.id into v_msg
  from public.mensagens m
  where m.conversa_id = v_conv
    and m.direcao = 'saida'
    and m.origem in ('janete', 'humano_tela')
    and m.status in ('enviando', 'enviada')
    and m.id_externo is null
    and public.texto_normalizado(m.texto) is not distinct from v_texto
    and (v_texto is not null
         or (m.tipo = v_tipo
             and (nullif(p_msg ->> 'midia_nome', '') is null or m.midia_nome = p_msg ->> 'midia_nome')
             and (nullif(p_msg ->> 'midia_mime', '') is null or m.midia_mime = p_msg ->> 'midia_mime')))
    and coalesce(m.status_em, m.criado_em) > now() - interval '60 seconds'
  order by m.criado_em, m.ordem nulls last, m.id
  limit 1
  for update;

  if v_msg is not null then
    update public.mensagens m
       set id_externo = v_id_ext,
           id_gateway = coalesce(m.id_gateway, nullif(p_msg ->> 'id_gateway', ''))
     where m.id = v_msg;
    return v_msg;
  end if;

  -- novo: a citação, pela mesma conexão
  if v_cita is not null then
    select m.id into v_resp
    from public.mensagens m
    where m.conexao_id = p_conexao and m.id_externo = v_cita;
  end if;

  insert into public.mensagens (
    conversa_id, conexao_id, direcao, origem, tipo, texto, status, status_em,
    midia_ref_externa, midia_mime, midia_nome, midia_tamanho, midia_status,
    id_externo, id_gateway, momento, evento_id, responde_a_id)
  values (
    v_conv, p_conexao, 'saida', 'humano_celular', v_tipo,
    p_msg ->> 'texto', 'enviada', v_momento,
    v_ref, p_msg ->> 'midia_mime', p_msg ->> 'midia_nome',
    (nullif(p_msg ->> 'midia_tamanho', ''))::bigint,
    case when v_ref is not null then 'pendente'::public.midia_status end,
    v_id_ext, v_gw, v_momento,
    (nullif(p_msg ->> 'evento_id', ''))::bigint,
    v_resp)
  on conflict (conexao_id, id_externo) where id_externo is not null do nothing
  returning id into v_msg;

  if v_msg is null then
    select m.id into v_msg
    from public.mensagens m
    where m.conexao_id = p_conexao and m.id_externo = v_id_ext;
  end if;
  return v_msg;
end;
$$;


ALTER FUNCTION public.registrar_saida_celular(p_conexao uuid, p_ids jsonb, p_msg jsonb) OWNER TO postgres;

--
-- Name: reordenar_etapas(uuid[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reordenar_etapas(p_ids uuid[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_qtd      int;
  v_achadas  int;
  v_abertas  int;
  v_posicoes int[];
begin
  if not coalesce(public.eh_admin(), false) then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;
  v_qtd := coalesce(cardinality(p_ids), 0);
  if v_qtd = 0 then
    return;
  end if;
  if array_position(p_ids, null) is not null
     or (select count(distinct x) from unnest(p_ids) as x) <> v_qtd then
    raise exception using message = 'nao_encontrado', errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtext('janete.etapas'));
  perform 1 from public.etapas e where e.id = any (p_ids) for update;

  select count(*), count(*) filter (where e.tipo = 'aberta'), array_agg(e.ordem order by e.ordem, e.id)
    into v_achadas, v_abertas, v_posicoes
    from public.etapas e
   where e.id = any (p_ids);
  if v_achadas <> v_qtd then
    raise exception using message = 'nao_encontrado', errcode = 'P0001';
  end if;
  if v_abertas <> 0 and v_abertas <> v_achadas then
    raise exception using message = 'sem_permissao', errcode = 'P0001';
  end if;

  update public.etapas e
     set ordem = v_posicoes[k.pos]
    from unnest(p_ids) with ordinality as k (id, pos)
   where e.id = k.id
     and e.ordem is distinct from v_posicoes[k.pos];
end;
$$;


ALTER FUNCTION public.reordenar_etapas(p_ids uuid[]) OWNER TO postgres;

--
-- Name: rodada_rodando(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.rodada_rodando(p_rodada uuid) RETURNS public.rodadas
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_r public.rodadas;
begin
  select * into v_r from public.rodadas r where r.id = p_rodada for update;
  if not found or v_r.status <> 'rodando' then
    raise exception using message = 'rodada_nao_rodando', errcode = 'P0001';
  end if;
  return v_r;
end;
$$;


ALTER FUNCTION public.rodada_rodando(p_rodada uuid) OWNER TO postgres;

--
-- Name: texto_busca(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.texto_busca(p_texto text) RETURNS text
    LANGUAGE sql IMMUTABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select btrim(regexp_replace(
    lower(translate(
      p_texto,
      'ÁÀÂÃÄÅáàâãäåÇçÉÈÊËéèêëÍÌÎÏíìîïÑñÓÒÔÕÖóòôõöÚÙÛÜúùûüÝýÿ',
      'AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiNnOOOOOoooooUUUUuuuuYyy'
    )),
    '\s+', ' ', 'g'
  ))
$$;


ALTER FUNCTION public.texto_busca(p_texto text) OWNER TO postgres;

--
-- Name: texto_normalizado(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.texto_normalizado(p_texto text) RETURNS text
    LANGUAGE sql IMMUTABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select nullif(regexp_replace(btrim(coalesce(p_texto, ''), E' \t\r\n'), '\s+', ' ', 'g'), '')
$$;


ALTER FUNCTION public.texto_normalizado(p_texto text) OWNER TO postgres;

--
-- Name: tg_auth_primeira_conta(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_auth_primeira_conta() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  perform pg_advisory_xact_lock(hashtext('janete.primeira_conta'));
  if new.email is not null and not exists (select 1 from public.membros) then
    insert into public.membros (user_id, nome, email, papel)
    values (
      new.id,
      coalesce(nullif(btrim(new.raw_user_meta_data ->> 'nome'), ''),
               nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
               nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
               lower(btrim(new.email))),
      lower(btrim(new.email)),
      'admin'
    );
  end if;
  return null;
end;
$$;


ALTER FUNCTION public.tg_auth_primeira_conta() OWNER TO postgres;

--
-- Name: tg_conexoes_desativar(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_conexoes_desativar() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if old.ativa and not new.ativa then
    new.segredos := '{}'::jsonb;
  end if;
  return new;
end;
$$;


ALTER FUNCTION public.tg_conexoes_desativar() OWNER TO postgres;

--
-- Name: tg_conexoes_eventos(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_conexoes_eventos() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_membro uuid;
begin
  if new.status is not distinct from old.status and new.ativa is not distinct from old.ativa then
    return null;
  end if;
  if auth.uid() is not null then
    select m.id into v_membro from public.membros m where m.user_id = auth.uid();
  end if;
  insert into public.conexao_eventos (conexao_id, status_de, status_para, ativa_de, ativa_para, ultimo_erro, ator_membro_id)
  values (new.id, old.status, new.status, old.ativa, new.ativa, new.ultimo_erro, v_membro);
  return null;
end;
$$;


ALTER FUNCTION public.tg_conexoes_eventos() OWNER TO postgres;

--
-- Name: tg_conexoes_segredos_formato(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_conexoes_segredos_formato() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
begin
  if new.segredos is not null and (
       jsonb_typeof(new.segredos) <> 'object'
       or jsonb_path_exists(
            new.segredos,
            'strict $.* ? (@.type() != "string" || !(@ like_regex "^v[0-9]+:[A-Za-z0-9+/]+={0,2}:[A-Za-z0-9+/]+={0,2}$"))',
            '{}'::jsonb,
            true)
       or jsonb_path_exists(
            new.segredos,
            'strict $.keyvalue() ? (!(@.key like_regex "^[a-z][A-Za-z0-9_]{0,39}$"))',
            '{}'::jsonb,
            true)
     ) then
    raise exception using message = 'segredo_fora_do_formato', errcode = '23514';
  end if;
  return new;
end;
$_$;


ALTER FUNCTION public.tg_conexoes_segredos_formato() OWNER TO postgres;

--
-- Name: tg_contatos_antes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_contatos_antes() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_arquivada boolean;
begin
  if tg_op = 'INSERT' then
    if new.etapa_id is null then
      -- FOR SHARE: conflita com o UPDATE que arquiva a etapa e põe os dois em fila
      -- (a trava da chave estrangeira sozinha não conflita).
      select e.id into new.etapa_id
      from public.etapas e
      where e.tipo = 'aberta' and not e.arquivada
      order by e.ordem, e.criado_em, e.id
      limit 1
      for share;
      if new.etapa_id is null then
        raise exception using message = 'sem_etapa_de_entrada', errcode = 'P0001';
      end if;
    end if;
  else
    new.atualizado_em := now();
    if new.etapa_id is not distinct from old.etapa_id then
      return new;
    end if;
    new.etapa_desde := now();
  end if;

  if new.etapa_id is not null then
    select e.arquivada into v_arquivada
    from public.etapas e where e.id = new.etapa_id
    for share;
    if coalesce(v_arquivada, false) then
      raise exception using message = 'etapa_arquivada', errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;


ALTER FUNCTION public.tg_contatos_antes() OWNER TO postgres;

--
-- Name: tg_contatos_historico(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_contatos_historico() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_rodada uuid;
  v_membro uuid;
  v_ator public.historico_ator;
begin
  if tg_op = 'UPDATE' and new.etapa_id is not distinct from old.etapa_id then
    return null;
  end if;

  v_rodada := nullif(current_setting('janete.rodada_id', true), '')::uuid;
  if v_rodada is not null then
    v_ator := 'janete';
  else
    if auth.uid() is not null then
      select m.id into v_membro from public.membros m where m.user_id = auth.uid();
    end if;
    v_ator := case when v_membro is not null then 'membro' else 'sistema' end;
  end if;

  insert into public.contato_etapa_historico (contato_id, de_etapa_id, para_etapa_id, ator, membro_id, rodada_id)
  values (
    new.id,
    case when tg_op = 'UPDATE' then old.etapa_id end,
    new.etapa_id,
    v_ator,
    v_membro,
    v_rodada
  );
  return null;
end;
$$;


ALTER FUNCTION public.tg_contatos_historico() OWNER TO postgres;

--
-- Name: tg_contexto_autor(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_contexto_autor() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if new.criado_por is null and auth.uid() is not null then
    select m.id into new.criado_por from public.membros m where m.user_id = auth.uid();
  end if;
  return new;
end;
$$;


ALTER FUNCTION public.tg_contexto_autor() OWNER TO postgres;

--
-- Name: tg_contexto_numerar(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_contexto_numerar() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  perform pg_advisory_xact_lock(hashtext('janete.contexto'));
  select coalesce(max(cv.numero), 0) + 1 into new.numero from public.contexto_versoes cv;
  return new;
end;
$$;


ALTER FUNCTION public.tg_contexto_numerar() OWNER TO postgres;

--
-- Name: tg_etapas_arquivar(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_etapas_arquivar() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_saindo boolean;
  v_perde_aberta boolean;
begin
  v_saindo := tg_op = 'DELETE' or (new.arquivada and not old.arquivada);
  v_perde_aberta := old.tipo = 'aberta' and not old.arquivada
    and (tg_op = 'DELETE' or new.arquivada or new.tipo <> 'aberta');

  if v_saindo or v_perde_aberta then
    perform pg_advisory_xact_lock(hashtext('janete.etapas'));
  end if;

  if v_saindo and exists (select 1 from public.contatos c where c.etapa_id = old.id) then
    raise exception using message = 'etapa_com_leads', errcode = 'P0001';
  end if;

  if v_perde_aberta and not exists (
    select 1 from public.etapas e
    where e.id <> old.id and e.tipo = 'aberta' and not e.arquivada
  ) then
    raise exception using message = 'sem_etapa_de_entrada', errcode = 'P0001';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;


ALTER FUNCTION public.tg_etapas_arquivar() OWNER TO postgres;

--
-- Name: tg_ia_chaves_formato(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_ia_chaves_formato() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
begin
  if new.chave_cifrada is not null
     and new.chave_cifrada !~ '^v[0-9]+:[A-Za-z0-9+/]+={0,2}:[A-Za-z0-9+/]+={0,2}$' then
    raise exception using message = 'segredo_fora_do_formato', errcode = '23514';
  end if;
  return new;
end;
$_$;


ALTER FUNCTION public.tg_ia_chaves_formato() OWNER TO postgres;

--
-- Name: tg_membros_normalizar(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_membros_normalizar() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  new.email := lower(btrim(new.email));
  return new;
end;
$$;


ALTER FUNCTION public.tg_membros_normalizar() OWNER TO postgres;

--
-- Name: tg_membros_ultimo_admin(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_membros_ultimo_admin() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  if old.papel = 'admin' and old.ativo and old.user_id is not null
     and (tg_op = 'DELETE' or new.papel <> 'admin' or not new.ativo or new.user_id is null) then
    perform pg_advisory_xact_lock(hashtext('janete.membros_admin'));
    if not exists (
      select 1 from public.membros m
      where m.id <> old.id and m.papel = 'admin' and m.ativo and m.user_id is not null
    ) then
      raise exception using message = 'ultimo_admin', errcode = 'P0001';
    end if;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;


ALTER FUNCTION public.tg_membros_ultimo_admin() OWNER TO postgres;

--
-- Name: tg_mensagens_antes_inserir(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_mensagens_antes_inserir() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_ativa uuid;
  v_oficial boolean;
  v_a_enviar boolean;
  v_ultima_lead timestamptz;
begin
  if new.origem = 'humano_tela' and new.autor_membro_id is null and auth.uid() is not null then
    select m.id into new.autor_membro_id
    from public.membros m where m.user_id = auth.uid() and m.ativo;
  end if;

  if new.midia_status is null then
    if new.midia_ref_externa is not null then
      new.midia_status := 'pendente';
    elsif new.midia_caminho is not null then
      new.midia_status := 'copiada';
    end if;
  end if;

  if new.direcao = 'saida' then
    v_a_enviar := new.status in ('na_fila', 'enviando');
    select c.id, c.oficial into v_ativa, v_oficial from public.conexoes c where c.ativa;

    if v_a_enviar then
      -- Sai sempre pelo número ativo.
      if v_ativa is null then
        raise exception using message = 'sem_conexao_ativa', errcode = 'P0001';
      end if;
      new.conexao_id := v_ativa;

      if v_oficial and new.origem <> 'humano_celular' then
        select cv.ultima_do_lead_em into v_ultima_lead
        from public.conversas cv where cv.id = new.conversa_id;
        if v_ultima_lead is null or v_ultima_lead + interval '24 hours' <= now() then
          raise exception using message = 'janela_fechada', errcode = 'P0001';
        end if;
      end if;

      if new.status = 'na_fila' and new.enviar_apos is null then
        new.enviar_apos := now();
      end if;
    elsif new.conexao_id is null then
      new.conexao_id := coalesce(
        v_ativa,
        (select cv.conexao_id from public.conversas cv where cv.id = new.conversa_id)
      );
      if new.conexao_id is null then
        raise exception using message = 'sem_conexao_ativa', errcode = 'P0001';
      end if;
    end if;
  end if;
  return new;
end;
$$;


ALTER FUNCTION public.tg_mensagens_antes_inserir() OWNER TO postgres;

--
-- Name: tg_mensagens_apos_atualizar(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_mensagens_apos_atualizar() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_valia boolean := old.status <> 'cancelada' and old.apagada_em is null;
  v_vale boolean := new.status <> 'cancelada' and new.apagada_em is null;
  v_ult uuid;
  v_ult_em timestamptz;
  v_refaz boolean;
  v_m record;
begin
  if new.origem = 'janete'
     and new.status in ('enviada', 'entregue', 'lida')
     and old.status not in ('enviada', 'entregue', 'lida') then
    update public.conversas c
       set ultima_da_janete_em = greatest(c.ultima_da_janete_em, new.momento)
     where c.id = new.conversa_id
       and (c.ultima_da_janete_em is null or c.ultima_da_janete_em < new.momento);
  end if;

  select c.ultima_mensagem_id, c.ultima_mensagem_em into v_ult, v_ult_em
    from public.conversas c where c.id = new.conversa_id;
  if not found then
    return null;
  end if;

  v_refaz := case
    when v_valia and not v_vale then v_ult is null or v_ult = new.id
    when v_vale and not v_valia then v_ult is null or v_ult_em is null or new.momento >= v_ult_em
    else v_ult is null and v_ult_em is not null
  end;
  if not v_refaz then
    return null;
  end if;

  -- Vai refazer: trava a conversa (como o gatilho de inserir) e confere de novo.
  -- Uma mensagem nova que entrou enquanto isso (o lead apagou e mandou outra) já
  -- aparece aqui, e a escolha abaixo não grava a anterior por cima dela. Só trava
  -- quando vai refazer: a troca de status comum (pegar_envios, atualizar_status)
  -- continua sem trava na conversa.
  perform 1 from public.conversas c where c.id = new.conversa_id for update;
  select c.ultima_mensagem_id, c.ultima_mensagem_em into v_ult, v_ult_em
    from public.conversas c where c.id = new.conversa_id;
  if not found then
    return null;
  end if;
  v_refaz := case
    when v_valia and not v_vale then v_ult is null or v_ult = new.id
    when v_vale and not v_valia then v_ult is null or v_ult_em is null or new.momento >= v_ult_em
    else v_ult is null and v_ult_em is not null
  end;
  if not v_refaz then
    return null;
  end if;

  select m.id, m.momento,
         left(coalesce(nullif(btrim(m.texto), ''), '[' || m.tipo::text || ']'), 140) as previa
    into v_m
    from public.mensagens m
   where m.conversa_id = new.conversa_id
     and m.status <> 'cancelada'
     and m.apagada_em is null
   order by m.momento desc, m.criado_em desc, m.ordem desc nulls last, m.id desc
   limit 1;

  if found then
    update public.conversas c
       set ultima_mensagem_id = v_m.id,
           ultima_mensagem_em = v_m.momento,
           ultima_mensagem_preview = v_m.previa
     where c.id = new.conversa_id;
  else
    -- nenhuma vale: sem prévia (a hora da última atividade fica)
    update public.conversas c
       set ultima_mensagem_id = null,
           ultima_mensagem_preview = null
     where c.id = new.conversa_id
       and (c.ultima_mensagem_id is not null or c.ultima_mensagem_preview is not null);
  end if;
  return null;
end;
$$;


ALTER FUNCTION public.tg_mensagens_apos_atualizar() OWNER TO postgres;

--
-- Name: tg_mensagens_apos_inserir(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_mensagens_apos_inserir() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_conv public.conversas%rowtype;
  v_espera integer;
  v_teto integer;
  v_primeira timestamptz;
  v_de text;
  v_canceladas integer;
begin
  select * into v_conv from public.conversas c where c.id = new.conversa_id for update;
  if not found then
    return null;
  end if;

  -- Prévia: só a mensagem mais recente (pelo momento) e não cancelada.
  if new.status <> 'cancelada'
     and (v_conv.ultima_mensagem_em is null or new.momento >= v_conv.ultima_mensagem_em) then
    v_conv.ultima_mensagem_em := new.momento;
    v_conv.ultima_mensagem_id := new.id; -- novo
    v_conv.ultima_mensagem_preview := left(
      coalesce(nullif(btrim(new.texto), ''), '[' || new.tipo::text || ']'), 140);
  end if;

  if new.direcao = 'entrada' then
    v_conv.nao_lidas := v_conv.nao_lidas + 1;
    v_conv.ultima_do_lead_em := greatest(v_conv.ultima_do_lead_em, new.momento);
    if v_conv.modo = 'janete' then
      select cf.espera_lote_s, cf.espera_lote_max_s into v_espera, v_teto
      from public.configuracao cf where cf.id = 1;
      -- 1ª pendente do lote. Sem nada armado, o lote começa nesta mensagem. Senão,
      -- conta só as entradas soltas que chegaram depois da última rodada: as que
      -- ficaram soltas no modo humano ou numa rodada que falhou ou foi cancelada
      -- não podem puxar o teto para o passado. Um armado vencido há mais que o teto
      -- (a conversa esperou armada sem conexão ativa ou com a janela oficial
      -- fechada) conta como nada armado: o lote recomeça nesta mensagem.
      if v_conv.responder_apos is not null
         and v_conv.responder_apos < now() - make_interval(secs => coalesce(v_teto, 60)) then
        v_conv.responder_apos := null;
      end if;
      if v_conv.responder_apos is null then
        v_primeira := now();
      else
        select min(m.criado_em) into v_primeira
        from public.mensagens m
        where m.conversa_id = new.conversa_id and m.direcao = 'entrada' and m.rodada_id is null
          and m.criado_em > coalesce((select max(r.iniciada_em) from public.rodadas r
                                      where r.conversa_id = new.conversa_id), '-infinity'::timestamptz);
      end if;
      -- 8 s que recomeçam a cada mensagem, com teto de 60 s desde a 1ª pendente.
      -- Um re-armado que já está mais adiante (falha passageira: +30 s) é mantido.
      v_conv.responder_apos := greatest(
        coalesce(v_conv.responder_apos, '-infinity'::timestamptz),
        least(
          now() + make_interval(secs => coalesce(v_espera, 8)),
          coalesce(v_primeira, now()) + make_interval(secs => coalesce(v_teto, 60))
        )
      );
    elsif v_conv.responsavel_id is null and v_conv.aguardando_humano_desde is null then
      -- novo (decisão 4): conversa humana sem ninguém (atendida pelo celular): o lead
      -- que escreve entra em "Precisam de você".
      v_conv.aguardando_humano_desde := now();
    end if;
  elsif new.origem in ('humano_tela', 'humano_celular') then
    -- novo: de onde a conversa vem, antes de mudar.
    v_de := case when v_conv.modo = 'janete' then 'janete'
                 when v_conv.responsavel_id is not null then 'outro'
                 when v_conv.aguardando_humano_desde is null then 'celular'
                 else 'espera' end;
    if new.origem = 'humano_tela' and v_de <> 'outro' then
      -- Mandar pela tela tira a conversa da Janete, da espera ou do celular (com outra
      -- pessoa, o responsável continua quem estava: não é assumir).
      insert into public.conversa_eventos (conversa_id, tipo, membro_id, de, por_envio)
      values (new.conversa_id, 'assumiu', new.autor_membro_id, v_de, true);
    elsif new.origem = 'humano_celular' and v_de in ('janete', 'espera') then
      -- O celular tirou a conversa da Janete ou da espera (já no celular ou com uma
      -- pessoa, não muda de mãos: sem evento).
      insert into public.conversa_eventos (conversa_id, tipo, de)
      values (new.conversa_id, 'celular', v_de);
    end if;

    if new.origem = 'humano_tela' and v_conv.responsavel_id is null
       and new.autor_membro_id is not null then
      -- novo: a conversa vai para quem mandou. Espera o desativar_membro que
      -- estiver rodando (for update no membro) e confere de novo que a pessoa
      -- continua ativa; senão ela ficaria com uma conversa depois de desativada.
      perform 1 from public.membros mb
       where mb.id = new.autor_membro_id and mb.ativo
         for share;
      if not found then
        raise exception using message = 'sem_acesso', errcode = 'P0001';
      end if;
    end if;
    if v_conv.modo = 'janete' then
      v_conv.motivo_humano := new.origem::text::public.motivo_humano;
    end if;
    v_conv.modo := 'humano';
    v_conv.responsavel_id := coalesce(v_conv.responsavel_id, new.autor_membro_id);
    v_conv.aguardando_humano_desde := null;
    v_conv.responder_apos := null;
    update public.mensagens m
    set status = 'cancelada', status_em = now()
    where m.conversa_id = new.conversa_id and m.origem = 'janete' and m.status = 'na_fila';
    get diagnostics v_canceladas = row_count;
    if v_canceladas > 0 then
      -- novo: o gatilho mensagens_apos_atualizar pode ter refeito a prévia sem as
      -- canceladas (só quando a cancelada era a última); vale a da tabela. Quando
      -- a última era outra, a tabela ainda tem a prévia de antes desta mensagem:
      -- a regra da mensagem nova vale de novo por cima.
      select c.ultima_mensagem_em, c.ultima_mensagem_id, c.ultima_mensagem_preview
        into v_conv.ultima_mensagem_em, v_conv.ultima_mensagem_id, v_conv.ultima_mensagem_preview
        from public.conversas c where c.id = new.conversa_id;
      if new.status <> 'cancelada'
         and (v_conv.ultima_mensagem_em is null or new.momento >= v_conv.ultima_mensagem_em) then
        v_conv.ultima_mensagem_em := new.momento;
        v_conv.ultima_mensagem_id := new.id;
        v_conv.ultima_mensagem_preview := left(
          coalesce(nullif(btrim(new.texto), ''), '[' || new.tipo::text || ']'), 140);
      end if;
    end if;
    -- A rodada que ainda está rodando foi atropelada pelo humano: fica 'cancelada'
    -- (o concluir_rodada grava as respostas dela como canceladas) e solta as entradas.
    with canceladas as (
      update public.rodadas r
         set status = 'cancelada', terminada_em = now()
       where r.conversa_id = new.conversa_id and r.status = 'rodando'
      returning r.id
    )
    update public.mensagens m
       set rodada_id = null
      from canceladas k
     where m.rodada_id = k.id and m.direcao = 'entrada';
  end if;

  update public.conversas c
  set ultima_mensagem_em = v_conv.ultima_mensagem_em,
      ultima_mensagem_id = v_conv.ultima_mensagem_id,
      ultima_mensagem_preview = v_conv.ultima_mensagem_preview,
      nao_lidas = v_conv.nao_lidas,
      ultima_do_lead_em = v_conv.ultima_do_lead_em,
      responder_apos = v_conv.responder_apos,
      modo = v_conv.modo,
      motivo_humano = v_conv.motivo_humano,
      responsavel_id = v_conv.responsavel_id,
      aguardando_humano_desde = v_conv.aguardando_humano_desde
  where c.id = new.conversa_id;
  return null;
end;
$$;


ALTER FUNCTION public.tg_mensagens_apos_inserir() OWNER TO postgres;

--
-- Name: tg_mensagens_envio_falhou(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_mensagens_envio_falhou() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_modo public.conversa_modo;
begin
  select c.modo into v_modo from public.conversas c where c.id = new.conversa_id for update;

  if v_modo is distinct from 'janete' then
    return null;
  end if;

  update public.conversas c
     set modo = 'humano',
         aguardando_humano_desde = now(),
         motivo_humano = 'envio_falhou',
         responder_apos = null
   where c.id = new.conversa_id;

  -- a Janete para nela: as outras bolhas dela na fila não saem
  update public.mensagens m
     set status = 'cancelada', status_em = now()
   where m.id in (select f.id
                    from public.mensagens f
                   where f.conversa_id = new.conversa_id
                     and f.origem = 'janete' and f.status = 'na_fila'
                     for update skip locked);

  -- a Janete para nela: a rodada que ainda roda nessa conversa é cancelada e solta as entradas
  with canceladas as (
    update public.rodadas r
       set status = 'cancelada', terminada_em = now()
     where r.id in (select k.id
                      from public.rodadas k
                     where k.conversa_id = new.conversa_id
                       and k.status = 'rodando' and not k.passou_humano
                       for update skip locked)
    returning r.id
  )
  update public.mensagens m
     set rodada_id = null
   where m.id in (select e.id
                    from public.mensagens e
                    join canceladas k on k.id = e.rodada_id
                   where e.direcao = 'entrada'
                     for update of e skip locked);

  if new.rodada_id is not null then
    update public.rodadas r set foi_para_equipe = true where r.id = new.rodada_id;
  end if;

  insert into public.conversa_eventos (conversa_id, tipo, motivo)
  values (new.conversa_id, 'passou', 'envio_falhou');

  return null;
end;
$$;


ALTER FUNCTION public.tg_mensagens_envio_falhou() OWNER TO postgres;

--
-- Name: tg_tocar_atualizada_em(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_tocar_atualizada_em() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  new.atualizada_em := now();
  return new;
end;
$$;


ALTER FUNCTION public.tg_tocar_atualizada_em() OWNER TO postgres;

--
-- Name: tg_tocar_atualizado_em(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tg_tocar_atualizado_em() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;


ALTER FUNCTION public.tg_tocar_atualizado_em() OWNER TO postgres;

--
-- Name: tipo_de_mensagem(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.tipo_de_mensagem(p_tipo text) RETURNS public.mensagem_tipo
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select case when p_tipo = any (enum_range(null::public.mensagem_tipo)::text[])
              then p_tipo::public.mensagem_tipo
              else 'outro'::public.mensagem_tipo
         end
$$;


ALTER FUNCTION public.tipo_de_mensagem(p_tipo text) OWNER TO postgres;

--
-- Name: trocar_papel_membro(uuid, public.papel_membro); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trocar_papel_membro(p_membro uuid, p_papel public.papel_membro) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
declare
  v_eu   uuid;
  v_alvo public.membros%rowtype;
begin
  if not coalesce(public.eh_admin(), false) then
    raise exception using message = 'sem_acesso', errcode = 'P0001';
  end if;
  v_eu := public.membro_atual();
  if p_membro = v_eu then
    raise exception using message = 'proprio_membro', errcode = 'P0001';
  end if;
  if p_papel is null then
    raise exception using message = 'nao_encontrado', errcode = 'P0001';
  end if;

  select m.* into v_alvo from public.membros m where m.id = p_membro for update;
  if not found then
    raise exception using message = 'nao_encontrado', errcode = 'P0001';
  end if;
  if v_alvo.papel = p_papel then
    return;
  end if;

  update public.membros m set papel = p_papel where m.id = p_membro;

  insert into public.auditoria (ator_membro_id, acao, alvo, detalhe)
  values (v_eu, 'membro_papel_trocado', p_membro::text,
          jsonb_build_object('nome', v_alvo.nome, 'de', v_alvo.papel, 'para', p_papel));
end;
$$;


ALTER FUNCTION public.trocar_papel_membro(p_membro uuid, p_papel public.papel_membro) OWNER TO postgres;

--
-- Name: auditoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria (
    id bigint NOT NULL,
    ator_membro_id uuid,
    acao public.auditoria_acao NOT NULL,
    alvo text,
    ultimos4 text,
    detalhe jsonb DEFAULT '{}'::jsonb NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.auditoria OWNER TO postgres;

--
-- Name: auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auditoria ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.auditoria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: conexao_eventos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conexao_eventos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conexao_id uuid NOT NULL,
    status_de public.conexao_status,
    status_para public.conexao_status NOT NULL,
    ativa_de boolean,
    ativa_para boolean NOT NULL,
    ultimo_erro text,
    ator_membro_id uuid,
    criado_em timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.conexao_eventos OWNER TO postgres;

--
-- Name: conexoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conexoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    gateway public.gateway NOT NULL,
    nome text NOT NULL,
    id_externo text NOT NULL,
    parametros jsonb DEFAULT '{}'::jsonb NOT NULL,
    segredos jsonb DEFAULT '{}'::jsonb NOT NULL,
    status public.conexao_status DEFAULT 'conectando'::public.conexao_status NOT NULL,
    ultimo_erro text,
    ativa boolean DEFAULT false NOT NULL,
    criado_por uuid,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    oficial boolean GENERATED ALWAYS AS ((gateway = ANY (ARRAY['meta'::public.gateway, 'zernio'::public.gateway]))) STORED,
    CONSTRAINT conexoes_parametros_check CHECK ((jsonb_typeof(parametros) = 'object'::text)),
    CONSTRAINT conexoes_segredos_check CHECK ((jsonb_typeof(segredos) = 'object'::text)),
    CONSTRAINT conexoes_segredos_formato CHECK (((NOT jsonb_path_exists(segredos, 'strict $.*?(@.type() != "string" || !(@ like_regex "^v[0-9]+:[A-Za-z0-9+/]+={0,2}:[A-Za-z0-9+/]+={0,2}$"))'::jsonpath, '{}'::jsonb, true)) AND (NOT jsonb_path_exists(segredos, 'strict $.keyvalue()?(!(@."key" like_regex "^[a-z][A-Za-z0-9_]{0,39}$"))'::jsonpath, '{}'::jsonb, true))))
);


ALTER TABLE public.conexoes OWNER TO postgres;

--
-- Name: configuracao; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuracao (
    id smallint DEFAULT 1 NOT NULL,
    espera_lote_s integer DEFAULT 8 NOT NULL,
    espera_lote_max_s integer DEFAULT 60 NOT NULL,
    onboarding_concluido_em timestamp with time zone,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    worker_visto_em timestamp with time zone,
    voz_resposta text DEFAULT 'quando_audio'::text NOT NULL,
    voz_id text,
    voz_nome text,
    voz_erro text,
    CONSTRAINT configuracao_check CHECK ((espera_lote_max_s >= espera_lote_s)),
    CONSTRAINT configuracao_espera_lote_s_check CHECK ((espera_lote_s > 0)),
    CONSTRAINT configuracao_id_check CHECK ((id = 1)),
    CONSTRAINT configuracao_ritmo CHECK (((espera_lote_s >= 2) AND (espera_lote_s <= 30) AND ((espera_lote_max_s >= 20) AND (espera_lote_max_s <= 120)) AND (espera_lote_max_s >= (espera_lote_s + 5)))),
    CONSTRAINT configuracao_voz_erro CHECK (((voz_erro IS NULL) OR (voz_erro = 'voz_nao_encontrada'::text))),
    CONSTRAINT configuracao_voz_id CHECK (((voz_id IS NULL) OR (voz_id ~ '^[A-Za-z0-9_-]{1,64}$'::text))),
    CONSTRAINT configuracao_voz_nome CHECK ((((voz_id IS NULL) AND (voz_nome IS NULL)) OR ((voz_id IS NOT NULL) AND (voz_nome IS NOT NULL) AND ((char_length(voz_nome) >= 1) AND (char_length(voz_nome) <= 120)) AND (btrim(voz_nome) <> ''::text)))),
    CONSTRAINT configuracao_voz_resposta CHECK ((voz_resposta = ANY (ARRAY['quando_audio'::text, 'sempre'::text, 'nunca'::text])))
);


ALTER TABLE public.configuracao OWNER TO postgres;

--
-- Name: contato_etapa_historico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contato_etapa_historico (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contato_id uuid NOT NULL,
    de_etapa_id uuid,
    para_etapa_id uuid NOT NULL,
    ator public.historico_ator NOT NULL,
    membro_id uuid,
    rodada_id uuid,
    criado_em timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.contato_etapa_historico OWNER TO postgres;

--
-- Name: contato_identificadores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contato_identificadores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contato_id uuid NOT NULL,
    tipo public.identificador_tipo NOT NULL,
    valor text NOT NULL,
    conexao_id uuid,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contato_identificadores_valor_check CHECK ((valor <> ''::text))
);


ALTER TABLE public.contato_identificadores OWNER TO postgres;

--
-- Name: contatos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contatos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text,
    nome_whatsapp text,
    telefone text,
    email text,
    empresa text,
    observacoes text,
    resumo_janete text,
    etapa_id uuid NOT NULL,
    etapa_desde timestamp with time zone DEFAULT now() NOT NULL,
    primeira_mensagem_em timestamp with time zone,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    resumo_janete_em timestamp with time zone,
    anotacoes_janete jsonb,
    CONSTRAINT contatos_anotacoes_janete_objeto CHECK (((anotacoes_janete IS NULL) OR (jsonb_typeof(anotacoes_janete) = 'object'::text))),
    CONSTRAINT contatos_telefone_check CHECK (((telefone IS NULL) OR (telefone ~ '^[0-9]+$'::text)))
);


ALTER TABLE public.contatos OWNER TO postgres;

--
-- Name: contexto_versoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contexto_versoes (
    id bigint NOT NULL,
    empresa_oferta text DEFAULT ''::text NOT NULL,
    cliente_ideal text DEFAULT ''::text NOT NULL,
    preco text DEFAULT ''::text NOT NULL,
    diferenciais text DEFAULT ''::text NOT NULL,
    objecoes text DEFAULT ''::text NOT NULL,
    quando_passar_humano text DEFAULT ''::text NOT NULL,
    tom_voz text DEFAULT ''::text NOT NULL,
    horario text DEFAULT ''::text NOT NULL,
    itens jsonb DEFAULT '[]'::jsonb NOT NULL,
    origem public.contexto_origem DEFAULT 'edicao'::public.contexto_origem NOT NULL,
    criado_por uuid,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    numero integer,
    restaurada_de bigint,
    CONSTRAINT contexto_versoes_itens_check CHECK ((jsonb_typeof(itens) = 'array'::text))
);


ALTER TABLE public.contexto_versoes OWNER TO postgres;

--
-- Name: contexto_versoes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.contexto_versoes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.contexto_versoes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: conversa_eventos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversa_eventos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversa_id uuid NOT NULL,
    tipo public.conversa_evento_tipo NOT NULL,
    membro_id uuid,
    de text,
    de_membro_id uuid,
    motivo public.motivo_humano,
    por_envio boolean DEFAULT false NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT conversa_eventos_de CHECK (((de IS NULL) OR (de = ANY (ARRAY['janete'::text, 'espera'::text, 'outro'::text, 'celular'::text]))))
);


ALTER TABLE public.conversa_eventos OWNER TO postgres;

--
-- Name: conversas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contato_id uuid NOT NULL,
    conexao_id uuid,
    modo public.conversa_modo DEFAULT 'janete'::public.conversa_modo NOT NULL,
    responsavel_id uuid,
    aguardando_humano_desde timestamp with time zone,
    motivo_humano public.motivo_humano,
    responder_apos timestamp with time zone,
    ultima_mensagem_em timestamp with time zone,
    ultima_mensagem_preview text,
    ultima_do_lead_em timestamp with time zone,
    nao_lidas integer DEFAULT 0 NOT NULL,
    devolvida_em timestamp with time zone,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp with time zone DEFAULT now() NOT NULL,
    ultima_mensagem_id uuid,
    ultima_da_janete_em timestamp with time zone,
    CONSTRAINT conversas_nao_lidas_check CHECK ((nao_lidas >= 0))
);


ALTER TABLE public.conversas OWNER TO postgres;

--
-- Name: convites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.convites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    papel public.papel_membro DEFAULT 'atendente'::public.papel_membro NOT NULL,
    convidado_por uuid,
    user_id uuid,
    enviado_em timestamp with time zone DEFAULT now() NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT convites_email_minusculo CHECK (((email = lower(email)) AND (email <> ''::text)))
);


ALTER TABLE public.convites OWNER TO postgres;

--
-- Name: etapas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.etapas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chave text,
    nome text NOT NULL,
    cor text,
    ordem integer NOT NULL,
    tipo public.etapa_tipo DEFAULT 'aberta'::public.etapa_tipo NOT NULL,
    janete_pode_mover boolean DEFAULT false NOT NULL,
    arquivada boolean DEFAULT false NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT etapas_nome_check CHECK ((btrim(nome) <> ''::text))
);


ALTER TABLE public.etapas OWNER TO postgres;

--
-- Name: eventos_webhook; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.eventos_webhook (
    id bigint NOT NULL,
    gateway public.gateway NOT NULL,
    conexao_id uuid,
    id_evento text,
    tipo text,
    payload jsonb NOT NULL,
    recebido_em timestamp with time zone DEFAULT now() NOT NULL,
    processado_em timestamp with time zone,
    erro text,
    tentativas smallint DEFAULT 0 NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    pego_em timestamp with time zone
);


ALTER TABLE public.eventos_webhook OWNER TO postgres;

--
-- Name: eventos_webhook_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.eventos_webhook ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.eventos_webhook_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ia_chamadas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ia_chamadas (
    id bigint NOT NULL,
    rodada_id uuid,
    tipo public.chamada_tipo NOT NULL,
    provedor public.ia_provedor NOT NULL,
    modelo text NOT NULL,
    passo integer,
    tokens_entrada integer,
    tokens_cache_leitura integer,
    tokens_cache_escrita integer,
    tokens_saida integer,
    tokens_raciocinio integer,
    segundos_audio numeric,
    custo_usd numeric(12,6),
    custo_origem public.custo_origem NOT NULL,
    preco_id uuid,
    request_id text,
    uso_bruto jsonb,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    conversa_id uuid,
    caracteres integer,
    CONSTRAINT ia_chamadas_caracteres CHECK (((caracteres IS NULL) OR (caracteres >= 0))),
    CONSTRAINT ia_chamadas_sem_preco CHECK (((custo_origem = 'sem_preco'::public.custo_origem) = (custo_usd IS NULL)))
);


ALTER TABLE public.ia_chamadas OWNER TO postgres;

--
-- Name: ia_chamadas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.ia_chamadas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.ia_chamadas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ia_chaves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ia_chaves (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    finalidade public.ia_finalidade NOT NULL,
    provedor public.ia_provedor NOT NULL,
    modelo text NOT NULL,
    workspace_id text,
    chave_cifrada text,
    ultimos4 text,
    status public.chave_status DEFAULT 'ativa'::public.chave_status NOT NULL,
    ultimo_erro text,
    validada_em timestamp with time zone,
    atualizada_em timestamp with time zone DEFAULT now() NOT NULL,
    atualizada_por uuid,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ia_chaves_chave_cifrada_formato CHECK (((chave_cifrada IS NULL) OR (chave_cifrada ~ '^v[0-9]+:[A-Za-z0-9+/]+={0,2}:[A-Za-z0-9+/]+={0,2}$'::text))),
    CONSTRAINT ia_chaves_elevenlabs_voz_ou_escuta CHECK ((((provedor)::text <> 'elevenlabs'::text) OR ((finalidade)::text = ANY (ARRAY['voz'::text, 'transcricao'::text])))),
    CONSTRAINT ia_chaves_groq_so_transcricao CHECK (((provedor <> 'groq'::public.ia_provedor) OR (finalidade = 'transcricao'::public.ia_finalidade))),
    CONSTRAINT ia_chaves_ultimos4_check CHECK (((ultimos4 IS NULL) OR (char_length(ultimos4) <= 4))),
    CONSTRAINT ia_chaves_voz_so_elevenlabs CHECK ((((finalidade)::text <> 'voz'::text) OR ((provedor)::text = 'elevenlabs'::text)))
);


ALTER TABLE public.ia_chaves OWNER TO postgres;

--
-- Name: ia_precos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ia_precos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provedor public.ia_provedor NOT NULL,
    modelo text NOT NULL,
    vigente_desde date NOT NULL,
    a_partir_de_tokens integer DEFAULT 0 NOT NULL,
    entrada numeric,
    cache_leitura numeric,
    cache_escrita numeric,
    saida numeric,
    audio_por_minuto numeric,
    fonte text NOT NULL,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    por_mil_caracteres numeric,
    CONSTRAINT ia_precos_a_partir_de_tokens_check CHECK ((a_partir_de_tokens >= 0)),
    CONSTRAINT ia_precos_fonte_check CHECK ((btrim(fonte) <> ''::text)),
    CONSTRAINT ia_precos_por_mil_caracteres CHECK (((por_mil_caracteres IS NULL) OR (por_mil_caracteres >= (0)::numeric)))
);


ALTER TABLE public.ia_precos OWNER TO postgres;

--
-- Name: membros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.membros (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    nome text NOT NULL,
    email text NOT NULL,
    papel public.papel_membro DEFAULT 'atendente'::public.papel_membro NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    convidado_por uuid,
    criado_em timestamp with time zone DEFAULT now() NOT NULL,
    vistos jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT membros_email_check CHECK (((email = lower(email)) AND (email <> ''::text))),
    CONSTRAINT membros_vistos_objeto CHECK ((jsonb_typeof(vistos) = 'object'::text))
);


ALTER TABLE public.membros OWNER TO postgres;

--
-- Name: motor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.motor (
    id boolean DEFAULT true NOT NULL,
    url text,
    chave text DEFAULT encode(extensions.gen_random_bytes(32), 'hex'::text) NOT NULL,
    url_em timestamp with time zone,
    tocado_em timestamp with time zone,
    preparada_em timestamp with time zone,
    relogio_em timestamp with time zone,
    CONSTRAINT motor_linha_unica CHECK (id),
    CONSTRAINT motor_url_formato CHECK (((url IS NULL) OR ((url ~ '^https://([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]([a-z0-9-]*[a-z0-9])?$'::text) AND (char_length(url) <= 261))))
);


ALTER TABLE public.motor OWNER TO postgres;

--
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id);


--
-- Name: conexao_eventos conexao_eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conexao_eventos
    ADD CONSTRAINT conexao_eventos_pkey PRIMARY KEY (id);


--
-- Name: conexoes conexoes_gateway_id_externo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conexoes
    ADD CONSTRAINT conexoes_gateway_id_externo_key UNIQUE (gateway, id_externo);


--
-- Name: conexoes conexoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conexoes
    ADD CONSTRAINT conexoes_pkey PRIMARY KEY (id);


--
-- Name: configuracao configuracao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuracao
    ADD CONSTRAINT configuracao_pkey PRIMARY KEY (id);


--
-- Name: contato_etapa_historico contato_etapa_historico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contato_etapa_historico
    ADD CONSTRAINT contato_etapa_historico_pkey PRIMARY KEY (id);


--
-- Name: contato_identificadores contato_identificadores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contato_identificadores
    ADD CONSTRAINT contato_identificadores_pkey PRIMARY KEY (id);


--
-- Name: contato_identificadores contato_identificadores_tipo_valor_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contato_identificadores
    ADD CONSTRAINT contato_identificadores_tipo_valor_key UNIQUE (tipo, valor);


--
-- Name: contatos contatos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contatos
    ADD CONSTRAINT contatos_pkey PRIMARY KEY (id);


--
-- Name: contexto_versoes contexto_versoes_numero_unico; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contexto_versoes
    ADD CONSTRAINT contexto_versoes_numero_unico UNIQUE (numero);


--
-- Name: contexto_versoes contexto_versoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contexto_versoes
    ADD CONSTRAINT contexto_versoes_pkey PRIMARY KEY (id);


--
-- Name: conversa_eventos conversa_eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversa_eventos
    ADD CONSTRAINT conversa_eventos_pkey PRIMARY KEY (id);


--
-- Name: conversas conversas_contato_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversas
    ADD CONSTRAINT conversas_contato_id_key UNIQUE (contato_id);


--
-- Name: conversas conversas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversas
    ADD CONSTRAINT conversas_pkey PRIMARY KEY (id);


--
-- Name: convites convites_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.convites
    ADD CONSTRAINT convites_email_key UNIQUE (email);


--
-- Name: convites convites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.convites
    ADD CONSTRAINT convites_pkey PRIMARY KEY (id);


--
-- Name: convites convites_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.convites
    ADD CONSTRAINT convites_user_id_key UNIQUE (user_id);


--
-- Name: etapas etapas_chave_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etapas
    ADD CONSTRAINT etapas_chave_key UNIQUE (chave);


--
-- Name: etapas etapas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etapas
    ADD CONSTRAINT etapas_pkey PRIMARY KEY (id);


--
-- Name: eventos_webhook eventos_webhook_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos_webhook
    ADD CONSTRAINT eventos_webhook_pkey PRIMARY KEY (id);


--
-- Name: ia_chamadas ia_chamadas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ia_chamadas
    ADD CONSTRAINT ia_chamadas_pkey PRIMARY KEY (id);


--
-- Name: ia_chaves ia_chaves_finalidade_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ia_chaves
    ADD CONSTRAINT ia_chaves_finalidade_key UNIQUE (finalidade);


--
-- Name: ia_chaves ia_chaves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ia_chaves
    ADD CONSTRAINT ia_chaves_pkey PRIMARY KEY (id);


--
-- Name: ia_precos ia_precos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ia_precos
    ADD CONSTRAINT ia_precos_pkey PRIMARY KEY (id);


--
-- Name: ia_precos ia_precos_provedor_modelo_vigente_desde_a_partir_de_tokens_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ia_precos
    ADD CONSTRAINT ia_precos_provedor_modelo_vigente_desde_a_partir_de_tokens_key UNIQUE (provedor, modelo, vigente_desde, a_partir_de_tokens);


--
-- Name: membros membros_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membros
    ADD CONSTRAINT membros_email_key UNIQUE (email);


--
-- Name: membros membros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membros
    ADD CONSTRAINT membros_pkey PRIMARY KEY (id);


--
-- Name: membros membros_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membros
    ADD CONSTRAINT membros_user_id_key UNIQUE (user_id);


--
-- Name: mensagens mensagens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensagens
    ADD CONSTRAINT mensagens_pkey PRIMARY KEY (id);


--
-- Name: motor motor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.motor
    ADD CONSTRAINT motor_pkey PRIMARY KEY (id);


--
-- Name: rodadas rodadas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rodadas
    ADD CONSTRAINT rodadas_pkey PRIMARY KEY (id);


--
-- Name: auditoria_criado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auditoria_criado ON public.auditoria USING btree (criado_em DESC);


--
-- Name: conexao_eventos_conexao; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conexao_eventos_conexao ON public.conexao_eventos USING btree (conexao_id, criado_em);


--
-- Name: conexoes_uma_ativa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX conexoes_uma_ativa ON public.conexoes USING btree (ativa) WHERE ativa;


--
-- Name: contato_etapa_historico_contato; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contato_etapa_historico_contato ON public.contato_etapa_historico USING btree (contato_id, criado_em);


--
-- Name: contato_etapa_historico_para; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contato_etapa_historico_para ON public.contato_etapa_historico USING btree (para_etapa_id);


--
-- Name: contato_etapa_historico_rodada; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contato_etapa_historico_rodada ON public.contato_etapa_historico USING btree (rodada_id) WHERE (rodada_id IS NOT NULL);


--
-- Name: contato_identificadores_contato; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contato_identificadores_contato ON public.contato_identificadores USING btree (contato_id);


--
-- Name: contatos_atualizado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contatos_atualizado ON public.contatos USING btree (atualizado_em DESC);


--
-- Name: contatos_coorte; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contatos_coorte ON public.contatos USING btree (primeira_mensagem_em);


--
-- Name: contatos_etapa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contatos_etapa ON public.contatos USING btree (etapa_id);


--
-- Name: contatos_telefone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contatos_telefone ON public.contatos USING btree (telefone) WHERE (telefone IS NOT NULL);


--
-- Name: conversa_eventos_conversa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversa_eventos_conversa ON public.conversa_eventos USING btree (conversa_id, criado_em);


--
-- Name: conversa_eventos_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversa_eventos_tipo ON public.conversa_eventos USING btree (tipo, criado_em);


--
-- Name: conversas_aguardando; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversas_aguardando ON public.conversas USING btree (aguardando_humano_desde) WHERE (aguardando_humano_desde IS NOT NULL);


--
-- Name: conversas_lista; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversas_lista ON public.conversas USING btree (ultima_mensagem_em DESC NULLS LAST);


--
-- Name: conversas_lote; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversas_lote ON public.conversas USING btree (responder_apos) WHERE ((responder_apos IS NOT NULL) AND (modo = 'janete'::public.conversa_modo));


--
-- Name: conversas_responsavel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversas_responsavel ON public.conversas USING btree (responsavel_id) WHERE (responsavel_id IS NOT NULL);


--
-- Name: conversas_ultima_mensagem; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversas_ultima_mensagem ON public.conversas USING btree (ultima_mensagem_id) WHERE (ultima_mensagem_id IS NOT NULL);


--
-- Name: etapas_ordem; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX etapas_ordem ON public.etapas USING btree (ordem) WHERE (NOT arquivada);


--
-- Name: eventos_webhook_pendentes; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX eventos_webhook_pendentes ON public.eventos_webhook USING btree (recebido_em) WHERE (processado_em IS NULL);


--
-- Name: eventos_webhook_recebido; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX eventos_webhook_recebido ON public.eventos_webhook USING btree (recebido_em);


--
-- Name: eventos_webhook_unico; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX eventos_webhook_unico ON public.eventos_webhook USING btree (gateway, id_evento) WHERE (id_evento IS NOT NULL);


--
-- Name: ia_chamadas_conversa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ia_chamadas_conversa ON public.ia_chamadas USING btree (conversa_id) WHERE (conversa_id IS NOT NULL);


--
-- Name: ia_chamadas_criado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ia_chamadas_criado ON public.ia_chamadas USING btree (criado_em);


--
-- Name: ia_chamadas_rodada; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ia_chamadas_rodada ON public.ia_chamadas USING btree (rodada_id) WHERE (rodada_id IS NOT NULL);


--
-- Name: mensagens_conversa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mensagens_conversa ON public.mensagens USING btree (conversa_id, momento);


--
-- Name: mensagens_entradas_soltas; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mensagens_entradas_soltas ON public.mensagens USING btree (conversa_id, criado_em) WHERE ((direcao = 'entrada'::public.mensagem_direcao) AND (rodada_id IS NULL));


--
-- Name: mensagens_enviando; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mensagens_enviando ON public.mensagens USING btree (status_em) WHERE (status = 'enviando'::public.mensagem_status);


--
-- Name: mensagens_evento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mensagens_evento ON public.mensagens USING btree (evento_id) WHERE (evento_id IS NOT NULL);


--
-- Name: mensagens_fila_envio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mensagens_fila_envio ON public.mensagens USING btree (enviar_apos) WHERE (status = 'na_fila'::public.mensagem_status);


--
-- Name: mensagens_id_externo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX mensagens_id_externo ON public.mensagens USING btree (conexao_id, id_externo) WHERE (id_externo IS NOT NULL);


--
-- Name: mensagens_id_gateway; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mensagens_id_gateway ON public.mensagens USING btree (conexao_id, id_gateway) WHERE (id_gateway IS NOT NULL);


--
-- Name: mensagens_midia_pendente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mensagens_midia_pendente ON public.mensagens USING btree (criado_em) WHERE (midia_status = 'pendente'::public.midia_status);


--
-- Name: mensagens_momento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mensagens_momento ON public.mensagens USING btree (momento);


--
-- Name: mensagens_responde_a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mensagens_responde_a ON public.mensagens USING btree (responde_a_id) WHERE (responde_a_id IS NOT NULL);


--
-- Name: mensagens_rodada; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mensagens_rodada ON public.mensagens USING btree (rodada_id) WHERE (rodada_id IS NOT NULL);


--
-- Name: rodadas_conversa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX rodadas_conversa ON public.rodadas USING btree (conversa_id, iniciada_em DESC);


--
-- Name: rodadas_rodando_desde; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX rodadas_rodando_desde ON public.rodadas USING btree (iniciada_em) WHERE (status = 'rodando'::public.rodada_status);


--
-- Name: rodadas_terminada; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX rodadas_terminada ON public.rodadas USING btree (terminada_em) WHERE (status = ANY (ARRAY['concluida'::public.rodada_status, 'falhou'::public.rodada_status]));


--
-- Name: rodadas_uma_rodando; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX rodadas_uma_rodando ON public.rodadas USING btree (conversa_id) WHERE (status = 'rodando'::public.rodada_status);


--
-- Name: conexoes conexoes_atualizado; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER conexoes_atualizado BEFORE UPDATE ON public.conexoes FOR EACH ROW EXECUTE FUNCTION public.tg_tocar_atualizado_em();


--
-- Name: conexoes conexoes_desativar; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER conexoes_desativar BEFORE UPDATE OF ativa ON public.conexoes FOR EACH ROW EXECUTE FUNCTION public.tg_conexoes_desativar();


--
-- Name: conexoes conexoes_eventos; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER conexoes_eventos AFTER UPDATE OF status, ativa ON public.conexoes FOR EACH ROW EXECUTE FUNCTION public.tg_conexoes_eventos();


--
-- Name: conexoes conexoes_segredos_formato_cifra; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER conexoes_segredos_formato_cifra BEFORE INSERT OR UPDATE OF segredos ON public.conexoes FOR EACH ROW EXECUTE FUNCTION public.tg_conexoes_segredos_formato();


--
-- Name: configuracao configuracao_atualizado; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER configuracao_atualizado BEFORE UPDATE ON public.configuracao FOR EACH ROW EXECUTE FUNCTION public.tg_tocar_atualizado_em();


--
-- Name: contatos contatos_antes; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER contatos_antes BEFORE INSERT OR UPDATE ON public.contatos FOR EACH ROW EXECUTE FUNCTION public.tg_contatos_antes();


--
-- Name: contatos contatos_historico_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER contatos_historico_insert AFTER INSERT ON public.contatos FOR EACH ROW EXECUTE FUNCTION public.tg_contatos_historico();


--
-- Name: contatos contatos_historico_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER contatos_historico_update AFTER UPDATE OF etapa_id ON public.contatos FOR EACH ROW EXECUTE FUNCTION public.tg_contatos_historico();


--
-- Name: contexto_versoes contexto_autor; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER contexto_autor BEFORE INSERT ON public.contexto_versoes FOR EACH ROW EXECUTE FUNCTION public.tg_contexto_autor();


--
-- Name: contexto_versoes contexto_numerar; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER contexto_numerar BEFORE INSERT ON public.contexto_versoes FOR EACH ROW EXECUTE FUNCTION public.tg_contexto_numerar();


--
-- Name: conversas conversas_atualizado; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER conversas_atualizado BEFORE UPDATE ON public.conversas FOR EACH ROW EXECUTE FUNCTION public.tg_tocar_atualizado_em();


--
-- Name: etapas etapas_arquivar; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER etapas_arquivar BEFORE DELETE OR UPDATE OF arquivada, tipo ON public.etapas FOR EACH ROW EXECUTE FUNCTION public.tg_etapas_arquivar();


--
-- Name: ia_chaves ia_chaves_atualizada; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER ia_chaves_atualizada BEFORE UPDATE ON public.ia_chaves FOR EACH ROW EXECUTE FUNCTION public.tg_tocar_atualizada_em();


--
-- Name: ia_chaves ia_chaves_formato_cifra; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER ia_chaves_formato_cifra BEFORE INSERT OR UPDATE OF chave_cifrada ON public.ia_chaves FOR EACH ROW EXECUTE FUNCTION public.tg_ia_chaves_formato();


--
-- Name: membros membros_normalizar; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER membros_normalizar BEFORE INSERT OR UPDATE OF email ON public.membros FOR EACH ROW EXECUTE FUNCTION public.tg_membros_normalizar();


--
-- Name: membros membros_ultimo_admin; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER membros_ultimo_admin BEFORE DELETE OR UPDATE OF papel, ativo, user_id ON public.membros FOR EACH ROW EXECUTE FUNCTION public.tg_membros_ultimo_admin();


--
-- Name: mensagens mensagens_antes_inserir; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER mensagens_antes_inserir BEFORE INSERT ON public.mensagens FOR EACH ROW EXECUTE FUNCTION public.tg_mensagens_antes_inserir();


--
-- Name: mensagens mensagens_apos_atualizar; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER mensagens_apos_atualizar AFTER UPDATE OF status, apagada_em ON public.mensagens FOR EACH ROW WHEN (((old.status IS DISTINCT FROM new.status) OR (old.apagada_em IS DISTINCT FROM new.apagada_em))) EXECUTE FUNCTION public.tg_mensagens_apos_atualizar();


--
-- Name: mensagens mensagens_apos_inserir; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER mensagens_apos_inserir AFTER INSERT ON public.mensagens FOR EACH ROW EXECUTE FUNCTION public.tg_mensagens_apos_inserir();


--
-- Name: mensagens mensagens_envio_falhou; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER mensagens_envio_falhou AFTER UPDATE OF status ON public.mensagens FOR EACH ROW WHEN (((new.status = 'falhou'::public.mensagem_status) AND (old.status IS DISTINCT FROM 'falhou'::public.mensagem_status) AND (new.direcao = 'saida'::public.mensagem_direcao) AND (new.origem = 'janete'::public.mensagem_origem))) EXECUTE FUNCTION public.tg_mensagens_envio_falhou();


--
-- Name: auditoria auditoria_ator_membro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_ator_membro_id_fkey FOREIGN KEY (ator_membro_id) REFERENCES public.membros(id) ON DELETE SET NULL;


--
-- Name: conexao_eventos conexao_eventos_ator_membro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conexao_eventos
    ADD CONSTRAINT conexao_eventos_ator_membro_id_fkey FOREIGN KEY (ator_membro_id) REFERENCES public.membros(id) ON DELETE SET NULL;


--
-- Name: conexao_eventos conexao_eventos_conexao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conexao_eventos
    ADD CONSTRAINT conexao_eventos_conexao_id_fkey FOREIGN KEY (conexao_id) REFERENCES public.conexoes(id) ON DELETE CASCADE;


--
-- Name: conexoes conexoes_criado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conexoes
    ADD CONSTRAINT conexoes_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES public.membros(id) ON DELETE SET NULL;


--
-- Name: contato_etapa_historico contato_etapa_historico_contato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contato_etapa_historico
    ADD CONSTRAINT contato_etapa_historico_contato_id_fkey FOREIGN KEY (contato_id) REFERENCES public.contatos(id) ON DELETE CASCADE;


--
-- Name: contato_etapa_historico contato_etapa_historico_de_etapa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contato_etapa_historico
    ADD CONSTRAINT contato_etapa_historico_de_etapa_id_fkey FOREIGN KEY (de_etapa_id) REFERENCES public.etapas(id);


--
-- Name: contato_etapa_historico contato_etapa_historico_membro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contato_etapa_historico
    ADD CONSTRAINT contato_etapa_historico_membro_id_fkey FOREIGN KEY (membro_id) REFERENCES public.membros(id) ON DELETE SET NULL;


--
-- Name: contato_etapa_historico contato_etapa_historico_para_etapa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contato_etapa_historico
    ADD CONSTRAINT contato_etapa_historico_para_etapa_id_fkey FOREIGN KEY (para_etapa_id) REFERENCES public.etapas(id);


--
-- Name: contato_etapa_historico contato_etapa_historico_rodada_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contato_etapa_historico
    ADD CONSTRAINT contato_etapa_historico_rodada_id_fkey FOREIGN KEY (rodada_id) REFERENCES public.rodadas(id);


--
-- Name: contato_identificadores contato_identificadores_conexao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contato_identificadores
    ADD CONSTRAINT contato_identificadores_conexao_id_fkey FOREIGN KEY (conexao_id) REFERENCES public.conexoes(id) ON DELETE SET NULL;


--
-- Name: contato_identificadores contato_identificadores_contato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contato_identificadores
    ADD CONSTRAINT contato_identificadores_contato_id_fkey FOREIGN KEY (contato_id) REFERENCES public.contatos(id) ON DELETE CASCADE;


--
-- Name: contatos contatos_etapa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contatos
    ADD CONSTRAINT contatos_etapa_id_fkey FOREIGN KEY (etapa_id) REFERENCES public.etapas(id) ON DELETE RESTRICT;


--
-- Name: contexto_versoes contexto_versoes_criado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contexto_versoes
    ADD CONSTRAINT contexto_versoes_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES public.membros(id) ON DELETE SET NULL;


--
-- Name: contexto_versoes contexto_versoes_restaurada_de_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contexto_versoes
    ADD CONSTRAINT contexto_versoes_restaurada_de_fkey FOREIGN KEY (restaurada_de) REFERENCES public.contexto_versoes(id);


--
-- Name: conversa_eventos conversa_eventos_conversa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversa_eventos
    ADD CONSTRAINT conversa_eventos_conversa_id_fkey FOREIGN KEY (conversa_id) REFERENCES public.conversas(id) ON DELETE CASCADE;


--
-- Name: conversa_eventos conversa_eventos_de_membro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversa_eventos
    ADD CONSTRAINT conversa_eventos_de_membro_id_fkey FOREIGN KEY (de_membro_id) REFERENCES public.membros(id) ON DELETE SET NULL;


--
-- Name: conversa_eventos conversa_eventos_membro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversa_eventos
    ADD CONSTRAINT conversa_eventos_membro_id_fkey FOREIGN KEY (membro_id) REFERENCES public.membros(id) ON DELETE SET NULL;


--
-- Name: conversas conversas_conexao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversas
    ADD CONSTRAINT conversas_conexao_id_fkey FOREIGN KEY (conexao_id) REFERENCES public.conexoes(id) ON DELETE SET NULL;


--
-- Name: conversas conversas_contato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversas
    ADD CONSTRAINT conversas_contato_id_fkey FOREIGN KEY (contato_id) REFERENCES public.contatos(id) ON DELETE CASCADE;


--
-- Name: conversas conversas_responsavel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversas
    ADD CONSTRAINT conversas_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES public.membros(id) ON DELETE SET NULL;


--
-- Name: conversas conversas_ultima_mensagem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversas
    ADD CONSTRAINT conversas_ultima_mensagem_id_fkey FOREIGN KEY (ultima_mensagem_id) REFERENCES public.mensagens(id) ON DELETE SET NULL;


--
-- Name: convites convites_convidado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.convites
    ADD CONSTRAINT convites_convidado_por_fkey FOREIGN KEY (convidado_por) REFERENCES public.membros(id) ON DELETE SET NULL;


--
-- Name: eventos_webhook eventos_webhook_conexao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos_webhook
    ADD CONSTRAINT eventos_webhook_conexao_id_fkey FOREIGN KEY (conexao_id) REFERENCES public.conexoes(id) ON DELETE SET NULL;


--
-- Name: ia_chamadas ia_chamadas_conversa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ia_chamadas
    ADD CONSTRAINT ia_chamadas_conversa_id_fkey FOREIGN KEY (conversa_id) REFERENCES public.conversas(id) ON DELETE SET NULL;


--
-- Name: ia_chamadas ia_chamadas_preco_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ia_chamadas
    ADD CONSTRAINT ia_chamadas_preco_id_fkey FOREIGN KEY (preco_id) REFERENCES public.ia_precos(id) ON DELETE SET NULL;


--
-- Name: ia_chamadas ia_chamadas_rodada_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ia_chamadas
    ADD CONSTRAINT ia_chamadas_rodada_id_fkey FOREIGN KEY (rodada_id) REFERENCES public.rodadas(id) ON DELETE SET NULL;


--
-- Name: ia_chaves ia_chaves_atualizada_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ia_chaves
    ADD CONSTRAINT ia_chaves_atualizada_por_fkey FOREIGN KEY (atualizada_por) REFERENCES public.membros(id) ON DELETE SET NULL;


--
-- Name: membros membros_convidado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membros
    ADD CONSTRAINT membros_convidado_por_fkey FOREIGN KEY (convidado_por) REFERENCES public.membros(id) ON DELETE SET NULL;


--
-- Name: membros membros_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membros
    ADD CONSTRAINT membros_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: mensagens mensagens_autor_membro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensagens
    ADD CONSTRAINT mensagens_autor_membro_id_fkey FOREIGN KEY (autor_membro_id) REFERENCES public.membros(id);


--
-- Name: mensagens mensagens_conexao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensagens
    ADD CONSTRAINT mensagens_conexao_id_fkey FOREIGN KEY (conexao_id) REFERENCES public.conexoes(id) ON DELETE RESTRICT;


--
-- Name: mensagens mensagens_conversa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensagens
    ADD CONSTRAINT mensagens_conversa_id_fkey FOREIGN KEY (conversa_id) REFERENCES public.conversas(id) ON DELETE CASCADE;


--
-- Name: mensagens mensagens_evento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensagens
    ADD CONSTRAINT mensagens_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos_webhook(id) ON DELETE SET NULL;


--
-- Name: mensagens mensagens_responde_a_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensagens
    ADD CONSTRAINT mensagens_responde_a_id_fkey FOREIGN KEY (responde_a_id) REFERENCES public.mensagens(id) ON DELETE SET NULL;


--
-- Name: mensagens mensagens_rodada_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mensagens
    ADD CONSTRAINT mensagens_rodada_id_fkey FOREIGN KEY (rodada_id) REFERENCES public.rodadas(id);


--
-- Name: rodadas rodadas_contexto_versao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rodadas
    ADD CONSTRAINT rodadas_contexto_versao_id_fkey FOREIGN KEY (contexto_versao_id) REFERENCES public.contexto_versoes(id) ON DELETE RESTRICT;


--
-- Name: rodadas rodadas_conversa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rodadas
    ADD CONSTRAINT rodadas_conversa_id_fkey FOREIGN KEY (conversa_id) REFERENCES public.conversas(id) ON DELETE CASCADE;


--
-- Name: auditoria; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

--
-- Name: auditoria auditoria_admin_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY auditoria_admin_le ON public.auditoria FOR SELECT TO authenticated USING (( SELECT public.eh_admin() AS eh_admin));


--
-- Name: conexao_eventos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.conexao_eventos ENABLE ROW LEVEL SECURITY;

--
-- Name: conexao_eventos conexao_eventos_membro_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY conexao_eventos_membro_le ON public.conexao_eventos FOR SELECT TO authenticated USING (( SELECT public.eh_membro() AS eh_membro));


--
-- Name: conexoes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.conexoes ENABLE ROW LEVEL SECURITY;

--
-- Name: conexoes conexoes_membro_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY conexoes_membro_le ON public.conexoes FOR SELECT TO authenticated USING (( SELECT public.eh_membro() AS eh_membro));


--
-- Name: configuracao; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.configuracao ENABLE ROW LEVEL SECURITY;

--
-- Name: configuracao configuracao_admin_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY configuracao_admin_le ON public.configuracao FOR SELECT TO authenticated USING (( SELECT public.eh_admin() AS eh_admin));


--
-- Name: configuracao configuracao_membro_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY configuracao_membro_le ON public.configuracao FOR SELECT TO authenticated USING (( SELECT public.eh_membro() AS eh_membro));


--
-- Name: contato_etapa_historico; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.contato_etapa_historico ENABLE ROW LEVEL SECURITY;

--
-- Name: contato_etapa_historico contato_etapa_historico_membro_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY contato_etapa_historico_membro_le ON public.contato_etapa_historico FOR SELECT TO authenticated USING (( SELECT public.eh_membro() AS eh_membro));


--
-- Name: contato_identificadores; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.contato_identificadores ENABLE ROW LEVEL SECURITY;

--
-- Name: contato_identificadores contato_identificadores_membro_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY contato_identificadores_membro_le ON public.contato_identificadores FOR SELECT TO authenticated USING (( SELECT public.eh_membro() AS eh_membro));


--
-- Name: contatos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;

--
-- Name: contatos contatos_membro_altera; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY contatos_membro_altera ON public.contatos FOR UPDATE TO authenticated USING (( SELECT public.eh_membro() AS eh_membro)) WITH CHECK (( SELECT public.eh_membro() AS eh_membro));


--
-- Name: contatos contatos_membro_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY contatos_membro_le ON public.contatos FOR SELECT TO authenticated USING (( SELECT public.eh_membro() AS eh_membro));


--
-- Name: contexto_versoes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.contexto_versoes ENABLE ROW LEVEL SECURITY;

--
-- Name: contexto_versoes contexto_versoes_membro_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY contexto_versoes_membro_le ON public.contexto_versoes FOR SELECT TO authenticated USING (( SELECT public.eh_membro() AS eh_membro));


--
-- Name: conversa_eventos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.conversa_eventos ENABLE ROW LEVEL SECURITY;

--
-- Name: conversa_eventos conversa_eventos_membro_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY conversa_eventos_membro_le ON public.conversa_eventos FOR SELECT TO authenticated USING (( SELECT public.eh_membro() AS eh_membro));


--
-- Name: conversas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.conversas ENABLE ROW LEVEL SECURITY;

--
-- Name: conversas conversas_membro_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY conversas_membro_le ON public.conversas FOR SELECT TO authenticated USING (( SELECT public.eh_membro() AS eh_membro));


--
-- Name: convites; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.convites ENABLE ROW LEVEL SECURITY;

--
-- Name: convites convites_admin_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY convites_admin_le ON public.convites FOR SELECT TO authenticated USING (( SELECT public.eh_admin() AS eh_admin));


--
-- Name: etapas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.etapas ENABLE ROW LEVEL SECURITY;

--
-- Name: etapas etapas_admin_altera; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY etapas_admin_altera ON public.etapas FOR UPDATE TO authenticated USING (( SELECT public.eh_admin() AS eh_admin)) WITH CHECK (( SELECT public.eh_admin() AS eh_admin));


--
-- Name: etapas etapas_admin_insere; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY etapas_admin_insere ON public.etapas FOR INSERT TO authenticated WITH CHECK (( SELECT public.eh_admin() AS eh_admin));


--
-- Name: etapas etapas_membro_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY etapas_membro_le ON public.etapas FOR SELECT TO authenticated USING (( SELECT public.eh_membro() AS eh_membro));


--
-- Name: eventos_webhook; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.eventos_webhook ENABLE ROW LEVEL SECURITY;

--
-- Name: ia_chamadas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ia_chamadas ENABLE ROW LEVEL SECURITY;

--
-- Name: ia_chamadas ia_chamadas_admin_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ia_chamadas_admin_le ON public.ia_chamadas FOR SELECT TO authenticated USING (( SELECT public.eh_admin() AS eh_admin));


--
-- Name: ia_chaves; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ia_chaves ENABLE ROW LEVEL SECURITY;

--
-- Name: ia_chaves ia_chaves_admin_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ia_chaves_admin_le ON public.ia_chaves FOR SELECT TO authenticated USING (( SELECT public.eh_admin() AS eh_admin));


--
-- Name: ia_precos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ia_precos ENABLE ROW LEVEL SECURITY;

--
-- Name: ia_precos ia_precos_admin_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY ia_precos_admin_le ON public.ia_precos FOR SELECT TO authenticated USING (( SELECT public.eh_admin() AS eh_admin));


--
-- Name: membros; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;

--
-- Name: membros membros_membro_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY membros_membro_le ON public.membros FOR SELECT TO authenticated USING (( SELECT public.eh_membro() AS eh_membro));


--
-- Name: mensagens; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

--
-- Name: mensagens mensagens_citacao_mesma_conversa; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY mensagens_citacao_mesma_conversa ON public.mensagens AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (((responde_a_id IS NULL) OR public.mensagem_da_conversa(responde_a_id, conversa_id)));


--
-- Name: mensagens mensagens_membro_insere; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY mensagens_membro_insere ON public.mensagens FOR INSERT TO authenticated WITH CHECK ((( SELECT public.eh_membro() AS eh_membro) AND (direcao = 'saida'::public.mensagem_direcao) AND (origem = 'humano_tela'::public.mensagem_origem) AND (status = 'na_fila'::public.mensagem_status) AND (autor_membro_id = ( SELECT m.id
   FROM public.membros m
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND m.ativo)))));


--
-- Name: mensagens mensagens_membro_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY mensagens_membro_le ON public.mensagens FOR SELECT TO authenticated USING (( SELECT public.eh_membro() AS eh_membro));


--
-- Name: motor; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.motor ENABLE ROW LEVEL SECURITY;

--
-- Name: rodadas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.rodadas ENABLE ROW LEVEL SECURITY;

--
-- Name: rodadas rodadas_membro_le; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY rodadas_membro_le ON public.rodadas FOR SELECT TO authenticated USING (( SELECT public.eh_membro() AS eh_membro));


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION acordar_motor(p_renovar boolean); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.acordar_motor(p_renovar boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION public.acordar_motor(p_renovar boolean) TO anon;
GRANT ALL ON FUNCTION public.acordar_motor(p_renovar boolean) TO authenticated;
GRANT ALL ON FUNCTION public.acordar_motor(p_renovar boolean) TO service_role;


--
-- Name: FUNCTION assumir_conversa(p_conversa uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.assumir_conversa(p_conversa uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.assumir_conversa(p_conversa uuid) TO anon;
GRANT ALL ON FUNCTION public.assumir_conversa(p_conversa uuid) TO authenticated;
GRANT ALL ON FUNCTION public.assumir_conversa(p_conversa uuid) TO service_role;


--
-- Name: FUNCTION atualizar_status(p_conexao uuid, p_id text, p_status public.mensagem_status, p_momento timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.atualizar_status(p_conexao uuid, p_id text, p_status public.mensagem_status, p_momento timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION public.atualizar_status(p_conexao uuid, p_id text, p_status public.mensagem_status, p_momento timestamp with time zone) TO anon;
GRANT ALL ON FUNCTION public.atualizar_status(p_conexao uuid, p_id text, p_status public.mensagem_status, p_momento timestamp with time zone) TO authenticated;
GRANT ALL ON FUNCTION public.atualizar_status(p_conexao uuid, p_id text, p_status public.mensagem_status, p_momento timestamp with time zone) TO service_role;


--
-- Name: FUNCTION buscar_quadro(p_q text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.buscar_quadro(p_q text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.buscar_quadro(p_q text) TO anon;
GRANT ALL ON FUNCTION public.buscar_quadro(p_q text) TO authenticated;
GRANT ALL ON FUNCTION public.buscar_quadro(p_q text) TO service_role;


--
-- Name: FUNCTION concluir_envio(p_msg uuid, p_id_externo text, p_id_gateway text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.concluir_envio(p_msg uuid, p_id_externo text, p_id_gateway text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.concluir_envio(p_msg uuid, p_id_externo text, p_id_gateway text) TO anon;
GRANT ALL ON FUNCTION public.concluir_envio(p_msg uuid, p_id_externo text, p_id_gateway text) TO authenticated;
GRANT ALL ON FUNCTION public.concluir_envio(p_msg uuid, p_id_externo text, p_id_gateway text) TO service_role;


--
-- Name: FUNCTION concluir_midia(p_msg uuid, p_caminho text, p_mime text, p_tamanho bigint, p_ok boolean); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.concluir_midia(p_msg uuid, p_caminho text, p_mime text, p_tamanho bigint, p_ok boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION public.concluir_midia(p_msg uuid, p_caminho text, p_mime text, p_tamanho bigint, p_ok boolean) TO anon;
GRANT ALL ON FUNCTION public.concluir_midia(p_msg uuid, p_caminho text, p_mime text, p_tamanho bigint, p_ok boolean) TO authenticated;
GRANT ALL ON FUNCTION public.concluir_midia(p_msg uuid, p_caminho text, p_mime text, p_tamanho bigint, p_ok boolean) TO service_role;


--
-- Name: FUNCTION concluir_onboarding(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.concluir_onboarding() FROM PUBLIC;
GRANT ALL ON FUNCTION public.concluir_onboarding() TO anon;
GRANT ALL ON FUNCTION public.concluir_onboarding() TO authenticated;
GRANT ALL ON FUNCTION public.concluir_onboarding() TO service_role;


--
-- Name: FUNCTION concluir_rodada(p_rodada uuid, p_respostas jsonb, p_ferramentas jsonb, p_passos integer); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.concluir_rodada(p_rodada uuid, p_respostas jsonb, p_ferramentas jsonb, p_passos integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.concluir_rodada(p_rodada uuid, p_respostas jsonb, p_ferramentas jsonb, p_passos integer) TO anon;
GRANT ALL ON FUNCTION public.concluir_rodada(p_rodada uuid, p_respostas jsonb, p_ferramentas jsonb, p_passos integer) TO authenticated;
GRANT ALL ON FUNCTION public.concluir_rodada(p_rodada uuid, p_respostas jsonb, p_ferramentas jsonb, p_passos integer) TO service_role;


--
-- Name: FUNCTION contato_por_ids(p_conexao uuid, p_ids jsonb, p_nome_whatsapp text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.contato_por_ids(p_conexao uuid, p_ids jsonb, p_nome_whatsapp text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.contato_por_ids(p_conexao uuid, p_ids jsonb, p_nome_whatsapp text) TO anon;
GRANT ALL ON FUNCTION public.contato_por_ids(p_conexao uuid, p_ids jsonb, p_nome_whatsapp text) TO authenticated;
GRANT ALL ON FUNCTION public.contato_por_ids(p_conexao uuid, p_ids jsonb, p_nome_whatsapp text) TO service_role;


--
-- Name: FUNCTION contatos_contadores(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.contatos_contadores() FROM PUBLIC;
GRANT ALL ON FUNCTION public.contatos_contadores() TO anon;
GRANT ALL ON FUNCTION public.contatos_contadores() TO authenticated;
GRANT ALL ON FUNCTION public.contatos_contadores() TO service_role;


--
-- Name: FUNCTION contatos_lista(p_busca text, p_recorte text, p_etapas uuid[], p_entrada_de date, p_entrada_ate date, p_ordem text, p_direcao text, p_limite integer, p_deslocamento integer); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.contatos_lista(p_busca text, p_recorte text, p_etapas uuid[], p_entrada_de date, p_entrada_ate date, p_ordem text, p_direcao text, p_limite integer, p_deslocamento integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.contatos_lista(p_busca text, p_recorte text, p_etapas uuid[], p_entrada_de date, p_entrada_ate date, p_ordem text, p_direcao text, p_limite integer, p_deslocamento integer) TO anon;
GRANT ALL ON FUNCTION public.contatos_lista(p_busca text, p_recorte text, p_etapas uuid[], p_entrada_de date, p_entrada_ate date, p_ordem text, p_direcao text, p_limite integer, p_deslocamento integer) TO authenticated;
GRANT ALL ON FUNCTION public.contatos_lista(p_busca text, p_recorte text, p_etapas uuid[], p_entrada_de date, p_entrada_ate date, p_ordem text, p_direcao text, p_limite integer, p_deslocamento integer) TO service_role;


--
-- Name: FUNCTION contexto_restaurar(p_versao bigint); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.contexto_restaurar(p_versao bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION public.contexto_restaurar(p_versao bigint) TO anon;
GRANT ALL ON FUNCTION public.contexto_restaurar(p_versao bigint) TO authenticated;
GRANT ALL ON FUNCTION public.contexto_restaurar(p_versao bigint) TO service_role;


--
-- Name: FUNCTION contexto_salvar(p_base bigint, p_mudancas jsonb, p_origem public.contexto_origem); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.contexto_salvar(p_base bigint, p_mudancas jsonb, p_origem public.contexto_origem) FROM PUBLIC;
GRANT ALL ON FUNCTION public.contexto_salvar(p_base bigint, p_mudancas jsonb, p_origem public.contexto_origem) TO anon;
GRANT ALL ON FUNCTION public.contexto_salvar(p_base bigint, p_mudancas jsonb, p_origem public.contexto_origem) TO authenticated;
GRANT ALL ON FUNCTION public.contexto_salvar(p_base bigint, p_mudancas jsonb, p_origem public.contexto_origem) TO service_role;


--
-- Name: FUNCTION conversa_do_contato(p_contato uuid, p_conexao uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.conversa_do_contato(p_contato uuid, p_conexao uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.conversa_do_contato(p_contato uuid, p_conexao uuid) TO anon;
GRANT ALL ON FUNCTION public.conversa_do_contato(p_contato uuid, p_conexao uuid) TO authenticated;
GRANT ALL ON FUNCTION public.conversa_do_contato(p_contato uuid, p_conexao uuid) TO service_role;


--
-- Name: FUNCTION custo_das_conversas(p_conversas uuid[]); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.custo_das_conversas(p_conversas uuid[]) FROM PUBLIC;
GRANT ALL ON FUNCTION public.custo_das_conversas(p_conversas uuid[]) TO anon;
GRANT ALL ON FUNCTION public.custo_das_conversas(p_conversas uuid[]) TO authenticated;
GRANT ALL ON FUNCTION public.custo_das_conversas(p_conversas uuid[]) TO service_role;


--
-- Name: FUNCTION dashboard(p_inicio date, p_fim date); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.dashboard(p_inicio date, p_fim date) FROM PUBLIC;
GRANT ALL ON FUNCTION public.dashboard(p_inicio date, p_fim date) TO anon;
GRANT ALL ON FUNCTION public.dashboard(p_inicio date, p_fim date) TO authenticated;
GRANT ALL ON FUNCTION public.dashboard(p_inicio date, p_fim date) TO service_role;


--
-- Name: FUNCTION dashboard_agora(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.dashboard_agora() FROM PUBLIC;
GRANT ALL ON FUNCTION public.dashboard_agora() TO anon;
GRANT ALL ON FUNCTION public.dashboard_agora() TO authenticated;
GRANT ALL ON FUNCTION public.dashboard_agora() TO service_role;


--
-- Name: FUNCTION dashboard_custo(p_de timestamp with time zone, p_ate timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.dashboard_custo(p_de timestamp with time zone, p_ate timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION public.dashboard_custo(p_de timestamp with time zone, p_ate timestamp with time zone) TO anon;
GRANT ALL ON FUNCTION public.dashboard_custo(p_de timestamp with time zone, p_ate timestamp with time zone) TO authenticated;
GRANT ALL ON FUNCTION public.dashboard_custo(p_de timestamp with time zone, p_ate timestamp with time zone) TO service_role;


--
-- Name: FUNCTION dashboard_custo_por_etapa(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.dashboard_custo_por_etapa(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION public.dashboard_custo_por_etapa(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) TO anon;
GRANT ALL ON FUNCTION public.dashboard_custo_por_etapa(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) TO authenticated;
GRANT ALL ON FUNCTION public.dashboard_custo_por_etapa(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) TO service_role;


--
-- Name: FUNCTION dashboard_etapa_em(p_contato uuid, p_instante timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.dashboard_etapa_em(p_contato uuid, p_instante timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION public.dashboard_etapa_em(p_contato uuid, p_instante timestamp with time zone) TO anon;
GRANT ALL ON FUNCTION public.dashboard_etapa_em(p_contato uuid, p_instante timestamp with time zone) TO authenticated;
GRANT ALL ON FUNCTION public.dashboard_etapa_em(p_contato uuid, p_instante timestamp with time zone) TO service_role;


--
-- Name: FUNCTION dashboard_funil(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.dashboard_funil(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION public.dashboard_funil(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) TO anon;
GRANT ALL ON FUNCTION public.dashboard_funil(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) TO authenticated;
GRANT ALL ON FUNCTION public.dashboard_funil(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) TO service_role;


--
-- Name: FUNCTION dashboard_periodo(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.dashboard_periodo(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION public.dashboard_periodo(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) TO anon;
GRANT ALL ON FUNCTION public.dashboard_periodo(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) TO authenticated;
GRANT ALL ON FUNCTION public.dashboard_periodo(p_de timestamp with time zone, p_ate timestamp with time zone, p_estado_em timestamp with time zone) TO service_role;


--
-- Name: FUNCTION dashboard_problemas(p_de timestamp with time zone, p_ate timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.dashboard_problemas(p_de timestamp with time zone, p_ate timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION public.dashboard_problemas(p_de timestamp with time zone, p_ate timestamp with time zone) TO anon;
GRANT ALL ON FUNCTION public.dashboard_problemas(p_de timestamp with time zone, p_ate timestamp with time zone) TO authenticated;
GRANT ALL ON FUNCTION public.dashboard_problemas(p_de timestamp with time zone, p_ate timestamp with time zone) TO service_role;


--
-- Name: FUNCTION desativar_membro(p_membro uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.desativar_membro(p_membro uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.desativar_membro(p_membro uuid) TO anon;
GRANT ALL ON FUNCTION public.desativar_membro(p_membro uuid) TO authenticated;
GRANT ALL ON FUNCTION public.desativar_membro(p_membro uuid) TO service_role;


--
-- Name: FUNCTION desistir_midia(p_msg uuid, p_erro text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.desistir_midia(p_msg uuid, p_erro text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.desistir_midia(p_msg uuid, p_erro text) TO anon;
GRANT ALL ON FUNCTION public.desistir_midia(p_msg uuid, p_erro text) TO authenticated;
GRANT ALL ON FUNCTION public.desistir_midia(p_msg uuid, p_erro text) TO service_role;


--
-- Name: FUNCTION devolver_para_janete(p_conversa uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.devolver_para_janete(p_conversa uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.devolver_para_janete(p_conversa uuid) TO anon;
GRANT ALL ON FUNCTION public.devolver_para_janete(p_conversa uuid) TO authenticated;
GRANT ALL ON FUNCTION public.devolver_para_janete(p_conversa uuid) TO service_role;


--
-- Name: FUNCTION eh_admin(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.eh_admin() FROM PUBLIC;
GRANT ALL ON FUNCTION public.eh_admin() TO anon;
GRANT ALL ON FUNCTION public.eh_admin() TO authenticated;
GRANT ALL ON FUNCTION public.eh_admin() TO service_role;


--
-- Name: FUNCTION eh_membro(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.eh_membro() FROM PUBLIC;
GRANT ALL ON FUNCTION public.eh_membro() TO anon;
GRANT ALL ON FUNCTION public.eh_membro() TO authenticated;
GRANT ALL ON FUNCTION public.eh_membro() TO service_role;


--
-- Name: FUNCTION falhar_envio(p_msg uuid, p_erro text, p_definitivo boolean); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.falhar_envio(p_msg uuid, p_erro text, p_definitivo boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION public.falhar_envio(p_msg uuid, p_erro text, p_definitivo boolean) TO anon;
GRANT ALL ON FUNCTION public.falhar_envio(p_msg uuid, p_erro text, p_definitivo boolean) TO authenticated;
GRANT ALL ON FUNCTION public.falhar_envio(p_msg uuid, p_erro text, p_definitivo boolean) TO service_role;


--
-- Name: FUNCTION falhar_evento(p_id bigint, p_erro text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.falhar_evento(p_id bigint, p_erro text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.falhar_evento(p_id bigint, p_erro text) TO anon;
GRANT ALL ON FUNCTION public.falhar_evento(p_id bigint, p_erro text) TO authenticated;
GRANT ALL ON FUNCTION public.falhar_evento(p_id bigint, p_erro text) TO service_role;


--
-- Name: FUNCTION falhar_rodada(p_rodada uuid, p_motivo public.motivo_humano, p_passageiro boolean); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.falhar_rodada(p_rodada uuid, p_motivo public.motivo_humano, p_passageiro boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION public.falhar_rodada(p_rodada uuid, p_motivo public.motivo_humano, p_passageiro boolean) TO anon;
GRANT ALL ON FUNCTION public.falhar_rodada(p_rodada uuid, p_motivo public.motivo_humano, p_passageiro boolean) TO authenticated;
GRANT ALL ON FUNCTION public.falhar_rodada(p_rodada uuid, p_motivo public.motivo_humano, p_passageiro boolean) TO service_role;


--
-- Name: FUNCTION ids_normalizados(p_ids jsonb); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.ids_normalizados(p_ids jsonb) FROM PUBLIC;
GRANT ALL ON FUNCTION public.ids_normalizados(p_ids jsonb) TO anon;
GRANT ALL ON FUNCTION public.ids_normalizados(p_ids jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.ids_normalizados(p_ids jsonb) TO service_role;


--
-- Name: FUNCTION janete_atualizar_contato(p_rodada uuid, p_campos jsonb); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.janete_atualizar_contato(p_rodada uuid, p_campos jsonb) FROM PUBLIC;
GRANT ALL ON FUNCTION public.janete_atualizar_contato(p_rodada uuid, p_campos jsonb) TO anon;
GRANT ALL ON FUNCTION public.janete_atualizar_contato(p_rodada uuid, p_campos jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.janete_atualizar_contato(p_rodada uuid, p_campos jsonb) TO service_role;


--
-- Name: FUNCTION janete_mover_etapa(p_rodada uuid, p_etapa uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.janete_mover_etapa(p_rodada uuid, p_etapa uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.janete_mover_etapa(p_rodada uuid, p_etapa uuid) TO anon;
GRANT ALL ON FUNCTION public.janete_mover_etapa(p_rodada uuid, p_etapa uuid) TO authenticated;
GRANT ALL ON FUNCTION public.janete_mover_etapa(p_rodada uuid, p_etapa uuid) TO service_role;


--
-- Name: FUNCTION janete_passar_para_humano(p_rodada uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.janete_passar_para_humano(p_rodada uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.janete_passar_para_humano(p_rodada uuid) TO anon;
GRANT ALL ON FUNCTION public.janete_passar_para_humano(p_rodada uuid) TO authenticated;
GRANT ALL ON FUNCTION public.janete_passar_para_humano(p_rodada uuid) TO service_role;


--
-- Name: FUNCTION manutencao_janete(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.manutencao_janete() FROM PUBLIC;
GRANT ALL ON FUNCTION public.manutencao_janete() TO anon;
GRANT ALL ON FUNCTION public.manutencao_janete() TO authenticated;
GRANT ALL ON FUNCTION public.manutencao_janete() TO service_role;


--
-- Name: FUNCTION marcar_lida(p_conversa uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.marcar_lida(p_conversa uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.marcar_lida(p_conversa uuid) TO anon;
GRANT ALL ON FUNCTION public.marcar_lida(p_conversa uuid) TO authenticated;
GRANT ALL ON FUNCTION public.marcar_lida(p_conversa uuid) TO service_role;


--
-- Name: FUNCTION marcar_visto(p_onde text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.marcar_visto(p_onde text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.marcar_visto(p_onde text) TO anon;
GRANT ALL ON FUNCTION public.marcar_visto(p_onde text) TO authenticated;
GRANT ALL ON FUNCTION public.marcar_visto(p_onde text) TO service_role;


--
-- Name: FUNCTION membro_atual(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.membro_atual() FROM PUBLIC;
GRANT ALL ON FUNCTION public.membro_atual() TO anon;
GRANT ALL ON FUNCTION public.membro_atual() TO authenticated;
GRANT ALL ON FUNCTION public.membro_atual() TO service_role;


--
-- Name: FUNCTION mensagem_da_conversa(p_msg uuid, p_conversa uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.mensagem_da_conversa(p_msg uuid, p_conversa uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.mensagem_da_conversa(p_msg uuid, p_conversa uuid) TO anon;
GRANT ALL ON FUNCTION public.mensagem_da_conversa(p_msg uuid, p_conversa uuid) TO authenticated;
GRANT ALL ON FUNCTION public.mensagem_da_conversa(p_msg uuid, p_conversa uuid) TO service_role;


--
-- Name: FUNCTION motor_confere(p_chave text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.motor_confere(p_chave text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.motor_confere(p_chave text) TO anon;
GRANT ALL ON FUNCTION public.motor_confere(p_chave text) TO authenticated;
GRANT ALL ON FUNCTION public.motor_confere(p_chave text) TO service_role;


--
-- Name: FUNCTION motor_endereco(p_url text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.motor_endereco(p_url text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.motor_endereco(p_url text) TO anon;
GRANT ALL ON FUNCTION public.motor_endereco(p_url text) TO authenticated;
GRANT ALL ON FUNCTION public.motor_endereco(p_url text) TO service_role;


--
-- Name: FUNCTION motor_pendencias(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.motor_pendencias() FROM PUBLIC;
GRANT ALL ON FUNCTION public.motor_pendencias() TO anon;
GRANT ALL ON FUNCTION public.motor_pendencias() TO authenticated;
GRANT ALL ON FUNCTION public.motor_pendencias() TO service_role;


--
-- Name: TABLE mensagens; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.mensagens TO anon;
GRANT ALL ON TABLE public.mensagens TO authenticated;
GRANT ALL ON TABLE public.mensagens TO service_role;


--
-- Name: COLUMN mensagens.id; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(id) ON TABLE public.mensagens TO authenticated;


--
-- Name: COLUMN mensagens.conversa_id; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(conversa_id) ON TABLE public.mensagens TO authenticated;


--
-- Name: COLUMN mensagens.conexao_id; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(conexao_id) ON TABLE public.mensagens TO authenticated;


--
-- Name: COLUMN mensagens.direcao; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(direcao) ON TABLE public.mensagens TO authenticated;


--
-- Name: COLUMN mensagens.origem; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(origem) ON TABLE public.mensagens TO authenticated;


--
-- Name: COLUMN mensagens.tipo; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(tipo) ON TABLE public.mensagens TO authenticated;


--
-- Name: COLUMN mensagens.texto; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(texto) ON TABLE public.mensagens TO authenticated;


--
-- Name: COLUMN mensagens.midia_caminho; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(midia_caminho) ON TABLE public.mensagens TO authenticated;


--
-- Name: COLUMN mensagens.midia_mime; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(midia_mime) ON TABLE public.mensagens TO authenticated;


--
-- Name: COLUMN mensagens.midia_tamanho; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(midia_tamanho) ON TABLE public.mensagens TO authenticated;


--
-- Name: COLUMN mensagens.midia_nome; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(midia_nome) ON TABLE public.mensagens TO authenticated;


--
-- Name: COLUMN mensagens.status; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(status) ON TABLE public.mensagens TO authenticated;


--
-- Name: COLUMN mensagens.autor_membro_id; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(autor_membro_id) ON TABLE public.mensagens TO authenticated;


--
-- Name: COLUMN mensagens.responde_a_id; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(responde_a_id) ON TABLE public.mensagens TO authenticated;


--
-- Name: COLUMN mensagens.midia_duracao_s; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(midia_duracao_s) ON TABLE public.mensagens TO authenticated;


--
-- Name: FUNCTION pegar_envios(p_limite integer); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.pegar_envios(p_limite integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.pegar_envios(p_limite integer) TO anon;
GRANT ALL ON FUNCTION public.pegar_envios(p_limite integer) TO authenticated;
GRANT ALL ON FUNCTION public.pegar_envios(p_limite integer) TO service_role;


--
-- Name: FUNCTION pegar_eventos_pendentes(p_limite integer); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.pegar_eventos_pendentes(p_limite integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.pegar_eventos_pendentes(p_limite integer) TO anon;
GRANT ALL ON FUNCTION public.pegar_eventos_pendentes(p_limite integer) TO authenticated;
GRANT ALL ON FUNCTION public.pegar_eventos_pendentes(p_limite integer) TO service_role;


--
-- Name: FUNCTION pegar_midias(p_limite integer); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.pegar_midias(p_limite integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.pegar_midias(p_limite integer) TO anon;
GRANT ALL ON FUNCTION public.pegar_midias(p_limite integer) TO authenticated;
GRANT ALL ON FUNCTION public.pegar_midias(p_limite integer) TO service_role;


--
-- Name: TABLE rodadas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.rodadas TO anon;
GRANT ALL ON TABLE public.rodadas TO authenticated;
GRANT ALL ON TABLE public.rodadas TO service_role;


--
-- Name: FUNCTION pegar_rodadas(p_limite integer); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.pegar_rodadas(p_limite integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.pegar_rodadas(p_limite integer) TO anon;
GRANT ALL ON FUNCTION public.pegar_rodadas(p_limite integer) TO authenticated;
GRANT ALL ON FUNCTION public.pegar_rodadas(p_limite integer) TO service_role;


--
-- Name: FUNCTION preparar_copia(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.preparar_copia() FROM PUBLIC;
GRANT ALL ON FUNCTION public.preparar_copia() TO anon;
GRANT ALL ON FUNCTION public.preparar_copia() TO authenticated;
GRANT ALL ON FUNCTION public.preparar_copia() TO service_role;


--
-- Name: FUNCTION reativar_membro(p_membro uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.reativar_membro(p_membro uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.reativar_membro(p_membro uuid) TO anon;
GRANT ALL ON FUNCTION public.reativar_membro(p_membro uuid) TO authenticated;
GRANT ALL ON FUNCTION public.reativar_membro(p_membro uuid) TO service_role;


--
-- Name: FUNCTION reenviar_mensagem(p_msg uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.reenviar_mensagem(p_msg uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.reenviar_mensagem(p_msg uuid) TO anon;
GRANT ALL ON FUNCTION public.reenviar_mensagem(p_msg uuid) TO authenticated;
GRANT ALL ON FUNCTION public.reenviar_mensagem(p_msg uuid) TO service_role;


--
-- Name: FUNCTION registrar_entrada(p_conexao uuid, p_ids jsonb, p_nome_whatsapp text, p_msg jsonb); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.registrar_entrada(p_conexao uuid, p_ids jsonb, p_nome_whatsapp text, p_msg jsonb) FROM PUBLIC;
GRANT ALL ON FUNCTION public.registrar_entrada(p_conexao uuid, p_ids jsonb, p_nome_whatsapp text, p_msg jsonb) TO anon;
GRANT ALL ON FUNCTION public.registrar_entrada(p_conexao uuid, p_ids jsonb, p_nome_whatsapp text, p_msg jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.registrar_entrada(p_conexao uuid, p_ids jsonb, p_nome_whatsapp text, p_msg jsonb) TO service_role;


--
-- Name: FUNCTION registrar_saida_celular(p_conexao uuid, p_ids jsonb, p_msg jsonb); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.registrar_saida_celular(p_conexao uuid, p_ids jsonb, p_msg jsonb) FROM PUBLIC;
GRANT ALL ON FUNCTION public.registrar_saida_celular(p_conexao uuid, p_ids jsonb, p_msg jsonb) TO anon;
GRANT ALL ON FUNCTION public.registrar_saida_celular(p_conexao uuid, p_ids jsonb, p_msg jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.registrar_saida_celular(p_conexao uuid, p_ids jsonb, p_msg jsonb) TO service_role;


--
-- Name: FUNCTION reordenar_etapas(p_ids uuid[]); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.reordenar_etapas(p_ids uuid[]) FROM PUBLIC;
GRANT ALL ON FUNCTION public.reordenar_etapas(p_ids uuid[]) TO anon;
GRANT ALL ON FUNCTION public.reordenar_etapas(p_ids uuid[]) TO authenticated;
GRANT ALL ON FUNCTION public.reordenar_etapas(p_ids uuid[]) TO service_role;


--
-- Name: FUNCTION rodada_rodando(p_rodada uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.rodada_rodando(p_rodada uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.rodada_rodando(p_rodada uuid) TO anon;
GRANT ALL ON FUNCTION public.rodada_rodando(p_rodada uuid) TO authenticated;
GRANT ALL ON FUNCTION public.rodada_rodando(p_rodada uuid) TO service_role;


--
-- Name: FUNCTION texto_busca(p_texto text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.texto_busca(p_texto text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.texto_busca(p_texto text) TO anon;
GRANT ALL ON FUNCTION public.texto_busca(p_texto text) TO authenticated;
GRANT ALL ON FUNCTION public.texto_busca(p_texto text) TO service_role;


--
-- Name: FUNCTION texto_normalizado(p_texto text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.texto_normalizado(p_texto text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.texto_normalizado(p_texto text) TO anon;
GRANT ALL ON FUNCTION public.texto_normalizado(p_texto text) TO authenticated;
GRANT ALL ON FUNCTION public.texto_normalizado(p_texto text) TO service_role;


--
-- Name: FUNCTION tg_auth_primeira_conta(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_auth_primeira_conta() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_auth_primeira_conta() TO anon;
GRANT ALL ON FUNCTION public.tg_auth_primeira_conta() TO authenticated;
GRANT ALL ON FUNCTION public.tg_auth_primeira_conta() TO service_role;


--
-- Name: FUNCTION tg_conexoes_desativar(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_conexoes_desativar() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_conexoes_desativar() TO anon;
GRANT ALL ON FUNCTION public.tg_conexoes_desativar() TO authenticated;
GRANT ALL ON FUNCTION public.tg_conexoes_desativar() TO service_role;


--
-- Name: FUNCTION tg_conexoes_eventos(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_conexoes_eventos() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_conexoes_eventos() TO anon;
GRANT ALL ON FUNCTION public.tg_conexoes_eventos() TO authenticated;
GRANT ALL ON FUNCTION public.tg_conexoes_eventos() TO service_role;


--
-- Name: FUNCTION tg_conexoes_segredos_formato(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_conexoes_segredos_formato() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_conexoes_segredos_formato() TO anon;
GRANT ALL ON FUNCTION public.tg_conexoes_segredos_formato() TO authenticated;
GRANT ALL ON FUNCTION public.tg_conexoes_segredos_formato() TO service_role;


--
-- Name: FUNCTION tg_contatos_antes(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_contatos_antes() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_contatos_antes() TO anon;
GRANT ALL ON FUNCTION public.tg_contatos_antes() TO authenticated;
GRANT ALL ON FUNCTION public.tg_contatos_antes() TO service_role;


--
-- Name: FUNCTION tg_contatos_historico(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_contatos_historico() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_contatos_historico() TO anon;
GRANT ALL ON FUNCTION public.tg_contatos_historico() TO authenticated;
GRANT ALL ON FUNCTION public.tg_contatos_historico() TO service_role;


--
-- Name: FUNCTION tg_contexto_autor(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_contexto_autor() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_contexto_autor() TO anon;
GRANT ALL ON FUNCTION public.tg_contexto_autor() TO authenticated;
GRANT ALL ON FUNCTION public.tg_contexto_autor() TO service_role;


--
-- Name: FUNCTION tg_contexto_numerar(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_contexto_numerar() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_contexto_numerar() TO anon;
GRANT ALL ON FUNCTION public.tg_contexto_numerar() TO authenticated;
GRANT ALL ON FUNCTION public.tg_contexto_numerar() TO service_role;


--
-- Name: FUNCTION tg_etapas_arquivar(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_etapas_arquivar() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_etapas_arquivar() TO anon;
GRANT ALL ON FUNCTION public.tg_etapas_arquivar() TO authenticated;
GRANT ALL ON FUNCTION public.tg_etapas_arquivar() TO service_role;


--
-- Name: FUNCTION tg_ia_chaves_formato(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_ia_chaves_formato() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_ia_chaves_formato() TO anon;
GRANT ALL ON FUNCTION public.tg_ia_chaves_formato() TO authenticated;
GRANT ALL ON FUNCTION public.tg_ia_chaves_formato() TO service_role;


--
-- Name: FUNCTION tg_membros_normalizar(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_membros_normalizar() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_membros_normalizar() TO anon;
GRANT ALL ON FUNCTION public.tg_membros_normalizar() TO authenticated;
GRANT ALL ON FUNCTION public.tg_membros_normalizar() TO service_role;


--
-- Name: FUNCTION tg_membros_ultimo_admin(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_membros_ultimo_admin() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_membros_ultimo_admin() TO anon;
GRANT ALL ON FUNCTION public.tg_membros_ultimo_admin() TO authenticated;
GRANT ALL ON FUNCTION public.tg_membros_ultimo_admin() TO service_role;


--
-- Name: FUNCTION tg_mensagens_antes_inserir(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_mensagens_antes_inserir() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_mensagens_antes_inserir() TO anon;
GRANT ALL ON FUNCTION public.tg_mensagens_antes_inserir() TO authenticated;
GRANT ALL ON FUNCTION public.tg_mensagens_antes_inserir() TO service_role;


--
-- Name: FUNCTION tg_mensagens_apos_atualizar(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_mensagens_apos_atualizar() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_mensagens_apos_atualizar() TO anon;
GRANT ALL ON FUNCTION public.tg_mensagens_apos_atualizar() TO authenticated;
GRANT ALL ON FUNCTION public.tg_mensagens_apos_atualizar() TO service_role;


--
-- Name: FUNCTION tg_mensagens_apos_inserir(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_mensagens_apos_inserir() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_mensagens_apos_inserir() TO anon;
GRANT ALL ON FUNCTION public.tg_mensagens_apos_inserir() TO authenticated;
GRANT ALL ON FUNCTION public.tg_mensagens_apos_inserir() TO service_role;


--
-- Name: FUNCTION tg_mensagens_envio_falhou(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_mensagens_envio_falhou() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_mensagens_envio_falhou() TO anon;
GRANT ALL ON FUNCTION public.tg_mensagens_envio_falhou() TO authenticated;
GRANT ALL ON FUNCTION public.tg_mensagens_envio_falhou() TO service_role;


--
-- Name: FUNCTION tg_tocar_atualizada_em(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_tocar_atualizada_em() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_tocar_atualizada_em() TO anon;
GRANT ALL ON FUNCTION public.tg_tocar_atualizada_em() TO authenticated;
GRANT ALL ON FUNCTION public.tg_tocar_atualizada_em() TO service_role;


--
-- Name: FUNCTION tg_tocar_atualizado_em(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tg_tocar_atualizado_em() FROM PUBLIC;
GRANT ALL ON FUNCTION public.tg_tocar_atualizado_em() TO anon;
GRANT ALL ON FUNCTION public.tg_tocar_atualizado_em() TO authenticated;
GRANT ALL ON FUNCTION public.tg_tocar_atualizado_em() TO service_role;


--
-- Name: FUNCTION tipo_de_mensagem(p_tipo text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.tipo_de_mensagem(p_tipo text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.tipo_de_mensagem(p_tipo text) TO anon;
GRANT ALL ON FUNCTION public.tipo_de_mensagem(p_tipo text) TO authenticated;
GRANT ALL ON FUNCTION public.tipo_de_mensagem(p_tipo text) TO service_role;


--
-- Name: FUNCTION trocar_papel_membro(p_membro uuid, p_papel public.papel_membro); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.trocar_papel_membro(p_membro uuid, p_papel public.papel_membro) FROM PUBLIC;
GRANT ALL ON FUNCTION public.trocar_papel_membro(p_membro uuid, p_papel public.papel_membro) TO anon;
GRANT ALL ON FUNCTION public.trocar_papel_membro(p_membro uuid, p_papel public.papel_membro) TO authenticated;
GRANT ALL ON FUNCTION public.trocar_papel_membro(p_membro uuid, p_papel public.papel_membro) TO service_role;


--
-- Name: TABLE auditoria; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.auditoria TO anon;
GRANT ALL ON TABLE public.auditoria TO authenticated;
GRANT ALL ON TABLE public.auditoria TO service_role;


--
-- Name: SEQUENCE auditoria_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.auditoria_id_seq TO anon;
GRANT ALL ON SEQUENCE public.auditoria_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.auditoria_id_seq TO service_role;


--
-- Name: TABLE conexao_eventos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.conexao_eventos TO anon;
GRANT ALL ON TABLE public.conexao_eventos TO authenticated;
GRANT ALL ON TABLE public.conexao_eventos TO service_role;


--
-- Name: TABLE conexoes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.conexoes TO anon;
GRANT ALL ON TABLE public.conexoes TO authenticated;
GRANT ALL ON TABLE public.conexoes TO service_role;


--
-- Name: COLUMN conexoes.id; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(id) ON TABLE public.conexoes TO authenticated;


--
-- Name: COLUMN conexoes.gateway; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(gateway) ON TABLE public.conexoes TO authenticated;


--
-- Name: COLUMN conexoes.nome; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(nome) ON TABLE public.conexoes TO authenticated;


--
-- Name: COLUMN conexoes.id_externo; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(id_externo) ON TABLE public.conexoes TO authenticated;


--
-- Name: COLUMN conexoes.parametros; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(parametros) ON TABLE public.conexoes TO authenticated;


--
-- Name: COLUMN conexoes.status; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(status) ON TABLE public.conexoes TO authenticated;


--
-- Name: COLUMN conexoes.ultimo_erro; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(ultimo_erro) ON TABLE public.conexoes TO authenticated;


--
-- Name: COLUMN conexoes.ativa; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(ativa) ON TABLE public.conexoes TO authenticated;


--
-- Name: COLUMN conexoes.criado_por; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(criado_por) ON TABLE public.conexoes TO authenticated;


--
-- Name: COLUMN conexoes.criado_em; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(criado_em) ON TABLE public.conexoes TO authenticated;


--
-- Name: COLUMN conexoes.atualizado_em; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(atualizado_em) ON TABLE public.conexoes TO authenticated;


--
-- Name: TABLE configuracao; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.configuracao TO anon;
GRANT ALL ON TABLE public.configuracao TO authenticated;
GRANT ALL ON TABLE public.configuracao TO service_role;


--
-- Name: TABLE contato_etapa_historico; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.contato_etapa_historico TO anon;
GRANT ALL ON TABLE public.contato_etapa_historico TO authenticated;
GRANT ALL ON TABLE public.contato_etapa_historico TO service_role;


--
-- Name: TABLE contato_identificadores; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.contato_identificadores TO anon;
GRANT ALL ON TABLE public.contato_identificadores TO authenticated;
GRANT ALL ON TABLE public.contato_identificadores TO service_role;


--
-- Name: TABLE contatos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.contatos TO anon;
GRANT ALL ON TABLE public.contatos TO authenticated;
GRANT ALL ON TABLE public.contatos TO service_role;


--
-- Name: COLUMN contatos.nome; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(nome) ON TABLE public.contatos TO authenticated;


--
-- Name: COLUMN contatos.email; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(email) ON TABLE public.contatos TO authenticated;


--
-- Name: COLUMN contatos.empresa; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(empresa) ON TABLE public.contatos TO authenticated;


--
-- Name: COLUMN contatos.observacoes; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(observacoes) ON TABLE public.contatos TO authenticated;


--
-- Name: COLUMN contatos.resumo_janete; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(resumo_janete) ON TABLE public.contatos TO authenticated;


--
-- Name: COLUMN contatos.etapa_id; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(etapa_id) ON TABLE public.contatos TO authenticated;


--
-- Name: TABLE contexto_versoes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.contexto_versoes TO anon;
GRANT ALL ON TABLE public.contexto_versoes TO authenticated;
GRANT ALL ON TABLE public.contexto_versoes TO service_role;


--
-- Name: SEQUENCE contexto_versoes_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.contexto_versoes_id_seq TO anon;
GRANT ALL ON SEQUENCE public.contexto_versoes_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.contexto_versoes_id_seq TO service_role;


--
-- Name: TABLE conversa_eventos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.conversa_eventos TO anon;
GRANT ALL ON TABLE public.conversa_eventos TO authenticated;
GRANT ALL ON TABLE public.conversa_eventos TO service_role;


--
-- Name: TABLE conversas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.conversas TO anon;
GRANT ALL ON TABLE public.conversas TO authenticated;
GRANT ALL ON TABLE public.conversas TO service_role;


--
-- Name: TABLE convites; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.convites TO anon;
GRANT ALL ON TABLE public.convites TO authenticated;
GRANT ALL ON TABLE public.convites TO service_role;


--
-- Name: TABLE etapas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.etapas TO anon;
GRANT ALL ON TABLE public.etapas TO authenticated;
GRANT ALL ON TABLE public.etapas TO service_role;


--
-- Name: COLUMN etapas.nome; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(nome),UPDATE(nome) ON TABLE public.etapas TO authenticated;


--
-- Name: COLUMN etapas.cor; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(cor),UPDATE(cor) ON TABLE public.etapas TO authenticated;


--
-- Name: COLUMN etapas.ordem; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(ordem),UPDATE(ordem) ON TABLE public.etapas TO authenticated;


--
-- Name: COLUMN etapas.tipo; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(tipo),UPDATE(tipo) ON TABLE public.etapas TO authenticated;


--
-- Name: COLUMN etapas.janete_pode_mover; Type: ACL; Schema: public; Owner: postgres
--

GRANT INSERT(janete_pode_mover),UPDATE(janete_pode_mover) ON TABLE public.etapas TO authenticated;


--
-- Name: COLUMN etapas.arquivada; Type: ACL; Schema: public; Owner: postgres
--

GRANT UPDATE(arquivada) ON TABLE public.etapas TO authenticated;


--
-- Name: TABLE eventos_webhook; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.eventos_webhook TO anon;
GRANT ALL ON TABLE public.eventos_webhook TO authenticated;
GRANT ALL ON TABLE public.eventos_webhook TO service_role;


--
-- Name: SEQUENCE eventos_webhook_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.eventos_webhook_id_seq TO anon;
GRANT ALL ON SEQUENCE public.eventos_webhook_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.eventos_webhook_id_seq TO service_role;


--
-- Name: TABLE ia_chamadas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ia_chamadas TO anon;
GRANT ALL ON TABLE public.ia_chamadas TO authenticated;
GRANT ALL ON TABLE public.ia_chamadas TO service_role;


--
-- Name: SEQUENCE ia_chamadas_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.ia_chamadas_id_seq TO anon;
GRANT ALL ON SEQUENCE public.ia_chamadas_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.ia_chamadas_id_seq TO service_role;


--
-- Name: TABLE ia_chaves; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ia_chaves TO anon;
GRANT ALL ON TABLE public.ia_chaves TO authenticated;
GRANT ALL ON TABLE public.ia_chaves TO service_role;


--
-- Name: COLUMN ia_chaves.id; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(id) ON TABLE public.ia_chaves TO authenticated;


--
-- Name: COLUMN ia_chaves.finalidade; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(finalidade) ON TABLE public.ia_chaves TO authenticated;


--
-- Name: COLUMN ia_chaves.provedor; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(provedor) ON TABLE public.ia_chaves TO authenticated;


--
-- Name: COLUMN ia_chaves.modelo; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(modelo) ON TABLE public.ia_chaves TO authenticated;


--
-- Name: COLUMN ia_chaves.workspace_id; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(workspace_id) ON TABLE public.ia_chaves TO authenticated;


--
-- Name: COLUMN ia_chaves.ultimos4; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(ultimos4) ON TABLE public.ia_chaves TO authenticated;


--
-- Name: COLUMN ia_chaves.status; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(status) ON TABLE public.ia_chaves TO authenticated;


--
-- Name: COLUMN ia_chaves.ultimo_erro; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(ultimo_erro) ON TABLE public.ia_chaves TO authenticated;


--
-- Name: COLUMN ia_chaves.validada_em; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(validada_em) ON TABLE public.ia_chaves TO authenticated;


--
-- Name: COLUMN ia_chaves.atualizada_em; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(atualizada_em) ON TABLE public.ia_chaves TO authenticated;


--
-- Name: COLUMN ia_chaves.atualizada_por; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(atualizada_por) ON TABLE public.ia_chaves TO authenticated;


--
-- Name: COLUMN ia_chaves.criado_em; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT(criado_em) ON TABLE public.ia_chaves TO authenticated;


--
-- Name: TABLE ia_precos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.ia_precos TO anon;
GRANT ALL ON TABLE public.ia_precos TO authenticated;
GRANT ALL ON TABLE public.ia_precos TO service_role;


--
-- Name: TABLE membros; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.membros TO anon;
GRANT ALL ON TABLE public.membros TO authenticated;
GRANT ALL ON TABLE public.membros TO service_role;


--
-- Name: TABLE motor; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.motor TO anon;
GRANT ALL ON TABLE public.motor TO authenticated;
GRANT ALL ON TABLE public.motor TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--


