# 말씀 나눔 — Supabase 설정

참여 신청과 다른 점이 하나 있다. 참여 신청은 **넣기만** 하면 됐지만,
말씀 나눔은 **서로 읽어야** 한다. 그래서 읽는 길을 열어야 하는데,
그 길을 사이트에 박힌 키에 주면 인터넷의 누구나 우리 묵상을 읽게 된다.

그래서 읽기도 쓰기도 **Edge Function 하나**를 거친다. 그 함수만 팀 암호를
확인하고 표에 손댈 수 있다. 사이트의 anon 키는 이 표에 아무 권한이 없다.

```
브라우저 ──(암호 + 글)──▶ devotions 함수 ──▶ devotion 표
                           암호 확인          anon 키로는 접근 불가
```

---

## 1. 표 만들기

**SQL Editor** 에 붙여넣고 실행한다.

```sql
create table public.devotion (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  week         date not null,
  display_name text         check (display_name is null or char_length(display_name) <= 20),
  verse_ref    text         check (verse_ref    is null or char_length(verse_ref)    <= 60),
  body         text not null check (char_length(body) between 1 and 2000),
  share_later  boolean not null default false,
  edit_token   text not null check (char_length(edit_token) between 20 and 100),
  hidden       boolean not null default false
);

create index devotion_week_idx on public.devotion (week desc, created_at desc);

-- 접근 규칙을 켜고, 정책은 하나도 만들지 않는다.
-- 정책이 없으면 anon 키로는 읽기·쓰기·삭제가 전부 막힌다.
-- 표에 손댈 수 있는 것은 service_role 키를 가진 Edge Function 뿐이다.
alter table public.devotion enable row level security;
```

> 참여 신청(`rsvp`) 때와 달리 **정책을 안 만드는 것이 맞다.** 거기서는 anon 이
> 넣을 수 있어야 했지만, 여기서는 anon 이 아무것도 못 해야 한다.

## 2. 암호를 비밀값으로 등록

**Edge Functions → Secrets** 에서 두 개를 넣는다.

| 이름 | 값 |
|---|---|
| `TEAM_PASSCODE` | 팀 암호 (단톡방에만 공유) |
| `PUBLIC_OPEN` | `false` — 공연이 끝나면 `true` 로 바꾼다 |

`SUPABASE_URL` 과 `SUPABASE_SERVICE_ROLE_KEY` 는 자동으로 들어가므로 넣지 않는다.

## 3. 함수 배포

```bash
npx supabase login
npx supabase link --project-ref kjlaluzoeygsqojnioce
npx supabase functions deploy devotions
```

배포되면 주소는 이렇게 된다.

```
https://kjlaluzoeygsqojnioce.supabase.co/functions/v1/devotions
```

이 주소를 `src/js/app.js` 의 `WORD.endpoint` 에 넣으면 연결이 끝난다.
(함수 이름을 그대로 두면 이미 맞춰져 있다.)

---

## 암호에 대하여

지금 암호는 숫자 네 자리다. 경우의 수가 1만 개뿐이고 흔한 번호라
자동으로 돌려 보는 공격에 약하다. 함수 쪽에 두 가지 장치를 뒀다.

- 틀리면 **일부러 늦게** 답한다 (0.6초)
- 같은 주소에서 **여덟 번 틀리면 10분 막는다**

다만 함수가 새로 뜨면 그 기억이 사라지므로 완전한 방패는 아니다.
**근본 해결은 암호를 길게 바꾸는 것이다.** 바꾸는 건 Secrets 값 하나만
고치면 되고 코드는 건드리지 않아도 된다. 팀 이름을 뒤에 붙이는 정도로도
경우의 수가 비교할 수 없이 커진다.

---

## 공연 뒤에 할 일

1. **공개 통로 열기** — `PUBLIC_OPEN` 을 `true` 로 바꾼다.
   그러면 `share_later = true` 인 글만 암호 없이 열린다.

2. **비공개 글 정리** — "팀끼리만" 으로 남긴 글을 약속대로 지운다.

```sql
delete from public.devotion where share_later = false;
```

## 글 하나를 가리고 싶을 때

지우지 않고 가린다. 오해였다면 되돌릴 수 있다.

```sql
update public.devotion set hidden = true where id = '...';
```

## 누가 썼는지

**관리자도 모른다.** 이름 칸 외에는 아무것도 저장하지 않는다.
`edit_token` 은 글쓴이 브라우저에만 있는 열쇠이고, 본인 글을 지울 때만 쓰인다.
목록을 내려줄 때는 이 값을 빼고 보낸다.
