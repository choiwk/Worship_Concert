# 방문 통계 (Supabase `events` 표)

사이트가 방문·화면 이동·버튼·공유를 익명으로 한 줄씩 `events` 표에 넣습니다.
참여 신청(`rsvp`)과 같은 프로젝트, 같은 공개 키를 씁니다. 공개 키로는 **넣기만** 되고 읽기·고치기·지우기는 안 됩니다.

## 1. 표 만들기 (한 번만)

Supabase → SQL Editor 에 붙여 넣고 Run.

```sql
create table public.events (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 1 and 30),
  detail     text check (char_length(detail) <= 80),
  visitor    text check (char_length(visitor) <= 40),
  src        text check (char_length(src) <= 20)
);

alter table public.events enable row level security;

create policy "anon can insert events"
  on public.events for insert to anon
  with check (true);

grant insert on public.events to anon;
```

## 2. 무엇이 쌓이나

| name | detail | 언제 |
|---|---|---|
| `visit` | | 사이트를 열 때 |
| `view` | `main`, `songs`, `songs/06`, `word`, `artists`, `story` | 화면을 볼 때 |
| `open` | `share`, `rsvp`, `donate`, `stage`, `verse`, `note`, `member`, `word`, `wordRead` | 팝업을 열 때 |
| `share` | `kakao`, `copy`, `qr` (예전 기록에는 `instagram` 도 있음) | 공유 시트에서 누를 때 (`qr` 은 QR 보여주기를 펼칠 때) |
| `share_sent` | `native` | 휴대폰 공유창에서 실제로 보냈을 때 |
| `rsvp_done` | | 참여 신청이 저장됐을 때 |
| `rsvp_invite` | | 신청 완료 화면에서 「같이 갈 친구도 불러 볼까요?」를 눌렀을 때 |
| `bgm` | `on`, `off` | 배경음악을 켜고 끌 때 |
| `link` | `www.youtube.com/...` 등 | 바깥 링크를 누를 때 |

- `visitor`: 기기마다 만든 무작위 번호입니다. 같은 사람 수를 셀 때 씁니다. 개인정보는 없습니다.
- `src`: 주소에 `?from=qr` 처럼 붙여 들어온 경로입니다. 포스터 QR을 `https://choiwk.github.io/Worship_Concert/?from=qr` 로 만들면 QR로 들어온 사람만 따로 셀 수 있습니다. 공유 시트의 「QR 보여주기」는 `?from=friend` 라서 옆 친구에게 보여 줘서 들어온 방문이 따로 셉니다.
- localhost 에서 본 것은 보내지 않습니다.

## 3. 숫자 보기 (SQL Editor, 저장해 두고 다시 Run)

```sql
-- 한눈에
select
  count(*) filter (where name = 'visit')                    as 총방문,
  count(distinct visitor) filter (where name = 'visit')     as 방문한_기기수,
  count(*) filter (where name = 'share')                    as 공유버튼,
  count(*) filter (where name = 'share_sent')               as 공유완료,
  count(*) filter (where name = 'rsvp_done')                as 참여신청
from events;

-- 무엇을 몇 번
select name, detail, count(*) as 횟수
from events
group by name, detail
order by 횟수 desc;

-- 날짜별 방문 (한국 시간)
select (created_at at time zone 'Asia/Seoul')::date as 날짜,
       count(*) as 방문, count(distinct visitor) as 기기수
from events where name = 'visit'
group by 1 order by 1;

-- 어디서 들어왔나
select coalesce(src, '직접·기타') as 경로, count(*) as 방문
from events where name = 'visit'
group by 1 order by 2 desc;
```

## 한계

- 공개 키로 넣는 방식이라, 누가 일부러 반복해 보내면 숫자가 부풀 수 있습니다. 홍보 통계용으로 봐 주세요.
- 카카오톡·인스타 버튼은 누른 횟수이고, 실제로 보냈는지는 휴대폰 공유창(`share_sent`)에서만 알 수 있습니다.
- 브라우저 저장소를 지우거나 사생활 보호 모드면 같은 사람도 새 기기로 셉니다.
