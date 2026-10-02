# 참여 신청 — Supabase 연결하기

사이트는 서버가 없는 정적 페이지라, 신청 내용을 받아 둘 곳이 따로 필요하다.
Supabase 무료 프로젝트 하나면 된다. 아래 3단계만 하면 연결이 끝난다.

---

## 1. 프로젝트 만들기

1. https://supabase.com 에서 가입 (이메일만 있으면 된다)
2. **New project** → 이름은 아무거나, **Region 은 Northeast Asia (Seoul)** 로
3. 데이터베이스 비밀번호가 나오면 따로 적어 둔다 (이 작업엔 안 쓰지만 분실하면 곤란하다)

## 2. 표 만들기

왼쪽 메뉴 **SQL Editor** 에서 아래를 그대로 붙여넣고 실행(Run)한다.

```sql
create table public.rsvp (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 1 and 40),
  church     text         check (church  is null or char_length(church)  <= 60),
  message    text         check (message is null or char_length(message) <= 500)
);

-- 접근 규칙을 켠다. 이걸 켜야 아래 정책이 효력을 갖는다.
alter table public.rsvp enable row level security;

-- 누구나 '넣기'만 할 수 있다. 읽기 정책은 일부러 만들지 않는다.
create policy "anon insert only" on public.rsvp
  for insert to anon
  with check (true);
```

### 왜 이렇게 하나

사이트에 넣는 키(anon key)는 공개 저장소에 그대로 올라간다. 숨길 수 없다.
그래서 **그 키로 할 수 있는 일 자체를 '넣기'로 묶어** 둔다.
읽기 정책이 없으므로 이 키로는 신청자 명단을 꺼내 볼 수 없다.
명단은 Supabase 관리자 화면에 로그인해야만 보인다.

> `service_role` 키는 모든 제한을 무시한다. **절대 사이트 코드에 넣지 말 것.**

## 3. 사이트에 키 넣기

**Project Settings → API** 에서 두 가지를 복사한다.

- **Project URL** — `https://xxxxxxxx.supabase.co`
- **anon public** 키 — `eyJ...` 로 시작하는 긴 문자열

`src/js/app.js` 에서 `const RSVP = {` 를 찾아 두 줄을 채운다.

```js
const RSVP = {
  url:   'https://xxxxxxxx.supabase.co',
  key:   'eyJ...',
  table: 'rsvp'
};
```

고친 뒤에는 **캐시 번호 세 곳을 함께 올린다.**
`index.html` 의 `?v=`, `sw.js` 의 `?v=`, `sw.js` 의 `CACHE_NAME`.
안 올리면 방문자 브라우저가 예전 파일을 계속 쓴다.

---

## 신청자 명단 보기

왼쪽 메뉴 **Table Editor → rsvp**. 표로 보이고, 오른쪽 위에서 CSV 로 내려받을 수 있다.

## 공연이 끝나면

안내문에 "공연이 끝나면 바로 지웁니다" 라고 적어 두었다. 약속한 대로 지운다.

```sql
truncate table public.rsvp;
```

## 받는 항목

| 칸 | 필수 | 길이 제한 |
|---|---|---|
| 이름 | 예 | 40자 |
| 소속 교회 | 아니오 | 60자 |
| 기대하는 점 또는 한마디 | 아니오 | 500자 |

길이 제한은 사이트와 데이터베이스 **양쪽에** 걸려 있다.
사이트 쪽 제한은 브라우저에서 우회할 수 있으므로, 표에 건 `check` 가 마지막 방어선이다.

## 장난 신청 막기

- 사람 눈에 안 보이는 함정 입력칸을 두었다. 자동 프로그램이 채우면 저장하지 않고 넘어간다.
- 같은 브라우저에서 30초 안에 다시 보내지 못하게 막았다.

둘 다 가벼운 장치다. 신청이 몰리거나 장난이 심해지면 Supabase 의
Edge Function 앞단에 Cloudflare Turnstile 같은 걸 붙이는 방법이 있다.
