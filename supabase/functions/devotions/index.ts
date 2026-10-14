/* ══════════════════════════════════════════════════════════
   devotions — 말씀 나눔 통로

   사이트에 박힌 anon 키로는 devotion 표에 아무 권한이 없다.
   읽기도 쓰기도 전부 이 함수를 거치고, 이 함수가 팀 암호를 확인한다.
   표에 손대는 것은 이 함수가 가진 service_role 키뿐이다.

   필요한 비밀값 (Supabase → Edge Functions → Secrets)
     TEAM_PASSCODE   팀 암호
     PUBLIC_OPEN     'true' 면 공개 통로가 열린다 (공연 뒤에 켠다)
   SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 는 자동으로 들어온다.
══════════════════════════════════════════════════════════ */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const TABLE = 'devotion';
const WEEKLY = 'weekly_verse';

/* 브라우저는 본 요청 전에 '이 헤더 보내도 되냐' 고 먼저 묻는다(preflight).
   여기 적지 않은 헤더가 하나라도 있으면 본 요청을 아예 보내지 않는다.
   우리는 apikey 와 authorization 도 함께 보내므로 셋 다 적어야 한다.
   (터미널 curl 은 이 절차가 없어서, 빠뜨려도 거기서는 멀쩡해 보인다.) */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

const db = () =>
  createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

/* ── 암호 때려맞히기 늦추기 ────────────────────────────────
   팀 암호가 짧아서(숫자 네 자리) 자동으로 돌려 보는 공격에 약하다.
   틀리면 일부러 늦게 답하고, 같은 주소에서 연달아 틀리면 잠시 막는다.
   함수가 새로 뜨면 기억이 사라지므로 완벽한 방패는 아니다. 암호를
   길게 바꾸는 것이 근본 해결이고, 이건 시간을 버는 장치다. */
const fails = new Map<string, { n: number; until: number }>();
const LOCK_AFTER = 8;          // 이만큼 틀리면
const LOCK_MS = 10 * 60 * 1000; // 10분 막는다

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function locked(ip: string) {
  const f = fails.get(ip);
  return !!f && f.until > Date.now();
}

function noteFail(ip: string) {
  const f = fails.get(ip) ?? { n: 0, until: 0 };
  f.n += 1;
  if (f.n >= LOCK_AFTER) { f.until = Date.now() + LOCK_MS; f.n = 0; }
  fails.set(ip, f);
}

/** 길이가 달라도 같은 시간이 걸리게 비교한다 */
function sameSecret(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** 그 주의 월요일 (주차로 묶어 보여주려고) */
function weekOf(d = new Date()) {
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const day = (kst.getUTCDay() + 6) % 7;             // 월요일 = 0
  kst.setUTCDate(kst.getUTCDate() - day);
  return kst.toISOString().slice(0, 10);
}

const str = (v: unknown, max: number) => {
  const s = typeof v === 'string' ? v.trim() : '';
  return s ? s.slice(0, max) : null;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST 만 받습니다' }, 405);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: '잘못된 요청' }, 400); }

  const action = String(body.action ?? '');
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';

  // 모두에게 공개한 글 — 암호 없이 언제나 열린다.
  // 쓴 사람이 글마다 직접 고른 것이라 PUBLIC_OPEN 과 상관없다.
  if (action === 'open') {
    const { data, error } = await db()
      .from(TABLE)
      .select('id, created_at, week, display_name, verse_ref, body, views, likes')
      .eq('hidden', false).eq('share_now', true)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return json({ error: '불러오지 못했습니다' }, 500);
    return json({ items: data });
  }

  // 공연 뒤 공개 통로 — '공연이 끝나면 공개' 를 고른 글. 공연 뒤에 켠다.
  if (action === 'public') {
    if (Deno.env.get('PUBLIC_OPEN') !== 'true') return json({ open: false, items: [] });
    const { data, error } = await db()
      .from(TABLE)
      .select('id, created_at, week, display_name, verse_ref, body, views, likes')
      .eq('hidden', false).or('share_later.eq.true,share_now.eq.true')
      .order('created_at', { ascending: false });
    if (error) return json({ error: '불러오지 못했습니다' }, 500);
    return json({ open: true, items: data });
  }

  // 여기서부터는 팀 암호가 필요하다
  const expected = Deno.env.get('TEAM_PASSCODE') ?? '';
  const given = String(body.passcode ?? '');

  if (locked(ip)) return json({ error: '잠시 뒤에 다시 시도해주세요' }, 429);

  // 암호가 아예 설정되지 않은 것과 틀린 것은 다른 문제다.
  // 같은 말로 답하면 설정을 빠뜨렸을 때 팀 전체가 '암호가 틀렸나' 하고 헤맨다.
  if (!expected) {
    return json({ error: '아직 준비가 되지 않았어요. 관리자에게 알려주세요.', setup: 'TEAM_PASSCODE 가 설정되지 않았습니다' }, 503);
  }

  if (!sameSecret(given, expected)) {
    noteFail(ip);
    await sleep(600);
    return json({ error: '암호가 맞지 않습니다' }, 401);
  }
  fails.delete(ip);

  const sb = db();

  if (action === 'list') {
    // edit_token 은 돌려주지 않는다. 내 글인지는 브라우저가 스스로 안다.
    const { data, error } = await sb
      .from(TABLE)
      .select('id, created_at, week, display_name, verse_ref, body, share_later, share_now, views, likes')
      .eq('hidden', false)
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) return json({ error: '불러오지 못했습니다' }, 500);

    // 이번 주에 함께 읽기로 걸어 둔 말씀 (없으면 null)
    const { data: wk } = await sb
      .from(WEEKLY)
      .select('week, verse_ref, note')
      .eq('week', weekOf())
      .maybeSingle();

    return json({ items: data, weekly: wk ?? null });
  }

  if (action === 'create') {
    const text = str(body.body, 2000);
    if (!text) return json({ error: '묵상을 적어주세요' }, 400);
    const token = String(body.edit_token ?? '');
    if (token.length < 20) return json({ error: '잘못된 요청' }, 400);

    const row = {
      week: weekOf(),
      display_name: str(body.display_name, 20),   // 비어 있으면 익명
      verse_ref: str(body.verse_ref, 60),
      body: text,
      share_later: body.share_later === true,
      share_now: body.share_now === true,
      edit_token: token,
    };
    const { data, error } = await sb.from(TABLE).insert(row).select('id, created_at, week').single();
    if (error) return json({ error: '저장하지 못했습니다' }, 500);
    return json({ item: data });
  }

  if (action === 'view') {
    const id = String(body.id ?? '');
    if (!id) return json({ error: '잘못된 요청' }, 400);
    // 같은 사람이 여러 번 열어도 한 번만 센다(브라우저가 판단해 보낸다)
    const { error } = await sb.rpc('devotion_view', { p_id: id });
    if (error) return json({ error: '기록하지 못했습니다' }, 500);
    return json({ ok: true });
  }

  if (action === 'like') {
    const id = String(body.id ?? '');
    if (!id) return json({ error: '잘못된 요청' }, 400);
    const delta = body.on === true ? 1 : -1;
    const { data, error } = await sb.rpc('devotion_like', { p_id: id, p_delta: delta });
    if (error) return json({ error: '기록하지 못했습니다' }, 500);
    return json({ likes: data });
  }

  if (action === 'remove') {
    const id = String(body.id ?? '');
    const token = String(body.edit_token ?? '');
    if (!id || token.length < 20) return json({ error: '잘못된 요청' }, 400);
    // 본인이 가진 열쇠가 맞을 때만 지워진다
    const { error, count } = await sb
      .from(TABLE).delete({ count: 'exact' })
      .eq('id', id).eq('edit_token', token);
    if (error) return json({ error: '지우지 못했습니다' }, 500);
    if (!count) return json({ error: '내가 쓴 글만 지울 수 있습니다' }, 403);
    return json({ ok: true });
  }

  return json({ error: '알 수 없는 요청' }, 400);
});
