/* ══════════════════════════════════════════════════════════
   app.js — 통합 스크립트
   순서: tabs → reveal → share
══════════════════════════════════════════════════════════ */


/* ══════════════════════════════════
   1. router.js — 해시 라우팅 + 탭 전환

   정적 호스팅(GitHub Pages)이라 서버 리라이트를 쓸 수 없어
   /songs/02 대신 해시 경로를 쓴다. 공유·직접 접속·뒤로가기는
   동일하게 동작한다.

     #/main  #/songs  #/artists  #/story  #/songs/02
══════════════════════════════════ */

const TABS = ['main', 'songs', 'word', 'artists', 'story'];

let _prevRoute = null;
let _songListScroll = 0;
let _routeLandEnd = false;   // 다음 화면 전환 때 맨 끝으로 내릴지 (위로 당겨 앞 탭으로 갈 때)

function _scroller() {
  // 곡 리스트는 메인처럼 화면에 고정된 상자 안에서만 스크롤한다 (주소창·도구 막대가 오르내리며 흔들리지 않게)
  const songs = document.getElementById('page-songs');
  if (songs && songs.classList.contains('active')) return songs;
  return document.scrollingElement || document.documentElement;
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  if (!raw) return { tab: 'main', slug: null };
  const seg = raw.split('/');
  const tab = TABS.indexOf(seg[0]) >= 0 ? seg[0] : 'main';
  return { tab: tab, slug: seg[1] || null };
}

function _showPage(id, tabName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    const on = b.dataset.tab === tabName;
    b.classList.toggle('active', on);
    // 곡 상세에 있을 때도 '곡 리스트' 탭이 현재 위치임을 알린다
    if (on) b.setAttribute('aria-current', 'page');
    else    b.removeAttribute('aria-current');
  });
  const page = document.getElementById(id);
  if (page) page.classList.add('active');
  // 지금 보이는 화면을 <html> 에 표시해 둔다 (on-main, on-songs ...).
  // CSS 의 :has(#page-main.active) 는 아이폰 사파리에서 화면이 바뀌어도 갱신되지 않는 일이 있어
  // (메인의 스크롤 잠금이 남아 곡 리스트가 멈춤) 이 표시로 대신한다.
  const html = document.documentElement;
  [...html.classList].filter(c => c.startsWith('on-')).forEach(c => html.classList.remove(c));
  html.classList.add('on-' + id.replace('page-', ''));
  // 휴대폰 주소창·상태 표시줄 색도 화면에 맞춘다 (메인 영상 위에서 하얀 띠가 보이지 않게)
  const theme = document.querySelector('meta[name="theme-color"]');
  if (theme) theme.setAttribute('content', id === 'page-main' && html.classList.contains('main-cinema') ? '#17120d' : '#f3f1ee');
}

function route() {
  const r = parseHash();
  const prev = _prevRoute;

  // 페이지가 바뀌면 열려 있던 오버레이는 모두 닫는다
  _openOverlays.slice().forEach(closeOverlay);

  // 곡 리스트 → 곡 상세로 들어갈 때 리스트 스크롤 위치를 기억해 둔다
  if (prev && prev.tab === 'songs' && !prev.slug && r.tab === 'songs' && r.slug) {
    _songListScroll = _scroller().scrollTop;
  }

  if (r.tab === 'songs' && r.slug) {
    const ok = renderSongDetail(r.slug);
    if (!ok) { location.replace('#/songs'); return; }   // 없는 곡 번호 → 목록으로
    _showPage('page-song', 'songs');
  } else {
    _showPage('page-' + r.tab, r.tab);
    if (r.tab === 'word') loadWord();
  }
  _syncShareFab();

  // 곡 상세에서 목록으로 돌아온 경우에만 보던 자리를 복원하고,
  // 그 외에는 기존 동작대로 맨 위로 올린다.
  const back = prev && prev.tab === 'songs' && prev.slug && r.tab === 'songs' && !r.slug;
  // 앞 탭으로 위로 당겨 왔으면 그 탭의 맨 끝(곡 리스트라면 곡 소개 및 미리듣기)에 내려 준다
  const toEnd = _routeLandEnd;
  _routeLandEnd = false;
  let y = back ? _songListScroll : 0;
  if (toEnd) {
    const s2 = _scroller();
    y = s2.scrollHeight - s2.clientHeight;
    // 말씀 나눔처럼 내용을 늦게 받아와 길어지는 화면은, 다 들어온 뒤 한 번 더 맨 끝으로 맞춘다
    [400, 1000].forEach(ms => setTimeout(() => {
      const s3 = _scroller();
      if (parseHash().tab === r.tab) s3.scrollTop = s3.scrollHeight - s3.clientHeight;
    }, ms));
  }

  // html 에 scroll-behavior: smooth 가 걸려 있어 그냥 scrollTop 을 넣으면
  // 이전 위치에서 1초 가까이 천천히 미끄러진다. 화면을 바꾸는 순간에는
  // 부드럽게 갈 이유가 없으므로 잠시 꺼서 즉시 이동시킨다.
  const sc = _scroller();
  const html = document.documentElement;
  const prevBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';

  sc.scrollTop = y;
  requestAnimationFrame(() => {
    sc.scrollTop = y;
    requestAnimationFrame(() => {
      sc.scrollTop = y;
      html.style.scrollBehavior = prevBehavior;   // 원래대로 (링크 이동 등은 계속 부드럽게)
      triggerReveal();
      updateStoryProgress();
    });
  });

  _prevRoute = r;
}

/** 기존 HTML의 onclick="switchTab('main', this)" 와 호환되는 진입점 */
function switchTab(name) {
  if (_handing) return;                    // 넘기는 중(1초 남짓)에는 한 번만
  // 어두운 메인 ↔ 밝은 탭을 오갈 때는 색이 스르륵 바뀌는 막을 거쳐 간다
  const cur = parseHash().tab;
  if (cur !== name && (cur === 'main') !== (name === 'main') && _mainDesign() === 'cinema') {
    _flowGo(name, name === 'main');
    return;
  }
  _goTab(name);
}
/* 오른쪽 위 「디자인」 — 새 디자인과 기존 디자인(classic/ 고정본) 사이를 오간다 */
function toggleDesignMenu(force) {
  const menu = document.getElementById('designMenu');
  const btn = document.getElementById('designBtn');
  if (!menu || !btn) return;
  const open = force !== undefined ? force : menu.hidden;
  menu.hidden = !open;
  btn.setAttribute('aria-expanded', String(open));
}
document.addEventListener('click', e => {
  if (!e.target.closest || e.target.closest('.lang-pick')) return;
  toggleDesignMenu(false);                 // 바깥을 누르면 닫는다
});

function _goTab(name) {
  const target = '#/' + name;
  if (location.hash === target) { route(); return; }   // 같은 해시는 hashchange가 안 난다
  location.hash = target;
  // 주소는 바뀌었는데 화면이 안 바뀌었으면(아이폰에서 hashchange 가 늦거나 빠질 때) 직접 바꾼다
  const want = name.includes('/') ? 'page-song' : 'page-' + name;
  setTimeout(() => {
    const pg = document.getElementById(want);
    if (pg && !pg.classList.contains('active')) route();
  }, 150);
}

window.addEventListener('hashchange', route);


/* ══════════════════════════════════
   2. songs-ui.js — 곡 리스트 · 곡 상세 렌더

   화면에 보이는 모든 곡 정보는 src/js/songs.js 의 SONGS 배열에서 나온다.
══════════════════════════════════ */

function _el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

/** 새 탭으로 열리는 외부 링크. 화살표와 aria-label로 이동을 명시한다. */
function _extLink(href, label, cls, ariaText) {
  const a = _el('a', cls);
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.setAttribute('aria-label', ariaText + ' (새 탭에서 열림)');
  a.appendChild(_el('span', null, label));
  const mark = _el('span', 'ext-mark', '→');   // CSS에서 -45도 회전
  mark.setAttribute('aria-hidden', 'true');
  a.appendChild(mark);
  return a;
}

function findSong(slug) {
  for (let i = 0; i < SONGS.length; i++) if (SONGS[i].slug === slug) return SONGS[i];
  return null;
}

/* ── 곡 리스트 ─────────────────────────────────────────── */

function renderSongList() {
  const box = document.getElementById('songList');
  if (!box) return;
  box.innerHTML = '';
  const lis = [];

  // 목록 맨 위 '곡 전체 듣기' — 곡 수는 데이터에서 그대로 가져온다
  const play = document.getElementById('setlistPlay');
  if (play) {
    play.href = SETLIST_PLAYLIST;
    play.setAttribute('aria-label',
      '곡 전체 듣기 — 유튜브 재생목록 ' + SONGS.length + '곡 (새 탭에서 열림)');
    document.getElementById('setlistPlaySub').textContent =
      t('songs.count', '{n}곡').replace('{n}', SONGS.length);
  }
  // 표지: 곡 수와 주제곡
  const count = document.getElementById('slCount');
  if (count) count.textContent = t('songs.count', '{n}곡').replace('{n}', SONGS.length);
  const theme = document.getElementById('slTheme');
  const lead = SONGS.find(isLeadSong);
  if (theme && lead) theme.textContent = _partLabel(lead.parts[0]) || _songTitle(lead);

  SONGS.forEach(song => {
    const li = _el('li', 'song-item');

    const a = _el('a', 'song-row' + (isLeadSong(song) ? ' is-featured' : ''));
    a.href = '#/songs/' + song.slug;
    const hasVerse = song.parts.some(p => p.bible);
    const subs = song.parts.slice(1).filter(p => p.label);
    a.setAttribute('aria-label',
      song.no + '번 ' + (song.parts[0].label ? _partLabel(song.parts[0]) : _songTitle(song)) +
      (song.tag ? ', ' + song.tag : '') +
      subs.map(p => ', 이어서 ' + p.label + (p.note ? ' ' + p.note : '')).join('') +
      ' — 가사' + (hasVerse ? '와 말씀' : '') + ' 보기');

    a.appendChild(_el('span', 'song-num', song.no));

    const mid = _el('span', 'song-main');

    const head = _el('span', 'song-head-row');
    // 두 곡을 한 칸에 담을 때는 첫 곡 이름만 제목 줄에 세우고,
    // 이어 부르는 곡은 아래 줄에 들여 쓴다. 제목에 '/' 를 길게 늘어놓는
    // 것보다 공연 순서가 그대로 읽힌다.
    // 2부 구성이라도 그 파트의 크메르어 이름이 없으면 곡 제목을 쓴다.
    // (02 처럼 두 곡을 한 제목으로 적어 주신 경우)
    const headText = song.parts[0].label || song.title;
    head.appendChild(_el('span', 'song-title-text', headText));
    if (song.tag) head.appendChild(_el('span', 'song-badge tag-' + tagKind(song.tag), _tagName(song.tag)));
    mid.appendChild(head);

    subs.forEach(part => {
      const sub = _el('span', 'song-sub');
      sub.appendChild(_el('span', 'song-sub-title', _partLabel(part)));
      if (part.note) sub.appendChild(_el('span', 'song-sub-note', '(' + _noteName(part.note) + ')'));
      mid.appendChild(sub);
    });

    // 안에 무엇이 들어 있는지 미리 알려준다.
    // 말씀은 12곡 중 일부에만 있어서 장식이 아니라 실제 정보가 된다.
    const meta = _el('span', 'song-meta');
    meta.appendChild(_metaTag('icon-lyrics', t('songs.lyrics', '가사')));
    if (song.parts.some(p => p.bible)) meta.appendChild(_metaTag('icon-verse', t('songs.verse', '말씀')));
    mid.appendChild(meta);

    a.appendChild(mid);

    const arrow = _el('span', 'song-arrow', '→');
    arrow.setAttribute('aria-hidden', 'true');
    a.appendChild(arrow);

    li.appendChild(a);
    lis.push(li);
  });
  _songRoulette(box, lis);
}

/* ── 곡 리스트: 룰렛 ─────────────────────────────────
   곡 카드가 세로 원통에 붙어 돌아가듯 움직인다. 화면 한가운데 온 카드가 '고른 곡'으로
   가장 크고 또렷하며, 위아래로 멀어질수록 작아지고 흐려지며 뒤로 눕는다.
   손을 떼면 카드 하나가 한가운데에 멈춘다(스크롤 스냅). 누르면 그 곡 화면으로 간다. */
function _songRoulette(box, lis) {
  const sec = _el('section', 'sl-ch sl-roulette');
  sec.setAttribute('aria-label', t('songs.title', '곡 리스트'));
  const count = _el('p', 'sl-wheel-count');
  count.setAttribute('aria-hidden', 'true');
  count.appendChild(_el('span', 'sl-wheel-now', '01'));
  count.appendChild(_el('span', 'sl-wheel-total', '/ ' + String(lis.length).padStart(2, '0')));
  sec.appendChild(count);
  const ul = _el('ul', 'song-list sl-wheel');
  lis.forEach(li => ul.appendChild(li));
  sec.appendChild(ul);
  box.appendChild(sec);
  _songScenesInit();
}

/* 룰렛: 카드마다 화면 가운데와의 거리(카드 몇 장만큼 떨어졌는지)에 맞춰 크기·기울기·흐림을 정한다.
   카드 자체(li)는 움직이지 않고 안쪽 링크만 변형하므로, 잰 위치가 변형에 흔들리지 않는다. */
const _reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const _wheelByCss = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'));
let _wheelCenter = null;
function _songWheelUpdate() {
  const items = document.querySelectorAll('#page-songs .sl-wheel .song-item');
  if (!items.length) return;
  const vc = _slCenter();
  // 스크롤에 묶인 CSS 애니메이션을 쓸 수 있으면 모양은 CSS 가 그린다 (화면 움직임과 같은 박자라 떨리지 않는다).
  // 그때는 여기서 카드 스타일을 건드리지 않고, 가운데 곡만 찾는다.
  const byJs = !_reduceMotion.matches && !_wheelByCss;
  let best = null, bestD = Infinity;
  items.forEach(li => {
    const r = li.getBoundingClientRect();
    const px = r.top + r.height / 2 - vc;               // 화면 가운데와의 거리(px)
    // 가장 가까운 카드는 px 로 고른다 — 두 곡이 이어진 카드는 키가 커서 '장 수'로 비교하면 어긋난다
    if (Math.abs(px) < bestD) { bestD = Math.abs(px); best = li; }
    if (!byJs) return;
    const d = px / (r.height + 12);                      // 카드 몇 장만큼인지 (모양 계산용)
    const a = Math.min(Math.abs(d), 3);
    const row = li.firstElementChild;
    const scale = 1.05 - Math.min(a, 2) * 0.08;
    const tilt = Math.max(-38, Math.min(38, -d * 16));
    row.style.transform = 'perspective(900px) rotateX(' + tilt.toFixed(1) + 'deg) scale(' + scale.toFixed(3) + ')';
    row.style.opacity = (1 - Math.min(a, 2.5) * 0.26).toFixed(2);
  });
  // 가운데 곡이 바뀔 때만 표시를 바꾼다 (스크롤마다 다시 쓰지 않게)
  if (best === _wheelCenter && best && best.classList.contains('is-center')) return;
  _wheelCenter = best;
  items.forEach(li => li.classList.toggle('is-center', li === best));
  const now = document.querySelector('#page-songs .sl-wheel-now');
  if (now && best) now.textContent = best.querySelector('.song-num')?.textContent || '';
}

/* 곡 리스트 상자(화면에 고정)에서 고른 곡이 서는 줄 — 가운데보다 조금 위 */
function _slCenter() {
  const page = document.getElementById('page-songs');
  const r = page && page.classList.contains('active') ? page.getBoundingClientRect() : null;
  return r && r.height ? r.top + r.height * 0.4 : innerHeight * 0.4;   // 고른 곡이 서는 줄: 위에서 40%
}

/* 지금 화면 가운데에 걸친 장만 보이고, 나머지는 흐려져 사라진다 (메인 장면 전환과 같은 결) */
let _slChapters = [];
function _songScenesUpdate() {
  const page = document.getElementById('page-songs');
  if (!page || !page.classList.contains('active') || !_slChapters.length) return;
  // 상자 높이가 아직 안 적혔거나 바뀌었으면 다시 잰다 (처음 곡 리스트로 바로 들어온 경우 등)
  if (document.documentElement.style.getPropertyValue('--sl-h') !== page.clientHeight + 'px') _slMeasure();
  const mid = _slCenter();
  let on = 0;
  _slChapters.forEach((c, i) => {
    const r = c.getBoundingClientRect();
    if (r.top <= mid && r.bottom > mid) on = i;
  });
  _slChapters.forEach((c, i) => c.classList.toggle('is-on', i === on));
  document.querySelectorAll('#slDots li').forEach((d, i) => d.classList.toggle('is-on', i === on));
  _songWheelUpdate();
}
/* 곡 리스트 상자는 위 음악 바 바로 아래에서 화면 바닥까지. 그 높이를 CSS 에 알려 준다 */
function _slMeasure() {
  const np = document.getElementById('nowPlaying');
  const st = document.documentElement.style;
  if (np && np.offsetHeight) st.setProperty('--np-h', np.offsetHeight + 'px');
  const page = document.getElementById('page-songs');
  if (page && page.clientHeight) st.setProperty('--sl-h', page.clientHeight + 'px');
}
function _songScenesInit() {
  const page = document.getElementById('page-songs');
  if (!page) return;
  _slChapters = [...page.querySelectorAll('.sl-ch')];
  const dots = document.getElementById('slDots');
  if (dots) {
    if (dots.parentElement !== document.body) document.body.appendChild(dots);   // 페이지의 transform 밖이어야 화면에 고정된다
    dots.innerHTML = _slChapters.map(() => '<li></li>').join('');
  }
  _slMeasure();
  if (!_songScenesInit.bound) {
    _songScenesInit.bound = true;
    document.documentElement.classList.add('sl-scenes');
    page.addEventListener('scroll', _songScenesUpdate, { passive: true });
    page.addEventListener('scrollend', _songScenesUpdate);
    window.addEventListener('resize', () => { _slMeasure(); _songScenesUpdate(); });
    window.addEventListener('hashchange', () => setTimeout(_slMeasure, 30));
    window.addEventListener('hashchange', () => setTimeout(_songScenesUpdate, 60));
    // 카드를 가운데에 맞추는 일은 상자 안 스크롤 스냅(CSS)이 한다.
    // (예전에는 JS 가 손을 뗀 뒤 맞췄는데, 휴대폰의 관성 스크롤과 서로 당겨 카드가 떨렸다)
  }
  _slChapters.forEach((c, i) => c.classList.toggle('is-on', i === 0));
  _songScenesUpdate();
}

/* 배지 종류. 곡 데이터의 tag 문자열을 여기서 한 번만 해석한다
   (예전에는 '대표곡' 비교가 세 곳에 흩어져 있어 이름을 바꾸면 빠뜨리기 쉬웠다) */
const TAG_KIND = { '주제곡': 'lead', '앵콜': 'encore', '기도': 'pray' };
const tagKind = tag => TAG_KIND[tag] || 'pray';
const isLeadSong = song => tagKind(song.tag) === 'lead';


/** 곡 줄에 붙는 '가사'·'말씀' 표시 */
function _metaTag(iconId, label) {
  const tag = _el('span', 'song-meta-tag');
  tag.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#' + iconId + '"/></svg>';
  tag.appendChild(_el('span', null, label));
  return tag;
}


/* ── 곡 상세 ───────────────────────────────────────────── */

let _lastSongSlug = null;

function renderSongDetail(slug) {
  _lastSongSlug = slug;
  const wrap = document.getElementById('songDetail');
  const song = findSong(slug);
  if (!wrap || !song) return false;

  const idx = SONGS.indexOf(song);
  wrap.innerHTML = '';
  wrap.className = song.tag === '기도' ? 'is-prayer' : '';

  /* 목록으로 돌아가기 — 화살표를 원형 아이콘으로 분리해 뒤로가기임을 분명히 한다 */
  const back = _el('a', 'song-back');
  back.href = '#/songs';
  back.setAttribute('aria-label', '곡 리스트로 돌아가기');
  const backIcon = _el('span', 'song-back-icon', '←');
  backIcon.setAttribute('aria-hidden', 'true');
  back.appendChild(backIcon);
  back.appendChild(_el('span', 'song-back-label', t('songs.back', '곡 리스트')));
  wrap.appendChild(back);

  /* 머리말 */
  const head = _el('header', 'song-head');
  // 몇 번째 곡인지 — 리스트의 장 표시(01 - 05 / 13)와 같은 모양
  const num = _el('p', 'song-head-num');
  num.appendChild(_el('span', 'song-head-no', song.no));
  num.appendChild(_el('span', 'song-head-total', '/ ' + String(SONGS.length).padStart(2, '0')));
  head.appendChild(num);
  const h1 = _el('h1', 'song-head-title', _songTitle(song));
  head.appendChild(h1);
  if (song.artist) head.appendChild(_el('p', 'song-head-artist', song.artist));
  if (song.tag) {
    head.appendChild(_el('span', 'song-badge tag-' + tagKind(song.tag), _tagName(song.tag)));
  }
  if (song.tag === '기도') {
    head.appendChild(_el('p', 'song-head-note', t('songs.prayNote', '기도하며 함께 드리는 곡입니다')));
  }

  wrap.appendChild(head);

  /* 유튜브 — 제목 바로 아래, 가사 시작 전 */
  if (song.youtube) {
    const yt = _extLink(song.youtube, t('songs.youtube', 'YouTube에서 듣기'), 'song-yt', song.title + ' 유튜브에서 듣기');
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('width', '16'); icon.setAttribute('height', '16');
    icon.setAttribute('fill', 'currentColor'); icon.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#icon-yt');
    icon.appendChild(use);
    yt.insertBefore(icon, yt.firstChild);
    wrap.appendChild(yt);
  }


  /* 가사 + 말씀 (한 곡에 두 곡이 이어지면 파트마다 반복) */
  song.parts.forEach((part, i) => {
    const sec = _el('section', 'song-part');

    if (part.label) {
      const h = _el('h2', 'song-part-label', _partLabel(part));
      // '후렴만' 처럼 그 파트를 어떻게 부르는지 — 제목 옆 꼬리표로
      if (part.note) h.appendChild(_el('span', 'song-part-note', '(' + _noteName(part.note) + ')'));
      sec.appendChild(h);
      // 이어 부르는 곡은 자기 영상이 따로 있다. 위 큰 버튼은 첫 곡 것이라
      // 여기서 따로 걸어 준다.
      if (part.youtube) {
        const link = _extLink(part.youtube, t('songs.youtube', 'YouTube에서 듣기'), 'song-part-yt',
                              part.label + ' 유튜브에서 듣기');
        sec.appendChild(link);
      }
    }
    else if (i === 0) sec.appendChild(_el('h2', 'song-part-label sr-only', t('songs.lyrics', '가사')));

    sec.appendChild(_el('p', 'song-lyrics', _lyrics(part)));

    if (part.bible) {
      const word = _el('aside', 'song-word');
      word.appendChild(_el('p', 'song-word-label', t('songs.verseLabel', '이 곡과 함께 묵상할 말씀')));
      word.appendChild(_el('p', 'song-word-ref', part.bible.ref));

      const btn = _el('button', 'song-word-link', t('songs.readVerse', '말씀 보기'));
      btn.type = 'button';
      btn.setAttribute('aria-label', part.bible.ref + ' 본문 보기');
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.onclick = () => openVerse(song.slug, i);
      word.appendChild(btn);
      sec.appendChild(word);
    }
    wrap.appendChild(sec);
  });

  /* 이전 / 다음 곡 */
  const nav = _el('nav', 'song-nav');
  nav.setAttribute('aria-label', '곡 이동');
  nav.appendChild(_el('p', 'song-nav-count', song.no + ' / ' + String(SONGS.length).padStart(2, '0')));

  const links = _el('div', 'song-nav-links');
  const make = (target, dir, cls) => {
    const a = _el('a', 'song-nav-btn ' + cls);
    a.href = '#/songs/' + target.slug;
    a.setAttribute('aria-label', dir + ': ' + target.no + '번 ' + _songTitle(target));
    a.appendChild(_el('span', 'song-nav-dir',
      cls === 'prev' ? t('songs.prev', '← 이전 곡') : t('songs.next', '다음 곡 →')));
    a.appendChild(_el('span', 'song-nav-title', _songTitle(target)));
    return a;
  };
  if (idx > 0) links.appendChild(make(SONGS[idx - 1], '이전 곡', 'prev'));
  if (idx < SONGS.length - 1) links.appendChild(make(SONGS[idx + 1], '다음 곡', 'next'));
  nav.appendChild(links);
  wrap.appendChild(nav);

  _songDetailReveal(wrap);
  return true;
}

/* 곡 화면: 가사 파트·말씀·이전/다음이 화면에 들어올 때 스르륵 떠오른다 (곡 리스트 장 전환과 같은 결).
   읽는 중인 글이 사라지면 안 되므로 나타나기만 한다. */
let _sdObserver = null;
function _songDetailReveal(wrap) {
  if (!('IntersectionObserver' in window)) return;
  if (_sdObserver) _sdObserver.disconnect();
  document.documentElement.classList.add('sd-anim');
  _sdObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('sd-in');
      _sdObserver.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  wrap.querySelectorAll('.song-head, .song-yt, .song-part, .song-nav').forEach(el => _sdObserver.observe(el));
}

function updateStoryProgress() {
  const prog = document.getElementById('storyProg');
  const storyPage = document.getElementById('page-story');
  if (!prog || !storyPage) return;

  if (!storyPage.classList.contains('active')) {
    if (prog.style.width !== '0%') prog.style.width = '0%';   // 다른 화면에선 스크롤마다 다시 쓰지 않는다
    return;
  }

  const max = document.body.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
  prog.style.width = pct + '%';
}

window.addEventListener('scroll', updateStoryProgress, { passive: true });
window.addEventListener('resize', updateStoryProgress);
document.addEventListener('DOMContentLoaded', updateStoryProgress);


/* ══════════════════════════════════
   2. reveal.js — 스크롤 Fade-up 애니메이션
══════════════════════════════════ */

let _revealObserver = null;

function triggerReveal() {
  if (_revealObserver) {
    _revealObserver.disconnect();
  }

  const els = document.querySelectorAll('.page.active .reveal:not(.visible)');

  _revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), 60);
        _revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10 });

  els.forEach(el => _revealObserver.observe(el));
}

// 첫 페이지 로드 시 즉시 실행
triggerReveal();

// ── 모바일 자동재생 강제 실행 ──
(function () {
  const video = document.getElementById('main-video');
  if (!video) return;
  // 이 영상(43MB)은 기존 메인(옵션2) 것이다. 영상 배경 메인에서는 보이지도 않으니 틀지(받지) 않는다
  const classic = () => _mainDesign() !== 'cinema';

  const tryPlay = () => {
    if (!classic()) return;
    video.muted = true;
    video.play().catch(() => {});
  };

  if (document.readyState === 'complete') {
    tryPlay();
  } else {
    window.addEventListener('load', tryPlay);
  }

  // 첫 터치 시 비디오 + 배경음악 동시 시작
  const onFirstTouch = () => {
    if (classic()) video.play().catch(() => {});
    _tryStartBgm();
  };
  document.addEventListener('touchstart', onFirstTouch, { once: true });
  document.addEventListener('click', () => { _tryStartBgm(); }, { once: true });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      if (classic()) video.play().catch(() => {});
      if (_bgmWasPlaying) _bgm.play().catch(() => {});
    } else {
      _bgmWasPlaying = !_bgm.paused;
      _bgm.pause();
    }
  });
})();


/* ══════════════════════════════════
   4. bgm.js — 배경음악 제어
══════════════════════════════════ */

const _bgm = document.getElementById('bgm');
let _bgmWasPlaying = false;

function _tryStartBgm() {
  if (!_bgm || !_bgm.paused) return;
  _bgm.volume = 0.16;
  _bgm.play().catch(() => {});
}

function toggleBgmFromBar() {
  if (!_bgm) return;
  const bar = document.getElementById('nowPlaying');
  if (_bgm.paused) {
    _bgm.volume = 0.16;
    _bgm.play().then(() => bar.classList.remove('paused')).catch(() => {});
  } else {
    _bgm.pause();
    bar.classList.add('paused');
  }
}


/* ══════════════════════════════════
   concert.js — 공연 정보 (단일 원천)

   날짜·시간·장소가 여기 한 곳에만 있다. 메인 화면의 날짜 블록,
   D-Day 카운터, 캘린더 추가, 스토리 마지막 문구가 모두 이 값을 읽는다.
   일정이 확정되면 dates 를 하나만 남기고 confirmed 를 true 로 바꾸면 된다.

   ※ index.html 의 구조화 데이터(JSON-LD)와 메타 태그는 정적이라
     여기와 함께 손으로 맞춰야 한다.
══════════════════════════════════ */

/* ── 메인 디자인 선택 ─────────────────────────────────
   'cinema'  : 옵션1 — 화면을 꽉 채운 배경 영상 위에서 내용이 장면별로 바뀐다
   'classic' : 옵션2 — 기존 메인 (제목 → 영상 상자 → 정보 → 말씀)
   이 한 줄만 바꾸면 된다. 저장하지 않고 미리 보려면 주소 뒤에
   ?design=classic 또는 ?design=cinema 를 붙인다. */
const MAIN_DESIGN = 'cinema';

function _mainDesign() {
  try {
    const q = new URLSearchParams(location.search).get('design');
    if (q === 'classic' || q === 'cinema') return q;
  } catch (e) {}
  return MAIN_DESIGN;
}

/* 배경 영상을 어느 단계에서 시작할지. 'full' 고화질 / 'light' 가벼운 것 / 'still' 사진만.
   망 정보를 주지 않는 브라우저(아이폰 사파리·카카오톡 등)는 고화질로 시작하고,
   늦으면 initMainCinema 의 시간 재기가 알아서 낮춘다. */
function _cinemaVideoPlan(conn) {
  if (!conn) return 'full';
  if (conn.saveData) return 'still';        // 데이터 절약 모드 → 스크롤 연동 장면
  const t = conn.effectiveType || '';
  if (t === 'slow-2g' || t === '2g') return 'still';
  if (t === '3g' || (conn.downlink && conn.downlink < 1.5)) return 'light';
  return 'full';
}

/* 옵션1 을 켠다. 기존 메인의 요소(제목·날짜·참여하기·말씀)를 장면 안으로 옮겨 온다.
   복사하지 않고 옮기므로 D-day·참여 신청 동작은 그대로 이어진다. */
function initMainCinema() {
  /* 옵션2 의 영상은 HTML 에서 자동 재생을 꺼 두었다(옵션1 일 때 43MB 를 받지 않도록).
     옵션2 일 때 여기서 예전과 똑같이 소리 없이 자동 재생한다. */
  if (_mainDesign() !== 'cinema') {
    const v = document.getElementById('main-video');
    if (v) {
      v.preload = 'metadata';
      v.autoplay = true;
      v.play().catch(() => {});
    }
    return;
  }
  const root = document.getElementById('mainCinema');
  const page = document.getElementById('page-main');
  if (!root || !page) return;

  const move = (sel, to) => {
    const el = page.querySelector(sel);
    const box = root.querySelector(to);
    if (el && box) box.appendChild(el);
  };
  move('.sec-title .title-main', '.scene-title');
  move('#ddayCounter', '.scene-info');
  move('#detailGrid', '.scene-info');
  move('.ticket-cta', '.scene-info');      // 일시·장소 바로 아래에 참여하기
  move('.sec-message', '.scene-word');
  // 꼬리말은 스크롤 상자 맨 끝으로 (페이지 쪽에 남으면 페이지가 스크롤된다)
  const foot = page.querySelector(':scope > .footer');
  const next = document.getElementById('cinemaNext');
  if (foot) root.insertBefore(foot, next);
  const cue = next && next.querySelector('.cinema-next-cue');
  if (foot && cue) foot.appendChild(cue);   // 꼬리말에 머물 때 보이도록
  if (cue) cue.addEventListener('click', _cinemaHandoffGo);

  document.documentElement.classList.add('main-cinema');
  root.hidden = false;
  root.dataset.scene = '0';

  /* ── 배경 영상 ─────────────────────────────────────────
     1) 사진(80KB)을 먼저 깐다. 영상이 늦거나 끝내 안 와도 첫 화면이 비지 않는다.
     2) 망 상태를 보고 영상을 고른다: 빠르면 고화질(4.2MB), 느리면 가벼운 것(985KB),
        데이터 절약·매우 느림이면 사진만.
     3) 영상이 정해진 시간 안에 시작하지 않거나, 재생 중 3초 넘게 끊기거나,
        자동 재생이 막히면(아이폰 저전력 모드 등) 한 단계씩 낮춘다: 고화질 → 가벼운 것 → 사진.
     영상은 실제로 재생이 시작된 뒤에야 사진 위로 서서히 나타난다. */
  const video = document.getElementById('cinemaVideo');
  const bg = root.querySelector('.cinema-bg');
  let tier = 'still';
  const tried = new Set();
  let startTimer = null;
  let stallTimer = null;
  let switching = false;            // 영상 파일을 바꾸는 중 (이때 나는 pause 는 무시)
  const onMain = () => parseHash().tab === 'main' && !document.hidden;

  /* ── 스크롤 연동 장면 (스크롤 스크러빙) ──────────────────
     데이터 절약 모드·아주 느린 망·자동 재생이 막힌 휴대폰(저전력 모드 등)에서는 영상 대신
     같은 영상에서 뽑은 장면 사진 60장(약 1MB)을 스크롤 위치에 맞춰 넘긴다.
     내리면 앞으로, 올리면 뒤로 영상처럼 움직인다. 거친 장면부터 받아 처음부터 스크롤에 반응한다. */
  const seqCanvas = document.getElementById('cinemaSeq');
  const SEQ_N = seqCanvas ? (+seqCanvas.dataset.count || 60) : 0;
  const frames = new Array(SEQ_N);
  let seqOn = false, seqRaf = 0;
  const seqSrc = i => seqCanvas.dataset.src.replace('{n}', String(i + 1).padStart(3, '0'));
  const seqWant = () => {
    // 첫 장면(맨 위) ~ 꼬리말까지 내린 만큼이 영상의 처음 ~ 끝
    const max = Math.max(1, next.offsetTop - root.clientHeight);
    return Math.round(Math.min(1, Math.max(0, root.scrollTop / max)) * (SEQ_N - 1));
  };
  /* 보여 주는 위치(seqPos, 소수)는 스크롤이 정한 장면(seqWant)을 천천히 따라간다.
     한 번 넘길 때 약 20장을 2초 남짓에 걸쳐 흘려, 영상처럼 부드럽다. 두 장면 사이는 겹쳐 그린다. */
  let seqPos = -1, seqLastT = 0;
  const seqNear = (want) => {
    for (let d = 0; d < SEQ_N; d++) {
      if (frames[want - d]) return want - d;
      if (frames[want + d]) return want + d;
    }
    return -1;
  };
  const seqPaint = (ctx, img, cw, ch, alpha) => {
    const sc = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);   // 화면을 빈틈 없이 덮게
    const w = img.naturalWidth * sc, h = img.naturalHeight * sc;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  };
  const seqDraw = () => {
    seqRaf = 0;
    if (!seqOn) return;
    const target = seqWant();
    const now = performance.now();
    const dt = seqLastT ? Math.min(0.1, (now - seqLastT) / 1000) : 0;
    seqLastT = now;
    if (seqPos < 0) seqPos = target;
    const diff = target - seqPos;
    const speed = Math.min(14, Math.max(6, Math.abs(diff) * 3));   // 1초에 6~14장
    seqPos += Math.sign(diff) * Math.min(Math.abs(diff), speed * dt);

    const a = seqNear(Math.floor(seqPos));
    if (a < 0) { seqSchedule(); return; }
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = Math.round(seqCanvas.clientWidth * dpr), ch = Math.round(seqCanvas.clientHeight * dpr);
    if (seqCanvas.width !== cw || seqCanvas.height !== ch) { seqCanvas.width = cw; seqCanvas.height = ch; }
    const ctx = seqCanvas.getContext('2d');
    seqPaint(ctx, frames[a], cw, ch, 1);
    const frac = seqPos - Math.floor(seqPos);
    const b = frames[Math.floor(seqPos) + 1];
    if (frac > 0.02 && b) seqPaint(ctx, b, cw, ch, frac);   // 다음 장면을 그만큼 겹친다
    ctx.globalAlpha = 1;
    bg.dataset.video = 'seq';

    if (Math.abs(target - seqPos) > 0.01) seqSchedule();
    else seqLastT = 0;                                     // 다 따라왔으면 쉰다
  };
  const seqSchedule = () => {
    if (!seqOn || seqRaf) return;
    // 화면 갱신(requestAnimationFrame)을 쓰되, 브라우저가 미루면 타이머가 대신 그린다
    const to = setTimeout(() => { cancelAnimationFrame(seqRaf); seqDraw(); }, 60);
    seqRaf = requestAnimationFrame(() => { clearTimeout(to); seqDraw(); });
  };
  const startSeq = () => {
    if (!seqCanvas) return;
    if (seqOn) { seqSchedule(); return; }
    seqOn = true;
    const order = [], seen = new Set();
    [8, 4, 2, 1].forEach(step => {
      for (let i = 0; i < SEQ_N; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
    });
    let at = 0;
    const loadNext = () => {
      if (at >= order.length) return;
      const i = order[at++];
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { frames[i] = img; seqSchedule(); loadNext(); };
      img.onerror = loadNext;
      img.src = seqSrc(i);
    };
    for (let c = 0; c < 4; c++) loadNext();          // 네 장씩 나란히 받는다
  };
  root.addEventListener('scroll', seqSchedule, { passive: true });
  window.addEventListener('resize', seqSchedule);

  /* ── 배경 영상 ─────────────────────────────────────────
     1) 사진(80KB)을 먼저 깐다. 영상이 늦어도 첫 화면이 비지 않는다.
     2) 망 상태를 보고 영상을 고른다: 빠르면 고화질(4.2MB), 느리면 가벼운 것(1MB).
        데이터 절약 모드·매우 느린 망이면 처음부터 스크롤 연동 장면.
     3) 영상이 정해진 시간 안에 시작하지 않거나, 재생 중 3초 넘게 끊기거나,
        자동 재생이 막히면(아이폰 저전력 모드 등) 한 단계씩 낮춘다: 고화질 → 가벼운 것 → 스크롤 연동 장면.
     영상은 실제로 재생이 시작된 뒤에야 사진 위로 서서히 나타난다. */
  const armStart = () => {
    clearTimeout(startTimer);
    if (tier === 'still' || bg.dataset.video === 'playing') return;
    // 이만큼 기다려도 시작하지 않으면 낮춘다. 메인을 떠나 있으면 돌아왔을 때 다시 잰다
    startTimer = setTimeout(() => {
      if (onMain() && bg.dataset.video !== 'playing') downgrade();
    }, tier === 'full' ? 5000 : 8000);
  };

  const setTier = (t) => {
    clearTimeout(startTimer);
    clearTimeout(stallTimer);
    tier = t;
    bg.dataset.video = 'still';
    if (t === 'still') {
      video.pause();
      video.removeAttribute('src');
      video.load();                 // 받던 것을 멈춘다
      startSeq();                   // 영상 대신 스크롤 연동 장면
      return;
    }
    switching = true;
    tried.add(t);
    const at = video.currentTime || 0;
    video.muted = true;             // 아이폰은 속성뿐 아니라 값으로도 음소거여야 자동 재생된다
    video.preload = 'auto';
    video.src = t === 'full' ? video.dataset.srcFull : video.dataset.srcLight;
    if (at) {
      video.addEventListener('loadedmetadata', () => {
        try { video.currentTime = at; } catch (e) {}
      }, { once: true });
    }
    sync();
    armStart();
  };

  const downgrade = () => {
    if (tier === 'full' && !tried.has('light')) setTier('light');
    else setTier('still');
  };

  video.addEventListener('playing', () => {
    clearTimeout(startTimer);
    clearTimeout(stallTimer);
    switching = false;
    bg.dataset.video = 'playing';
  });
  video.addEventListener('waiting', () => {
    if (bg.dataset.video !== 'playing') return;
    clearTimeout(stallTimer);
    stallTimer = setTimeout(() => { if (onMain()) downgrade(); }, 3000);
  });
  video.addEventListener('error', () => {
    if (tier !== 'still' && video.getAttribute('src')) downgrade();
  });
  // 메인을 보는 중인데 휴대폰이 스스로 멈췄으면(절전 등) 멈춘 화면 대신 스크롤 연동 장면으로
  video.addEventListener('pause', () => {
    if (switching || !onMain() || video.ended || tier === 'still' || bg.dataset.video !== 'playing') return;
    setTier('still');
  });

  // 메인을 보고 있을 때만 재생한다(배터리·데이터 절약)
  function sync() {
    if (onMain() && tier !== 'still') {
      const p = video.play();
      if (p) p.catch(err => {
        // 자동 재생이 막혔다(아이폰 저전력 모드 등) → 스크롤 연동 장면
        if (err && err.name === 'NotAllowedError') setTier('still');
      });
      armStart();
    } else {
      video.pause();
    }
  }
  window.addEventListener('hashchange', sync);
  document.addEventListener('visibilitychange', sync);
  // ?bg=seq 로 열면 어느 휴대폰에서나 스크롤 연동 장면을 볼 수 있다 (확인용)
  setTier(/[?&]bg=seq/.test(location.search) ? 'still' : _cinemaVideoPlan(navigator.connection));

  // 스크롤 위치 → 지금 장면. 위아래로 밀지 않고, 장면을 통째로 바꾼다.
  // 페이지가 아니라 이 상자(root) 안쪽이 스크롤된다. 한 장면 = 상자 높이 한 칸.
  const scenes = [...root.querySelectorAll('.scene')];
  const dots = [...root.querySelectorAll('.cinema-dots li')];
  let cur = 0;
  const update = () => {
    if (!page.classList.contains('active')) return;
    const h = root.clientHeight || 1;
    _cinemaHandoff(root, next, h);
    const i = Math.min(scenes.length - 1, Math.max(0, Math.round(root.scrollTop / h)));
    if (i === cur) return;
    cur = i;
    scenes.forEach((s, k) => s.classList.toggle('is-on', k === i));
    dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
    root.dataset.scene = String(i);
  };
  // 계산이 가벼워(장면이 바뀔 때만 클래스를 바꾼다) 스크롤마다 바로 부른다.
  // 화면 갱신 타이밍(requestAnimationFrame)에 기대지 않아 느린 기기에서도 밀리지 않는다.
  root.addEventListener('scroll', update, { passive: true });
  root.addEventListener('scrollend', update);
  window.addEventListener('resize', update);
  // 곡 리스트로 넘기는 건 사람이 직접 내렸을 때만 (새로고침 때 브라우저가 스크롤 위치를 되살려도 넘어가지 않게)
  const touched = () => { _cinemaTouchedAt = Date.now(); };
  ['touchmove', 'wheel', 'keydown', 'pointerdown'].forEach(t =>
    (t === 'keydown' ? window : root).addEventListener(t, touched, { passive: true }));
  window.addEventListener('pageshow', () => { if (!_handing) root.scrollTop = 0; });

  // 곡 리스트로 넘어간 뒤 메인은 첫 장면으로 되돌려 둔다 (다시 와도 곧바로 또 넘어가지 않게).
  // 숨어 있는 동안엔 스크롤을 바꿀 수 없어서, 메인이 다시 보이는 순간(그려지기 전)에 맞춘다.
  let backToTop = false, landing = null;
  const goScene = (i) => {
    root.scrollTop = i * (root.clientHeight || 1);
    cur = i;
    scenes.forEach((s, k) => s.classList.toggle('is-on', k === i));
    dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
    root.dataset.scene = String(i);
  };
  _cinemaReset = () => { backToTop = true; };
  // 곡 리스트 맨 위에서 위로 당겨 돌아오면 메인의 마지막 장면(말씀)에 내려 준다
  _cinemaLand = (where) => { landing = where; };
  window.addEventListener('hashchange', () => {
    if (!page.classList.contains('active')) return;
    if (landing === 'last') { landing = null; backToTop = false; goScene(scenes.length - 1); }
    else if (backToTop) { backToTop = false; goScene(0); }
  });
}

/* ── 탭 사이 넘김 — 색이 스르륵 바뀌는 막 ─────────────────
   막은 CSS 전환(투명도, --handoff)으로만 움직이고, 순서는 정해진 시간(setTimeout)으로만 진행한다.
   화면 갱신 고리(requestAnimationFrame)에 기대지 않으므로 휴대폰 브라우저에서도 중간에 멈추지 않는다.
   ① 막이 덮인다(0.45초) → ② 화면을 바꾼다 → ③ 막이 걷힌다(0.5초). */
let _cinemaReset = () => {};
let _cinemaLand = () => {};
let _handing = false;
let _cinemaTouchedAt = 0;
let _hoSettle = 0;
const _VEIL_IN = 450, _VEIL_OUT = 500;

function _setHandoff(v) {
  const st = document.documentElement.style;
  st.setProperty('--handoff', v.toFixed(3));
  st.setProperty('--handoff-low', Math.min(1, v * 2.2).toFixed(3));   // 아래 탭 바 글씨는 더 일찍 바뀐다
}
/* 막의 색과 방향: 메인으로 가면 어두운 영상 빛(위에서), 밝은 탭으로 가면 종이색(아래에서) */
function _flowVeil(to, fromTop) {
  const veil = document.getElementById('tabVeil');
  veil.classList.remove('is-leaving');
  veil.classList.toggle('to-dark', to === 'main');
  veil.classList.toggle('from-top', !!fromTop);
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('is-next', b.dataset.tab === to));
  return veil;
}
function _flowGo(to, fromTop, land) {
  if (_handing) return;
  const from = parseHash().tab;
  const html = document.documentElement;
  html.classList.remove('flow-drag');
  if (_reduceMotion.matches) {                          // 움직임 줄이기: 막 없이 바로
    if (to === 'main') _cinemaLand(land || null);
    else _routeLandEnd = land === 'last';
    _goTab(to);
    if (from === 'main') _cinemaReset();
    return;
  }
  _handing = true;
  _flowLog('go ' + from + ' → ' + to);
  const veil = _flowVeil(to, fromTop);
  html.classList.add('flow-commit');                    // 탭 바 알약이 갈 곳으로 옮겨 간다
  veil.classList.add('is-on');
  _setHandoff(1);
  setTimeout(() => {
    veil.classList.add('is-leaving');                   // 다 덮은 채로 고정
    if (to === 'songs') {
      const chs = document.querySelectorAll('#page-songs .sl-ch');
      const on = land === 'last' ? chs.length - 1 : 0;   // 내려 줄 장을 미리 띄워 두어 한 번만 나타나게
      chs.forEach((c, i) => c.classList.toggle('is-on', i === on));
    }
    if (to === 'main') _cinemaLand(land || null);
    else _routeLandEnd = land === 'last';
    _goTab(to);
    if (from === 'main') _cinemaReset();
    setTimeout(() => {
      _setHandoff(0);
      veil.classList.remove('is-on');                   // 걷힌다
      html.classList.remove('flow-commit');
      document.querySelectorAll('.tab-btn.is-next').forEach(b => b.classList.remove('is-next'));
      setTimeout(() => {
        veil.classList.remove('is-leaving', 'to-dark', 'from-top');
        _handing = false;
        _flowLog('done ' + to);
      }, _VEIL_OUT + 80);
    }, 60);
  }, _VEIL_IN);
}

/* 메인 맨 끝: 꼬리말 다음 빈자리로 조금만 넘어와도 곡 리스트로 */
function _cinemaHandoff(root, next, h) {
  if (!next || _handing) return;
  // 들어온 뒤 한 번도 직접 내린 적이 없으면(새로고침 때 브라우저가 위치를 되살린 경우) 넘기지 않는다
  const p = _cinemaTouchedAt ? (root.scrollTop + h - next.offsetTop) / h : 0;
  if (p >= 0.3) { _cinemaHandoffGo(); return; }
  // 빈자리에 살짝 걸친 채 멈추면 꼬리말로 되돌린다 (영상만 보이는 화면에 서지 않게)
  clearTimeout(_hoSettle);
  _hoSettle = setTimeout(() => {
    if (_handing || !document.getElementById('page-main').classList.contains('active')) return;
    const q = (root.scrollTop + h - next.offsetTop) / h;
    if (q <= 0.02) return;
    if (q >= 0.15 && _cinemaTouchedAt) _cinemaHandoffGo();
    else root.scrollTo({ top: next.offsetTop - h, behavior: 'smooth' });
  }, 200);
}
function _cinemaHandoffGo() { _flowGo('songs', false); }

/* ?debug=1 로 열면 화면 아래에 넘김 상태와 오류를 띄운다 (휴대폰에서 원인을 찾기 위한 것) */
const _flowDebug = /[?&]debug=1/.test(location.search);
const _flowLogs = [];
function _flowLog(msg) {
  if (!_flowDebug) return;
  _flowLogs.push(new Date().toISOString().slice(14, 23) + ' ' + msg);
  if (_flowLogs.length > 8) _flowLogs.shift();
  _flowDebugPaint();
}
function _flowDebugPaint() {
  if (!_flowDebug) return;
  let box = document.getElementById('flowDebug');
  if (!box) {
    box = document.createElement('pre');
    box.id = 'flowDebug';
    box.style.cssText = 'position:fixed;left:6px;right:6px;bottom:84px;z-index:99999;margin:0;padding:6px 8px;'
      + 'background:rgba(0,0,0,.78);color:#9f9;font:11px/1.35 ui-monospace,monospace;white-space:pre-wrap;pointer-events:none;border-radius:8px';
    document.body.appendChild(box);
  }
  const act = document.querySelector('.page.active');
  const sc = _scroller();
  box.textContent = 'hash ' + location.hash + ' | page ' + (act ? act.id : '-') + ' | html ' + document.documentElement.className
    + '\nhanding ' + _handing + ' handoff ' + getComputedStyle(document.documentElement).getPropertyValue('--handoff')
    + ' scroll ' + Math.round(sc.scrollTop) + '/' + Math.round(sc.scrollHeight - sc.clientHeight)
    + '\nveil ' + (document.getElementById('tabVeil')?.className || '') + '\n' + _flowLogs.join('\n');
}
if (_flowDebug) {
  window.addEventListener('error', e => _flowLog('ERROR ' + e.message + ' @' + (e.lineno || '')));
  window.addEventListener('unhandledrejection', e => _flowLog('REJECT ' + (e.reason && e.reason.message || e.reason)));
  setInterval(_flowDebugPaint, 300);
}

/* ── 밝은 탭들 사이의 넘김 ─────────────────────────────
   맨 끝에서 더 내리면 다음 탭으로, 맨 위에서 더 당기면 앞 탭으로 넘어간다.
   곡 리스트 맨 위에서 당기면 메인의 마지막 장면으로, 팀 소개 다음은 다시 메인(처음)이다. */
const _FLOW = ['main', 'songs', 'word', 'artists', 'story'];
function _flowNeighbor(tab, dir) {
  const i = _FLOW.indexOf(tab);
  if (i < 0) return null;
  if (dir > 0) return _FLOW[(i + 1) % _FLOW.length];
  return i > 0 ? _FLOW[i - 1] : null;
}
function _flowPageActive() {
  const r = parseHash();
  return r.tab !== 'main' && !r.slug && _FLOW.includes(r.tab) && !_openOverlays.length && !_handing;
}
const _PULL = 150;                                     // 이만큼(px) 더 당기면 넘어간다
/* 당기는 동안은 손가락을 따라 막이 살짝 비친다 (전환 없이 바로) */
function _flowPull(dir, amount) {
  const to = _flowNeighbor(parseHash().tab, dir);
  if (!to) return;
  const veil = _flowVeil(to, dir < 0);
  document.documentElement.classList.add('flow-drag');
  veil.classList.add('is-on');
  _setHandoff(Math.min(1, amount / _PULL) * 0.5);
}
function _flowRelease(dir, amount) {
  const to = _flowNeighbor(parseHash().tab, dir);
  const html = document.documentElement;
  if (to && amount >= _PULL * 0.6) {
    _flowGo(to, dir < 0, dir < 0 ? 'last' : null);
    return;
  }
  if (_handing) return;
  html.classList.remove('flow-drag');
  _setHandoff(0);
  setTimeout(() => {
    if (_handing) return;
    document.getElementById('tabVeil').classList.remove('is-on');
    document.querySelectorAll('.tab-btn.is-next').forEach(b => b.classList.remove('is-next'));
  }, _VEIL_IN);
}
function _flowEdges() {
  const sc = _scroller();
  // 페이지 전체가 스크롤되는 화면(말씀 나눔·멤버·팀 소개)은 아이폰에서 주소창·도구 막대가 줄면
  // 보이는 높이(innerHeight)가 문서 높이(clientHeight)보다 커져, clientHeight 로 재면 끝에 닿지 않는다.
  // 가능한 높이 중 가장 큰 것으로 잰다. 소수점 스크롤로 몇 px 모자라게 멈추기도 한다.
  const doc = sc === (document.scrollingElement || document.documentElement);
  const viewH = doc
    ? Math.max(sc.clientHeight, window.innerHeight, window.visualViewport ? window.visualViewport.height : 0)
    : sc.clientHeight;
  return { top: sc.scrollTop <= 4, bottom: sc.scrollTop >= sc.scrollHeight - viewH - 12 };
}
(function initFlowGestures() {
  let base = null, dir = 0, amount = 0;
  window.addEventListener('touchstart', () => { base = null; dir = 0; amount = 0; }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (!_flowPageActive()) return;
    const y = e.touches[0].clientY;
    const edge = _flowEdges();
    if (base === null) {
      if (edge.bottom || edge.top) base = { y, bottom: edge.bottom, top: edge.top };
      return;
    }
    const dy = y - base.y;
    if (base.bottom && dy < 0 && edge.bottom) { dir = 1; amount = -dy; }
    else if (base.top && dy > 0 && edge.top) { dir = -1; amount = dy; }
    else { amount = 0; if (!edge.bottom && !edge.top) base = null; }
    if (dir) _flowPull(dir, amount);
  }, { passive: true });
  window.addEventListener('touchend', () => {
    if (dir && _flowPageActive()) _flowRelease(dir, amount);
    base = null; dir = 0; amount = 0;
  }, { passive: true });

  // 마우스 휠: 끝에서 같은 방향으로 계속 굴리면 쌓여서 넘어간다
  let acc = 0, wdir = 0, wt = 0;
  window.addEventListener('wheel', e => {
    if (!_flowPageActive()) return;
    const edge = _flowEdges();
    const d = e.deltaY > 0 ? 1 : -1;
    if (!((d > 0 && edge.bottom) || (d < 0 && edge.top))) { acc = 0; return; }
    if (d !== wdir) acc = 0;
    wdir = d;
    acc += Math.min(120, Math.abs(e.deltaY)) * 0.6;
    _flowPull(d, acc);
    clearTimeout(wt);
    if (acc >= _PULL) { const a = acc; acc = 0; _flowRelease(d, a); return; }
    wt = setTimeout(() => { _flowRelease(wdir, 0); acc = 0; }, 450);
  }, { passive: true });
})();

/* 각 탭 맨 끝에 「계속 내리면 ○○」 — 눌러도 넘어간다 */
(function initFlowCues() {
  const where = { songs: '#page-songs .sl-lp-ch', word: '#page-word', artists: '#page-artists', story: '#page-story' };
  Object.keys(where).forEach(tab => {
    const box = document.querySelector(where[tab]);
    const to = _flowNeighbor(tab, 1);
    if (!box || !to) return;
    const b = _el('button', 'flow-cue');
    b.type = 'button';
    const a = _el('span', '', '계속 내리면');
    const n = _el('b', '', { songs: '곡 리스트', word: '말씀 나눔', artists: '멤버 소개', story: '팀 소개', main: '메인' }[to]);
    b.append(a, ' ', n);
    b.addEventListener('click', () => _flowGo(to, false));
    box.appendChild(b);
  });
})();

const CONCERT = {
  // 날짜 확정 완료
  confirmed: true,
  dates: [
    { iso: '2026-12-19', short: '2026. 12. 19.', ko: '2026년 12월 19일', dow: '토요일' }
  ],
  time: {
    text: '오후 7:30 ~ 9:00',
    startUTC: 'T103000Z',   // KST 19:30
    endUTC:   'T120000Z'    // KST 21:00
  },
  // 장소 확정 완료
  venueConfirmed: true,
  venues: [
    { name: '향상교회 3층 체육관', address: '기흥구 언동로 140',
      mapQuery: '경기 용인시 기흥구 언동로 140' }
  ]
};

/** D-Day·캘린더·구조화 데이터의 기준 날짜 */
function concertBaseDate() {
  return CONCERT.dates[0];
}

/** 대표 장소 (캘린더 등 한 곳만 적어야 할 때) */
function concertBaseVenue() {
  return CONCERT.venues[0];
}


/* ══════════════════════════════════
   4. main-info.js — 메인 화면의 날짜·시간·장소 렌더
══════════════════════════════════ */

function renderDetailGrid() {
  const grid = document.getElementById('detailGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const card = (label, build, mod) => {
    const c = _el('div', 'detail-card' + (mod ? ' ' + mod : ''));
    c.appendChild(_el('p', 'card-label', label));
    build(c);
    grid.appendChild(c);
  };

  card(t('main.label.date', '날짜'), c => {
    CONCERT.dates.forEach((d, i) => {
      const v = _el('p', 'card-value');
      if (i > 0) v.appendChild(_el('span', 'card-note', '또는 '));
      v.appendChild(_el('span', 'card-strong', t('main.date', d.ko + ' ' + d.dow)));
      c.appendChild(v);
    });
    if (!CONCERT.confirmed) c.appendChild(_el('p', 'card-note card-note-block', '두 날짜 중 하나로 확정될 예정이에요'));
  }, 'is-date');

  card(t('main.label.time', '시간'), c => {
    const v = _el('p', 'card-value');
    v.appendChild(_el('span', 'card-strong', t('main.time', CONCERT.time.text)));
    c.appendChild(v);
  });

  card(t('main.label.place', '장소'), c => {
    CONCERT.venues.forEach((place, i) => {
      const v = _el('p', 'card-value');
      if (i > 0) v.appendChild(_el('span', 'card-note', '또는 '));
      v.appendChild(_el('span', 'card-strong venue-highlight', t('main.venue', place.name)));
      c.appendChild(v);
      if (place.address) {
        const addr = _el('p', 'card-value card-sub card-addr');
        addr.appendChild(_el('span', null, t('main.address', place.address)));
        /* 처음 오는 사람에게 가장 필요한 것은 '어떻게 가나' 다 */
        if (place.mapQuery) {
          addr.appendChild(_extLink('https://map.naver.com/p/search/' + encodeURIComponent(place.mapQuery),
            t('main.directions', '길찾기'), 'card-map', t('main.directions', '길찾기')));
        }
        c.appendChild(addr);
      }
    });
    if (!CONCERT.venueConfirmed) {
      c.appendChild(_el('p', 'card-note card-note-block', '두 장소 중 하나로 확정될 예정이에요'));
    }
  }, 'full-width');
}

/* ── 멤버 소개 (src/js/members.js 데이터로 렌더) ── */

/** 팀 이름은 옮기고, 사람 이름은 고유명사라 그대로 둔다 */
const TEAM_KEY = {
  '싱어': 'team.singer', '악기팀': 'team.band', '마케팅팀': 'team.marketing',
  '촬영팀': 'team.film', '스텝팀': 'team.staff', '소품팀': 'team.props'
};
const _teamName = g => t(TEAM_KEY[g] || '', g);

function renderMembers() {
  const wrap = document.getElementById('memberList');
  if (!wrap || typeof MEMBERS === 'undefined') return;
  wrap.innerHTML = '';

  // 표지: 사람 수(여러 팀에 속한 사람은 한 번만)와 팀 수
  const ids = new Set();
  MEMBERS.forEach(sec => sec.people.forEach(e => ids.add(e.id)));
  const meta = document.getElementById('mbMeta');
  if (meta) {
    meta.innerHTML = t('artists.meta', '{p}명 <span class="mb-sep">/</span> {t}팀이 <span class="mb-hl">한 무대</span>를 준비해요')
      .replace('{p}', ids.size).replace('{t}', MEMBERS.length);   // 숫자와 내가 적은 문구만 들어간다
  }
  const jump = document.getElementById('mbJump');
  if (jump) jump.innerHTML = '';

  const total = String(MEMBERS.length).padStart(2, '0');
  MEMBERS.forEach((section, gi) => {
    const block = _el('section', 'artist-section-block mb-team reveal');
    block.id = 'mb-team-' + gi;

    // 팀 머리말: 01 / 06 · 팀 이름 · 사람 수
    const head = _el('div', 'mb-team-head');
    const no = _el('p', 'sl-eyebrow');
    no.appendChild(_el('span', 'mb-team-no', String(gi + 1).padStart(2, '0')));
    no.appendChild(document.createTextNode(' / ' + total));
    head.appendChild(no);
    const title = _el('div', 'mb-team-title');
    title.appendChild(_el('h3', 'artist-group-label', _teamName(section.group)));
    title.appendChild(_el('span', 'mb-team-count',
      t('artists.count', '{n}명').replace('{n}', section.people.length)));
    head.appendChild(title);
    block.appendChild(head);

    // 표지의 팀 바로가기
    if (jump) {
      const chip = _el('button', 'mb-chip');
      chip.type = 'button';
      chip.appendChild(document.createTextNode(_teamName(section.group) + ' '));
      chip.appendChild(_el('span', '', String(section.people.length)));
      chip.onclick = () => block.scrollIntoView({ behavior: _reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      jump.appendChild(chip);
    }

    const grid = _el('div', 'artist-grid mb-grid');
    section.people.forEach((entry, pi) => {
      const person = resolveMember(entry);
      if (!person) return;               // PEOPLE 에 없는 id 는 건너뛴다
      // 남긴 이야기(말씀·한마디·교회·인스타)가 있으면 카드를 눌러 아래에서 올라오는 시트를 연다
      const linked = !!(person.instagram || person.verse || person.bio || person.church);
      const card = _el(linked ? 'button' : 'div', 'artist-card mb-card' + (linked ? ' is-linked' : ''));
      if (linked) {
        card.type = 'button';
        card.setAttribute('aria-haspopup', 'dialog');
        card.setAttribute('aria-label',
          _personName(person) + (person.role ? ' ' + _roleName(person.role) : '') + ' 소개 보기');
        card.onclick = () => openMember(gi, pi);
      }

      const avatar = _el('div', 'artist-avatar mb-av');
      const initial = () => _el('span', 'mb-initial', (_personName(person) || '?').trim().charAt(0));
      if (person.photo) {
        const img = _el('img');
        img.src = person.photo;
        img.alt = '';                 // 이름이 바로 옆에 있으므로 중복 읽기 방지
        img.loading = 'lazy';
        img.decoding = 'async';
        // 사진을 못 불러오면 조용히 이름 첫 글자로 되돌린다
        img.onerror = () => { img.remove(); avatar.appendChild(initial()); };
        avatar.appendChild(img);
      } else {
        avatar.appendChild(initial());
      }
      card.appendChild(avatar);

      const who = _el('span', 'mb-who');
      who.appendChild(_el('span', 'artist-card-name', _personName(person)));
      who.appendChild(_el('span', 'artist-card-role',
        person.role ? _roleName(person.role) : (person.church || _teamName(section.group))));
      card.appendChild(who);

      grid.appendChild(card);
    });

    block.appendChild(grid);
    wrap.appendChild(block);
  });
  // 보고 있는 중에 다시 그렸으면 새 장이 숨은 채 남지 않게
  if (document.getElementById('page-artists')?.classList.contains('active')) triggerReveal();
}


/** 멤버 카드를 누르면 아래에서 올라오는 시트 */
/** 멤버 시트의 말씀 접기/펼치기 */
function toggleMemberVerse() {
  const textEl = document.getElementById('memberVerseText');
  const open = textEl.classList.toggle('is-clamped');
  document.getElementById('memberVerseMore').textContent =
    open ? t('member.expand', '펼쳐보기') : t('songs.less', '접기');
}

function openMember(groupIndex, personIndex) {
  const section = MEMBERS[groupIndex];
  const entry = section && section.people[personIndex];
  const person = entry && resolveMember(entry);
  if (!person) return;

  const avatar = document.getElementById('memberAvatar');
  avatar.innerHTML = '';
  if (person.photo) {
    const img = _el('img');
    img.src = person.photo;
    img.alt = '';
    img.onerror = () => { img.remove(); avatar.appendChild(_avatarIcon(person)); };
    avatar.appendChild(img);
  } else {
    avatar.appendChild(_avatarIcon(person));
  }

  document.getElementById('memberName').textContent = _personName(person);
  // 맡은 팀을 모두 꼬리표로 (여러 팀에서 섬기는 사람도 있다)
  const role = document.getElementById('memberRole');
  role.innerHTML = '';
  MEMBERS.forEach(sec => sec.people.forEach(e => {
    if (e.id !== entry.id) return;
    const r = e.role ? ' ' + _roleName(e.role) : '';
    role.appendChild(_el('span', 'mb-tag', _teamName(sec.group) + r));
  }));

  // 한마디 — 없으면 영역째 감춘다
  document.getElementById('memberBio').textContent = person.bio || '';
  document.getElementById('memberSay').hidden = !person.bio;

  // 좋아하는 말씀 — 본문과 출처가 모두 있어야 보여준다
  const verse = person.verse;
  const verseBox = document.getElementById('memberVerse');
  const hasVerse = !!(verse && verse.text);
  verseBox.hidden = !hasVerse;
  if (hasVerse) {
    const textEl = document.getElementById('memberVerseText');
    textEl.textContent = verse.text;
    const refEl = document.getElementById('memberVerseRef');
    refEl.textContent = verse.ref || '';
    refEl.hidden = !verse.ref;

    // 긴 말씀은 세 줄만 보여주고 '펼쳐보기' 를 붙인다.
    // 세 줄 안에 다 들어가면 버튼을 그리지 않는다.
    // line-clamp 가 걸린 뒤에는 scrollHeight 도 잘린 높이로 나와서
    // 넘치는지 알 수 없다. 그래서 자르기 전에 전체 높이를 먼저 재고,
    // 같은 프레임 안에서 클래스를 붙인다(그리기 전이라 깜빡임이 없다).
    const moreBtn = document.getElementById('memberVerseMore');
    textEl.classList.remove('is-clamped');
    const fullHeight = textEl.scrollHeight;
    textEl.classList.add('is-clamped');
    moreBtn.textContent = t('member.expand', '펼쳐보기');
    moreBtn.hidden = textEl.clientHeight >= fullHeight - 1;
  }

  // 소속 교회 · 인스타 아이디 — 한마디 위에 나란히
  const meta = document.getElementById('memberMeta');
  meta.innerHTML = '';
  const metaRow = (iconNode, label, text, href) => {
    const li = _el('li', 'member-meta-row');
    iconNode.setAttribute('aria-hidden', 'true');
    li.appendChild(iconNode);

    // 링크가 있으면 글자를 눌러 바로 이동할 수 있게 한다
    const v = href ? _el('a', 'member-meta-text is-link') : _el('span', 'member-meta-text');
    v.textContent = text;
    if (href) {
      v.href = href;
      v.target = '_blank';
      v.rel = 'noopener noreferrer';
      v.setAttribute('aria-label', label + ' ' + text + ' (새 탭에서 열림)');
    } else {
      v.setAttribute('aria-label', label + ' ' + text);
    }
    li.appendChild(v);
    meta.appendChild(li);
  };

  const emojiIcon = ch => _el('span', 'member-meta-icon', ch);
  // 인스타는 브랜드 마크 그대로 — 테두리에 그라데이션이 들어간 로고.
  // 스프라이트(<use>)로는 그라데이션이 칠해지지 않아(그라데이션이
  // 그림자 트리 밖에 있어서 참조가 끊긴다) SVG 를 통째로 넣는다.
  const igIcon = () => {
    const box = _el('span', 'member-meta-icon member-meta-ig');
    const gid = 'igGrad' + (igIcon.n = (igIcon.n || 0) + 1);
    box.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<defs><linearGradient id="' + gid + '" gradientUnits="userSpaceOnUse" x1="1" y1="23" x2="23" y2="1">' +
          '<stop offset="0" stop-color="#FEDA75"/><stop offset=".25" stop-color="#FA7E1E"/>' +
          '<stop offset=".5" stop-color="#D62976"/><stop offset=".75" stop-color="#962FBF"/>' +
          '<stop offset="1" stop-color="#4F5BD5"/>' +
        '</linearGradient></defs>' +
        '<g fill="none" stroke="url(#' + gid + ')" stroke-width="2.15">' +
          '<rect x="2.2" y="2.2" width="19.6" height="19.6" rx="5.9"/>' +
          '<circle cx="12" cy="12" r="4.6"/>' +
        '</g>' +
        '<circle cx="17.6" cy="6.6" r="1.5" fill="url(#' + gid + ')"/>' +
      '</svg>';
    return box;
  };

  if (person.church) metaRow(emojiIcon('⛪'), '소속 교회', person.church);
  const handle = person.igId || _igHandle(person.instagram);
  if (handle) metaRow(igIcon(), '인스타그램', handle, person.instagram);
  meta.hidden = !meta.children.length;

  openOverlay('member');
  requestAnimationFrame(() => document.querySelector('.member-close').focus());
}

function closeMember() { closeOverlay('member'); }

/** 인스타 주소에서 아이디만 뽑는다. 주소 형태가 달라도 깨지지 않게 감싼다. */
function _igHandle(url) {
  if (!url) return '';
  try {
    return new URL(url).pathname.replace(/^\/+|\/+$/g, '').split('/')[0] || '';
  } catch (e) {
    return '';
  }
}


function _avatarIcon(person) {
  const icon = _el('span', 'avatar-placeholder', person.icon || '♪');
  icon.setAttribute('aria-hidden', 'true');
  return icon;
}


function renderFinaleDate() {
  const el = document.getElementById('finaleDate');
  if (!el) return;
  /* 날짜와 장소가 확정되어 하나씩이다. */
  const or = ' ' + t('common.or', '또는') + ' ';
  const date = CONCERT.dates.length === 1
    ? t('main.date', CONCERT.dates[0].short)
    : CONCERT.dates.map(d => d.short).join(or);
  const venue = CONCERT.venues.length === 1
    ? t('main.venue', CONCERT.venues[0].name)
    : CONCERT.venues.map(v => v.name).join(or);
  el.textContent = date + '\n' + venue;
}


/* ══════════════════════════════════
   5. dday.js — D-Day 카운트다운 + 캘린더
══════════════════════════════════ */

function updateDday() {
  const el = document.getElementById('ddayCounter');
  if (!el) return;

  const base = concertBaseDate();
  // 공연 시작(19:30) 기준으로 센다
  const target = new Date(base.iso + 'T19:30:00+09:00');
  const diff = target - new Date();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  el.textContent = diff <= 0 ? t('main.today', 'TODAY') : 'D-' + days;
}

function addToCalendar() {
  const base = concertBaseDate();
  const venue = concertBaseVenue();
  const stamp = base.iso.replace(/-/g, '');

  const title = '찬양이 좋아서 모인 청년들 LIVE CONCERT';
  const location = venue.name + (venue.address ? ', ' + venue.address : '');
  // 장소가 아직 미확정이면 캘린더 설명에 남겨 둔다
  const details = CONCERT.venueConfirmed
    ? '찬양이 좋아서 모인 청년들 LIVE CONCERT'
    : '찬양이 좋아서 모인 청년들 LIVE CONCERT\n\n장소는 ' +
      CONCERT.venues.map(v => v.name).join(' 또는 ') +
      ' 중 한 곳으로 정해질 예정이며, 이 일정은 ' + venue.name + ' 기준으로 등록됩니다.';

  const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent(title)
    + '&dates=' + stamp + CONCERT.time.startUTC + '/' + stamp + CONCERT.time.endUTC
    + '&location=' + encodeURIComponent(location)
    + '&details=' + encodeURIComponent(details);

  window.open(url, '_blank', 'noopener');
}


/* ══════════════════════════════════
   overlay.js — 오버레이(공유 시트·후원 모달·말씀 팝업) 공통 동작

   세 화면이 같은 일을 하고 있어 한곳으로 모았다.
   여는 방식만 다르고 배경 표시·스크롤 잠금·ESC 닫기·포커스 처리는 동일하다.
══════════════════════════════════ */

/** 등록된 오버레이: 배경 id, 패널 id */
const OVERLAYS = {
  share:  { backdrop: 'modalBackdrop',  panel: 'shareSheet'  },
  donate: { backdrop: 'donateBackdrop', panel: 'donateModal' },
  verse:  { backdrop: 'verseBackdrop',  panel: 'verseModal'  },
  member: { backdrop: 'memberBackdrop', panel: 'memberSheet'  },
  rsvp:   { backdrop: 'rsvpBackdrop',   panel: 'rsvpSheet'   },
  word:   { backdrop: 'wordBackdrop',   panel: 'wordSheet'   },
  wordRead: { backdrop: 'wordReadBackdrop', panel: 'wordReadModal' }
};

let _openOverlays = [];   // 여러 개가 겹쳐도 스크롤 잠금이 어긋나지 않게 스택으로
let _overlayOpener = null;

function _isOverlayOpen(name) {
  const o = OVERLAYS[name];
  return !!o && document.getElementById(o.panel).classList.contains('open');
}

function openOverlay(name) {
  const o = OVERLAYS[name];
  if (!o || _isOverlayOpen(name)) return;

  if (!_openOverlays.length) _overlayOpener = document.activeElement;
  _openOverlays.push(name);

  document.getElementById(o.backdrop).classList.add('open');
  document.getElementById(o.panel).classList.add('open');
  _lockScroll();
}

function closeOverlay(name) {
  const o = OVERLAYS[name];
  if (!o) return;

  const panel = document.getElementById(o.panel);
  // 끌어내리던 중이었다면 인라인 transform 을 걷어내 CSS 애니메이션에 맡긴다
  panel.style.transform = '';
  panel.style.transition = '';

  document.getElementById(o.backdrop).classList.remove('open');
  panel.classList.remove('open');

  // 창 안의 입력칸에 커서가 남아 있으면 키보드도 남는다. 닫을 때 반드시 뺀다.
  // (아이폰은 버튼을 눌러도 버튼에 초점을 주지 않아, 아래에서 '누른 버튼'으로
  //  초점을 돌려보내는 것만으로는 입력칸에서 커서가 빠지지 않는다)
  const active = document.activeElement;
  if (active && panel.contains(active) && active.blur) active.blur();

  _openOverlays = _openOverlays.filter(n => n !== name);
  if (_openOverlays.length) return;          // 아직 다른 게 열려 있으면 유지

  _unlockScroll();
  if (_overlayOpener && _overlayOpener.focus) _overlayOpener.focus();
  _overlayOpener = null;
}

/* ── 뒤 배경 스크롤 잠그기 ──────────────────────────────────────
   overflow: hidden 만으로는 iOS 사파리에서 손가락 스크롤이 막히지 않는다.
   그래서 배경 스크롤 위치를 고정해 두고, 패널 바깥에서 일어난
   touchmove 는 아예 막는다. 닫을 때 원래 위치로 되돌린다. */

let _scrollLockY = 0;

function _lockScroll() {
  if (document.documentElement.classList.contains('is-locked')) return;
  _scrollLockY = window.scrollY || document.documentElement.scrollTop || 0;
  document.body.style.top = (-_scrollLockY) + 'px';
  document.documentElement.classList.add('is-locked');
}

function _unlockScroll() {
  if (!document.documentElement.classList.contains('is-locked')) return;
  document.documentElement.classList.remove('is-locked');
  document.body.style.top = '';
  window.scrollTo(0, _scrollLockY);
}

/* 패널 안에서의 스크롤(말씀 본문 등)과 시트 끌기는 살리고,
   그 바깥에서의 스크롤만 막는다 */
document.addEventListener('touchmove', (e) => {
  if (!_openOverlays.length) return;
  const top = OVERLAYS[_openOverlays[_openOverlays.length - 1]];
  const panel = document.getElementById(top.panel);
  if (panel && !panel.contains(e.target)) e.preventDefault();
}, { passive: false });

/** 열려 있는 오버레이 안에 Tab 포커스를 가둔다 */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab' || !_openOverlays.length) return;

  const top = OVERLAYS[_openOverlays[_openOverlays.length - 1]];
  const panel = document.getElementById(top.panel);
  const items = [...panel.querySelectorAll('button, a[href], input, textarea, select')]
    .filter(el => el.offsetParent !== null && !el.hidden && el.tabIndex !== -1);
  if (!items.length) return;

  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/** ESC 로 맨 위 오버레이부터 닫는다 */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !_openOverlays.length) return;
  closeOverlay(_openOverlays[_openOverlays.length - 1]);
});


/* ══════════════════════════════════
   verse.js — 말씀 팝업

   본문을 사이트에 담아두고 팝업으로 보여준다. 외부 사이트로 나가지 않으므로
   오프라인·인앱 브라우저에서도 열린다. 전문을 보고 싶은 사람을 위해
   '전체 장 읽기' 링크는 팝업 안에 남겨 둔다.
══════════════════════════════════ */

function openVerse(slug, partIndex) {
  const song = findSong(slug);
  const bible = song && song.parts[partIndex] && song.parts[partIndex].bible;
  if (!bible) return;

  document.getElementById('verseRef').textContent = bible.ref;
  document.getElementById('verseVersion').textContent = bible.version;

  const note = document.getElementById('verseNote');
  note.textContent = bible.note || '';
  note.hidden = !bible.note;

  const body = document.getElementById('verseBody');
  body.innerHTML = '';
  bible.verses.forEach(v => {
    const p = _el('p', 'verse-line');
    const n = _el('span', 'verse-num', String(v[0]));
    n.setAttribute('aria-hidden', 'true');
    p.appendChild(n);
    p.appendChild(_el('span', 'verse-text', v[1]));
    body.appendChild(p);
  });

  const full = document.getElementById('verseFull');
  // 곡에 딸린 말씀은 개역한글 전체 장으로 보낸다
  full.href = bibleUrlFor(bible.url.split('/').pop());
  full.setAttribute('aria-label', bible.ref + ' 전체 장 읽기 (새 탭에서 열림)');

  body.scrollTop = 0;
  openOverlay('verse');

  // visibility 전환이 시작된 뒤에야 포커스가 들어간다
  requestAnimationFrame(() => document.querySelector('.verse-close').focus());
}

function closeVerse() { closeOverlay('verse'); }


/* ══════════════════════════════════
   lp-player.js — 곡 소개 및 미리듣기

   곡 리스트와 같은 SONGS 배열을 읽는다. 곡을 추가하면 여기도 함께 늘어난다.
══════════════════════════════════ */

// LP 라벨 색상 — 곡 수와 무관하게 순환시킨다.
// 라벨 위에 흰 숫자가 올라가므로 대비 4.5:1을 넘기도록 어둡게 잡았다.
const _LP_COLORS = ['#9c5044', '#4f6a5c', '#5c5877', '#8a6a41', '#43647b', '#7d5462',
                    '#57724c', '#6e5b42', '#4f5c72', '#845244', '#6d5b47', '#4f5e49'];

let _lpIndex = 0;

function _updateLP() {
  const song = SONGS[_lpIndex];
  if (!song) return;

  const color = _LP_COLORS[_lpIndex % _LP_COLORS.length];
  const label = document.getElementById('lpLabel');
  const name  = document.getElementById('lpTrackName');
  const count = document.getElementById('lpTrackCount');
  const yt    = document.getElementById('lpYtLink');
  const disc  = document.getElementById('lpDisc');

  label.textContent = song.no;
  name.textContent  = _songTitle(song);
  count.textContent = (_lpIndex + 1) + ' / ' + SONGS.length;
  disc.style.setProperty('--lp-label-color', color);

  // 디스크와 곡명을 누르면 해당 곡 상세로
  const go = () => { location.hash = '#/songs/' + song.slug; };
  disc.onclick = go;
  name.onclick = go;
  disc.setAttribute('aria-label', song.no + '번 ' + song.title + ' 가사와 말씀 보기');
  name.setAttribute('aria-label', song.no + '번 ' + song.title + ' 가사와 말씀 보기');

  // 유튜브 링크가 없는 곡은 버튼을 숨긴다 (빈 링크를 남기지 않는다)
  if (song.youtube) {
    yt.hidden = false;
    yt.href = song.youtube;
    yt.setAttribute('aria-label', song.title + ' ' + t('songs.youtube', 'YouTube에서 듣기'));
  } else {
    yt.hidden = true;
    yt.removeAttribute('href');
  }
}

function lpNext() {
  _lpIndex = (_lpIndex + 1) % SONGS.length;
  _updateLP();
}

function lpPrev() {
  _lpIndex = (_lpIndex - 1 + SONGS.length) % SONGS.length;
  _updateLP();
}


/* ══════════════════════════════════
   setlist-note.js — 콘티 한마디 접기/펼치기

   글이 다섯 문단이라 그대로 두면 곡 목록과 미리듣기 사이가 멀어진다.
   앞 두 문단(주제곡이 무엇이고 왜 그렇게 정했는지)만 보여 주고
   나머지는 눌러서 펼친다.

   페이지 안에 또 스크롤 상자를 두는 방법도 있었지만, 이미 세로로
   스크롤되는 화면 안에서 손가락이 어느 쪽을 움직일지 헷갈린다.
   그래서 펼치는 쪽을 골랐다.
══════════════════════════════════ */

function toggleSetlistNote() {
  const box = document.getElementById('setlistNoteRest');
  const btn = document.getElementById('setlistNoteToggle');
  if (!box || !btn) return;

  const opening = !box.classList.contains('open');

  if (opening) {
    box.classList.add('open');
    box.style.maxHeight = box.scrollHeight + 'px';
    // 다 펼쳐지면 고정 높이를 풀어 준다. 그래야 화면을 돌리거나
    // 글자 크기가 바뀌어도 잘리지 않는다.
    box.addEventListener('transitionend', function done(e) {
      if (e.propertyName !== 'max-height') return;
      box.style.maxHeight = 'none';
      box.removeEventListener('transitionend', done);
    });
  } else {
    // none 상태에서는 바로 0 으로 보내도 애니메이션이 걸리지 않는다.
    // 지금 높이를 px 로 한 번 고정한 뒤 접는다.
    box.style.maxHeight = box.scrollHeight + 'px';
    requestAnimationFrame(() => {
      box.classList.remove('open');
      box.style.maxHeight = '0px';
    });
  }

  btn.textContent = opening ? t('songs.less', '접기') : t('songs.more', '더 읽기');
  btn.setAttribute('aria-expanded', String(opening));
}


/* ══════════════════════════════════
   rsvp.js — 참여 신청

   ┌─ 설정 ──────────────────────────────────────────────────┐
   │ Supabase 프로젝트를 만든 뒤 아래 두 줄만 채우면 된다.      │
   │   url  프로젝트 URL   (https://xxxxxxxx.supabase.co)     │
   │   key  anon public 키                                    │
   │                                                          │
   │ 이 키는 공개 저장소에 올라간다. 그래도 되는 이유는        │
   │ 테이블에 '쓰기만 허용, 읽기 없음' 규칙(RLS)을 걸기        │
   │ 때문이다. 즉 이 키로는 신청만 넣을 수 있고 신청자 명단을  │
   │ 꺼내 볼 수 없다. 명단은 Supabase 관리자 화면에서만 본다.  │
   │ 반대로 service_role 키는 절대 여기 넣으면 안 된다.        │
   └──────────────────────────────────────────────────────────┘ */

const RSVP = {
  url:   'https://kjlaluzoeygsqojnioce.supabase.co',
  key:   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqbGFsdXpvZXlnc3Fvam5pb2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDU1NDgsImV4cCI6MjEwNjUyMTU0OH0.3x7k6VygIw7JSMcP4MhKP0NKuJ4J48Vzs64SU3Uz6Vg',
  table: 'rsvp'
};

// 같은 사람이 실수로 연속해 누르는 것만 막는다 (초)
const RSVP_COOLDOWN = 30;

/* 창을 열 때 입력칸에 바로 커서를 넣으면 휴대폰에서 키보드가 저절로 올라온다.
   대신 창 자체에 초점을 둔다. 키보드는 뜨지 않고, 화면 낭독기는 창 제목을 읽어 준다.
   입력칸은 사용자가 눌렀을 때 비로소 키보드를 띄운다. */
function _focusDialog(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '-1');
  panel.focus({ preventScroll: true });
}

function openRsvp() {
  _rsvpReset();
  openOverlay('rsvp');
  requestAnimationFrame(() => _focusDialog('rsvpSheet'));
}

function closeRsvp() { closeOverlay('rsvp'); }

/** 시트를 열 때마다 처음 상태로 — 완료 화면이 남아 있지 않게 */
function _rsvpReset() {
  const form = document.getElementById('rsvpForm');
  const done = document.getElementById('rsvpDone');
  if (!form || !done) return;
  form.hidden = false;
  done.hidden = true;
  document.getElementById('rsvpLabel').hidden = false;
  document.getElementById('rsvpTitle').textContent = t('rsvp.title', '참여 신청');
  _rsvpError('');
  _rsvpBusy(false);
}

function _rsvpError(msg) {
  const el = document.getElementById('rsvpError');
  if (!el) return;
  el.textContent = msg || '';
  el.hidden = !msg;
}

function _rsvpBusy(on) {
  const btn = document.getElementById('rsvpSubmit');
  if (!btn) return;
  btn.disabled = on;
  btn.textContent = on ? t('rsvp.sending', '보내는 중...') : t('rsvp.submit', '신청하기');
}

/** 글자 수 표시 */
function _rsvpBindCount() {
  const ta = document.getElementById('rsvpMessage');
  const out = document.getElementById('rsvpCount');
  if (!ta || !out) return;
  ta.addEventListener('input', () => { out.textContent = ta.value.length; });
}

async function _rsvpSubmit(e) {
  e.preventDefault();
  _rsvpError('');

  const nameEl  = document.getElementById('rsvpName');
  const agreeEl = document.getElementById('rsvpAgree');

  // 자동 프로그램이 채우는 함정 칸. 조용히 끝낸 척한다.
  if (document.getElementById('rsvpWebsite').value) { _rsvpShowDone(nameEl.value.trim()); return; }

  const name    = nameEl.value.trim();
  const church  = document.getElementById('rsvpChurch').value.trim();
  const message = document.getElementById('rsvpMessage').value.trim();
  const agree   = agreeEl.checked;

  // '·' 는 이 손글씨 서체에 없어서, 이 글자 하나로 503KB 폴백이 내려온다
  if (!name)            { _rsvpError('이름을 입력해주세요.'); nameEl.focus(); return; }
  if (name.length > 40) { _rsvpError('이름이 너무 깁니다.');   nameEl.focus(); return; }
  if (!agree)           { _rsvpError('개인정보 수집 및 이용에 동의해주세요.'); agreeEl.focus(); return; }

  // 연속 전송 막기
  const last = Number(_rsvpStore('get') || 0);
  const left = RSVP_COOLDOWN - Math.floor((Date.now() - last) / 1000);
  if (last && left > 0) { _rsvpError('방금 신청하셨어요. ' + left + '초 뒤에 다시 시도해주세요.'); return; }

  if (!RSVP.url || !RSVP.key) {
    _rsvpError('아직 신청 받을 준비가 되지 않았어요. 잠시 뒤 다시 시도해주세요.');
    console.warn('[rsvp] RSVP.url / RSVP.key 가 비어 있습니다. src/js/app.js 의 RSVP 설정을 채워주세요.');
    return;
  }

  _rsvpBusy(true);
  try {
    const res = await fetch(RSVP.url.replace(/\/+$/, '') + '/rest/v1/' + RSVP.table, {
      method: 'POST',
      headers: {
        'apikey': RSVP.key,
        'Authorization': 'Bearer ' + RSVP.key,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        name: name,
        church: church || null,
        message: message || null
      })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    _rsvpStore('set');
    _rsvpShowDone(name);
  } catch (err) {
    console.error('[rsvp]', err);
    _rsvpError('신청을 보내지 못했어요. 인터넷 연결을 확인하고 다시 시도해주세요.');
    _rsvpBusy(false);
  }
}

function _rsvpShowDone(name) {
  document.getElementById('rsvpForm').hidden = true;

  // 하트 위쪽을 신청한 사람 이름으로 바꾼다 ('참여 신청' → '최원근님!')
  if (name) {
    document.getElementById('rsvpLabel').hidden = true;
    document.getElementById('rsvpTitle').textContent = name + '님!';
  }

  const done = document.getElementById('rsvpDone');
  done.hidden = false;
  requestAnimationFrame(() => done.querySelector('.rsvp-done-close').focus());
}

/** 마지막 신청 시각 — 저장이 막혀 있어도(사생활 보호 모드) 터지지 않게 감싼다 */
function _rsvpStore(mode) {
  try {
    if (mode === 'set') { localStorage.setItem('rsvp-last', String(Date.now())); return null; }
    return localStorage.getItem('rsvp-last');
  } catch (e) { return null; }
}


/* ══════════════════════════════════
   word.js — 말씀 나눔

   읽기도 쓰기도 Edge Function 을 거친다. 사이트에 박힌 anon 키로는
   이 표에 아무 권한이 없어서, 암호를 모르면 읽을 수도 쓸 수도 없다.

   edit_token 은 글을 쓸 때 브라우저가 만들어 들고 있는 열쇠다.
   서버는 목록을 내려줄 때 이 값을 빼고 보내므로, 남의 글은 지울 수 없다.
══════════════════════════════════ */

/** 팝업에서 다시 꺼내 쓰려고 들고 있는 글들 */
const _wordById = {};

const WORD = {
  get endpoint() { return RSVP.url.replace(/\/+$/, '') + '/functions/v1/devotions'; },
  passKey: 'word-pass',
  mineKey: 'word-mine'
};

/* 암호를 얼마나 기억할까
   팀끼리만 보는 글이라 한 번 넣으면 영원히 열리는 것은 곤란하다.
   기기를 빌려주거나 잃어버렸을 때 그대로 열린다.

     · sessionStorage 에 둔다 → 브라우저(탭)를 닫으면 사라진다
     · 거기에 더해 시간 제한   → 탭을 며칠씩 열어 두는 경우를 막는다

   '내 글' 표시(word-mine)는 암호와 상관없으니 localStorage 에 그대로 둔다. */
const WORD_PASS_HOURS = 12;

/* ── 브라우저에 두는 것 ─────────────────────────────── */

/* 예전에는 암호를 localStorage 에 두어서, 한 번 들어온 기기에는 그대로
   남아 있다. 새 방식으로 넘어오면서 그 값을 지운다. */
(function () {
  try { localStorage.removeItem('word-pass'); } catch (e) { /* 저장이 막혀 있어도 그만 */ }
})();

/** 암호는 세션에만, 그리고 12시간까지만 */
function _wordPass(value) {
  try {
    if (value === null) { sessionStorage.removeItem(WORD.passKey); return null; }
    if (value !== undefined) {
      sessionStorage.setItem(WORD.passKey, JSON.stringify({ v: value, at: Date.now() }));
      return value;
    }
    const raw = sessionStorage.getItem(WORD.passKey);
    if (!raw) return null;
    const box = JSON.parse(raw);
    if (!box || !box.v) return null;
    if (Date.now() - box.at > WORD_PASS_HOURS * 3600 * 1000) {
      sessionStorage.removeItem(WORD.passKey);   // 시간이 지났다
      return null;
    }
    return box.v;
  } catch (e) { return null; }
}

function _wordStore(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    if (value === null) { localStorage.removeItem(key); return null; }
    localStorage.setItem(key, value);
    return value;
  } catch (e) { return null; }
}

/** 내가 쓴 글: { 글id: 열쇠 } */
function _wordMine(update) {
  let map = {};
  try { map = JSON.parse(_wordStore(WORD.mineKey) || '{}'); } catch (e) { map = {}; }
  if (update) { Object.assign(map, update); _wordStore(WORD.mineKey, JSON.stringify(map)); }
  return map;
}

function _wordToken() {
  if (crypto.randomUUID) return crypto.randomUUID() + crypto.randomUUID().slice(0, 8);
  return String(Date.now()) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

/* ── 서버와 이야기하기 ──────────────────────────────── */

async function _wordCall(action, extra) {
  const res = await fetch(WORD.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': RSVP.key,
      'Authorization': 'Bearer ' + RSVP.key
    },
    body: JSON.stringify(Object.assign({ action: action, passcode: _wordPass() || '' }, extra || {}))
  });
  let data = {};
  try { data = await res.json(); } catch (e) { /* 본문이 없을 수 있다 */ }
  if (!res.ok) throw Object.assign(new Error(data.error || ('HTTP ' + res.status)), { status: res.status });
  return data;
}

/* ── 모두에게 공개한 묵상 ────────────────────────────────
   암호 없이 보이는 자리라 잠금 화면 아래에 둔다. 글이 길어지면 화면을
   잡아먹으므로 세로로 쌓지 않고 카드를 가로로 넘겨 보게 했다.
   한 장이 화면 폭의 80% 라 옆 카드가 살짝 보이고, 그게 '더 있다' 는
   신호가 된다. */

async function loadWordOpen() {
  const sec = document.getElementById('wordOpen');
  const rail = document.getElementById('wordOpenRail');
  if (!sec || !rail) return;

  /* 불러오는 동안 자리를 비워 두면 화면이 덜컥 늘어난다.
     먼저 '불러오는 중' 을 보여 주고, 글이 도착하면 바꿔 끼운다. */
  rail.innerHTML = '';
  rail.appendChild(_el('p', 'word-open-loading', t('word.openLoading', '나눔 불러오는 중...')));
  sec.hidden = false;
  const hintEl = sec.querySelector('.word-open-hint');
  if (hintEl) hintEl.hidden = true;

  let items = [];
  try {
    const res = await fetch(WORD.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': RSVP.key,
        'Authorization': 'Bearer ' + RSVP.key
      },
      body: JSON.stringify({ action: 'open' })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    items = (await res.json()).items || [];
  } catch (e) {
    sec.hidden = true;      // 못 불러오면 조용히 접는다. 잠금 화면은 그대로 쓴다.
    return;
  }

  if (!items.length) { sec.hidden = true; return; }

  rail.innerHTML = '';
  items.forEach((row, i) => {
    _wordById[row.id] = row;

    const card = _el('button', 'word-open-card');
    card.type = 'button';
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-label',
      (row.display_name || t('word.anon', '익명')) + '님의 묵상 읽기' + (row.verse_ref ? ' — ' + row.verse_ref : ''));
    card.onclick = () => openWordRead(row.id);

    card.appendChild(_el('span', 'word-open-name', row.display_name || t('word.anon', '익명')));
    if (row.verse_ref) card.appendChild(_el('span', 'word-open-ref', row.verse_ref));
    card.appendChild(_el('span', 'word-open-body', row.body));

    const foot = _el('span', 'word-open-foot');
    const n = _el('span', 'word-open-count');
    n.appendChild(_el('span', 'word-like-mark', '♡'));
    n.appendChild(_el('span', null, String(row.likes || 0)));
    foot.appendChild(n);
    foot.appendChild(_el('span', 'word-open-more', t('word.openMore', '읽어보기')));
    card.appendChild(foot);

    /* 카드마다 조금씩 늦게 떠오르게 한다. 순서대로 읽히도록.
       0.06초씩 미루되 너무 늦지 않게 0.4초에서 멈춘다. */
    card.classList.add('word-open-in');
    card.style.animationDelay = Math.min(i * 0.06, 0.4) + 's';

    rail.appendChild(card);
  });

  // 넘길 것이 없으면 안내를 감춘다
  const hint = sec.querySelector('.word-open-hint');
  if (hint) hint.hidden = items.length < 2;

  sec.hidden = false;
}

/* ── 잠금 화면 ──────────────────────────────────────── */

function _wordShowLock(msg) {
  document.getElementById('wordLock').hidden = false;
  document.getElementById('wordMain').hidden = true;
  _syncShareFab();
  loadWordOpen();          // 암호가 없어도 공개 묵상은 읽을 수 있다
  const err = document.getElementById('wordLockError');
  err.textContent = msg || '';
  err.hidden = !msg;
}

async function _wordUnlock(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('wordPass');
  const btn = document.getElementById('wordLockBtn');
  const value = input.value.trim();
  if (!value) { _wordShowLock('암호를 넣어주세요.'); input.focus(); return; }

  btn.disabled = true; btn.textContent = t('word.checking', '확인하는 중...');
  const before = _wordPass();
  _wordPass(value);
  try {
    await _wordCall('list');          // 통과하면 암호가 맞다
    input.value = '';
    await loadWord();
  } catch (err) {
    _wordPass(before);  // 틀렸으면 되돌린다
    _wordShowLock(err.status === 401 ? '암호가 맞지 않아요.'
                 : err.status === 429 ? '여러 번 틀렸어요. 잠시 뒤에 다시 시도해주세요.'
                 : err.status === 503 ? '아직 준비가 되지 않았어요. 관리자에게 알려주세요.'
                 : '연결하지 못했어요. 잠시 뒤에 다시 시도해주세요.');
  } finally {
    btn.disabled = false; btn.textContent = t('word.enter', '들어가기');
  }
}

/* ── 이번 주 함께 읽는 말씀 ──────────────────────────────
   빈 화면 앞에서 '뭘 쓰지' 하는 것이 가장 큰 장벽이다. 관리자가 한 구절을
   걸어 두면 거기서 시작할 수 있고, 같은 말씀을 각자 다르게 받은 것을
   보는 재미도 생긴다. 걸려 있지 않으면 영역째 접는다. */

let _wordWeekly = null;

function _renderWeekly(wk) {
  _wordWeekly = wk;
  const sec = document.getElementById('wordWeekly');
  if (!sec) return;
  if (!wk || !wk.verse_ref) { sec.hidden = true; return; }

  document.getElementById('wordWeeklyRef').textContent = wk.verse_ref;

  const note = document.getElementById('wordWeeklyNote');
  note.textContent = wk.note || '';
  note.hidden = !wk.note;

  // 구절을 읽어낼 수 있을 때만 본문 링크를 건다
  const link = document.getElementById('wordWeeklyLink');
  const parsed = parseVerseRef(wk.verse_ref);
  if (parsed) {
    link.hidden = false;
    link.href = bibleUrlFor(parsed.usfm);
    link.setAttribute('aria-label', wk.verse_ref + ' 본문 보기 (새 탭에서 열림)');
  } else {
    link.hidden = true;
    link.removeAttribute('href');
  }
  sec.hidden = false;
}

/* ── 목록 ───────────────────────────────────────────── */

function _wordState(msg) {
  const el = document.getElementById('wordState');
  el.textContent = msg || '';
  el.hidden = !msg;
}

/* 공유 버튼은 화면 오른쪽 아래에 떠 있다. 말씀 나눔에 들어가면
   나눔 카드와 겹쳐 글이 가려지므로, 들어가 있는 동안만 감춘다.
   잠금 화면이나 다른 탭에서는 그대로 보인다. */
function _syncShareFab() {
  const fab = document.querySelector('.share-fab');
  if (!fab) return;
  const main = document.getElementById('wordMain');
  const inWord = parseHash().tab === 'word' && main && !main.hidden;
  fab.hidden = !!inWord;
}

async function loadWord() {
  if (!_wordPass()) { _wordShowLock(''); return; }

  document.getElementById('wordLock').hidden = true;
  document.getElementById('wordMain').hidden = false;
  // 들어오면 아래 목록에 다 들어 있으므로 따로 띄우지 않는다
  document.getElementById('wordOpen').hidden = true;
  _syncShareFab();

  // 지난번에 고른 보기 방식으로 버튼을 맞춰 둔다
  const mode = _wordViewMode();
  document.querySelectorAll('.word-view').forEach(b => {
    const on = b.dataset.view === mode;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-selected', String(on));
  });

  _wordState(t('word.loading', '불러오는 중...'));
  try {
    const data = await _wordCall('list');
    _renderWeekly(data.weekly || null);
    _renderWord(data.items || []);
  } catch (err) {
    if (err.status === 401) { _wordPass(null); _wordShowLock('암호가 바뀐 것 같아요. 다시 넣어주세요.'); return; }
    document.getElementById('wordList').innerHTML = '';
    _wordState('불러오지 못했어요. 잠시 뒤에 다시 열어주세요.');
  }
}

/** 그 주의 월요일 (서버와 같은 기준) */
function _wordThisWeek(d) {
  const kst = new Date((d || new Date()).getTime() + 9 * 3600 * 1000);
  const day = (kst.getUTCDay() + 6) % 7;
  kst.setUTCDate(kst.getUTCDate() - day);
  return kst.toISOString().slice(0, 10);
}

function _wordWeekLabel(week) {
  const now = _wordThisWeek();
  if (week === now) return t('word.thisWeek', '이번 주');
  const last = new Date(now); last.setUTCDate(last.getUTCDate() - 7);
  if (week === last.toISOString().slice(0, 10)) return t('word.lastWeek', '지난 주');
  const d = new Date(week + 'T00:00:00Z');
  return (d.getUTCMonth() + 1) + '월 ' + d.getUTCDate() + '일 주간';
}

/* ── 보기 방식 ──────────────────────────────────────────
   글이 쌓이면 한 줄로 늘어놓는 것만으로는 읽을 수 없게 된다.
   세 가지로 줄인다.
     · 묵상은 네 줄까지만 보이고 나머지는 눌러서 편다
     · 지난 주는 접어 둔다 (이번 주만 펼침)
     · 주차별 / 사람별 중에 골라 본다
══════════════════════════════════════════════════════ */

let _wordItems = [];

function _wordViewMode() { return _wordStore('word-view') === 'person' ? 'person' : 'week'; }

function switchWordView(mode) {
  _wordStore('word-view', mode);
  document.querySelectorAll('.word-view').forEach(b => {
    const on = b.dataset.view === mode;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-selected', String(on));
  });
  _renderWord(_wordItems);
}

/** 묵상 본문을 네 줄로 접고, 넘칠 때만 '더 읽기' 를 붙인다.
    line-clamp 이 걸린 뒤에는 scrollHeight 도 잘린 높이로 나와서
    넘치는지 알 수 없다. 자르기 전에 전체 높이를 먼저 잰다. */
function _wordClampAll() {
  document.querySelectorAll('.word-card-body').forEach(el => {
    const btn = el.nextElementSibling;
    if (!btn || !btn.classList.contains('word-more')) return;
    el.classList.remove('is-clamped');
    const full = el.scrollHeight;
    el.classList.add('is-clamped');
    // 화면에 아직 안 올라왔으면(높이 0) 버튼을 그리지 않는다
    btn.hidden = !el.clientHeight || el.clientHeight >= full - 1;
  });
}

/** 글 한 장 — 이름을 맨 위에 두고, 본문은 네 줄까지만 보인다 */
function _wordCard(row, mine, opts) {
  _wordById[row.id] = row;

  const card = _el('article', 'word-card');

  // 이름이 먼저. 누가 나눴는지가 글보다 앞선다.
  // '공개 동의' 같은 표시는 그 이름 옆에 붙는다 — 누가 어디까지 열었는지가
  // 한 덩어리로 읽힌다.
  if (!opts || !opts.hideName) {
    const nameRow = _el('p', 'word-card-name');
    nameRow.appendChild(_el('span', null, row.display_name || t('word.anon', '익명')));
    if (row.share_now)        nameRow.appendChild(_el('span', 'word-card-open is-now', '모두 공개'));
    else if (row.share_later) nameRow.appendChild(_el('span', 'word-card-open', '공개 동의'));
    card.appendChild(nameRow);
  }

  const top = _el('p', 'word-card-top');
  if (opts && opts.showDate) top.appendChild(_el('span', 'word-card-date', _wordDate(row.created_at)));
  if (row.verse_ref) {
    const ref = _el('span', 'word-card-ref');
    ref.appendChild(_el('span', 'word-card-ref-mark', '♥'));
    ref.appendChild(_el('span', null, row.verse_ref));
    top.appendChild(ref);
  }
  if (top.children.length) card.appendChild(top);

  card.appendChild(_el('p', 'word-card-body is-clamped', row.body));

  // 길면 팝업으로 전문을 본다 (곡 상세의 말씀 창과 같은 방식)
  const more = _el('button', 'word-more', t('word.more', '더 읽기'));
  more.type = 'button';
  more.hidden = true;
  more.setAttribute('aria-haspopup', 'dialog');
  more.onclick = () => openWordRead(row.id);
  card.appendChild(more);

  const foot = _el('p', 'word-card-foot');
  foot.appendChild(_wordLikeBtn(row));
  foot.appendChild(_el('span', 'word-card-views', '조회 ' + (row.views || 0)));
  if (mine[row.id]) {
    const del = _el('button', 'word-card-del', '지우기');
    del.type = 'button';
    del.onclick = () => _wordRemove(row.id);
    foot.appendChild(del);
  }
  if (foot.children.length) card.appendChild(foot);
  return card;
}

/* ── 좋아요와 조회 ───────────────────────────────────────
   좋아요는 누른 사람 이름을 남기지 않는다. 숫자만 쌓인다. 수줍은 사람도
   부담 없이 누르고, 쓴 사람은 혼자가 아니란 걸 안다.
   누가 눌렀는지는 브라우저만 기억한다(서버에는 숫자뿐).

   조회는 같은 기기에서 여러 번 열어도 한 번만 센다. 한 사람이 다시
   읽을 때마다 올라가면 '몇 명이 읽었나' 를 알 수 없다.

   둘 다 암호를 넣고 들어온 사람만 센다. 공개 카드를 지나가며 본 사람까지
   세면 숫자를 부풀리기 너무 쉽다. */

function _wordFlags(key, id, set) {
  let map = {};
  try { map = JSON.parse(_wordStore(key) || '{}'); } catch (e) { map = {}; }
  if (set === undefined) return !!map[id];
  if (set) map[id] = 1; else delete map[id];
  _wordStore(key, JSON.stringify(map));
  return set;
}

const _wordLiked  = (id, set) => _wordFlags('word-liked', id, set);
const _wordViewed = (id, set) => _wordFlags('word-viewed', id, set);

function _wordLikeBtn(row) {
  const btn = _el('button', 'word-like');
  btn.type = 'button';
  const paint = () => {
    const on = _wordLiked(row.id);
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', '좋아요 ' + (row.likes || 0) + '개' + (on ? ', 누름' : ''));
    btn.innerHTML = '';
    const heart = _el('span', 'word-like-mark', on ? '♥' : '♡');
    heart.setAttribute('aria-hidden', 'true');
    btn.appendChild(heart);
    btn.appendChild(_el('span', 'word-like-n', String(row.likes || 0)));
  };
  paint();

  btn.onclick = async (e) => {
    e.stopPropagation();
    if (!_wordPass()) return;              // 로그인한 사람만
    const next = !_wordLiked(row.id);
    // 먼저 화면을 바꾸고 보낸다. 실패하면 되돌린다.
    row.likes = Math.max(0, (row.likes || 0) + (next ? 1 : -1));
    _wordLiked(row.id, next);
    paint();
    try {
      const r = await _wordCall('like', { id: row.id, on: next });
      if (typeof r.likes === 'number') { row.likes = r.likes; paint(); }
    } catch (err) {
      row.likes = Math.max(0, (row.likes || 0) + (next ? -1 : 1));
      _wordLiked(row.id, !next);
      paint();
      showToast('기록하지 못했어요');
    }
  };
  return btn;
}

/** 처음 열어 본 글만 조회로 센다 */
function _wordCountView(row) {
  if (!row || _wordViewed(row.id) || !_wordPass()) return;
  _wordViewed(row.id, true);
  row.views = (row.views || 0) + 1;
  _wordCall('view', { id: row.id }).catch(() => { /* 못 세도 읽는 데는 지장 없다 */ });
}

/* ── 묵상 전문 팝업 ── */



function openWordRead(id) {
  const row = _wordById[id];
  if (!row) return;

  document.getElementById('wordReadName').textContent = row.display_name || t('word.anon', '익명');

  // 구절 줄 — 적힌 표기 그대로 보여주고, 읽어낼 수 있으면 링크와 저장을 붙인다
  const v = document.getElementById('wordReadVerse');
  v.hidden = !row.verse_ref;
  document.getElementById('wordReadRef').textContent = row.verse_ref || '';

  const link = document.getElementById('wordReadLink');
  const parsed = row.verse_ref ? parseVerseRef(row.verse_ref) : null;

  if (parsed) {
    link.hidden = false;
    link.href = bibleUrlFor(parsed.usfm);
    link.setAttribute('aria-label', row.verse_ref + ' 본문 보기 (새 탭에서 열림)');
  } else {
    // 구절을 읽어내지 못했다. 엉뚱한 곳으로 보내느니 링크를 안 만든다.
    link.hidden = true;
    link.removeAttribute('href');
  }

  _wordParagraphs(document.getElementById('wordReadBody'), row.body);
  document.getElementById('wordReadDate').textContent = _wordFullDate(row.created_at);

  _wordCountView(row);

  document.getElementById('wordReadBody').scrollTop = 0;
  openOverlay('wordRead');
  requestAnimationFrame(() => document.querySelector('#wordReadModal .verse-close').focus());
}

function closeWordRead() { closeOverlay('wordRead'); }

/** 묵상을 문단으로 끊어 넣는다.
    빈 줄로 나뉜 덩어리는 각각 한 문단이 되고, 문단 안의 줄바꿈은 그대로 둔다.
    통째로 textContent 에 넣으면 줄바꿈이 다 뭉개져 한 덩어리로 붙어 버린다. */
function _wordParagraphs(box, text) {
  box.innerHTML = '';
  String(text || '')
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n+/)            // 빈 줄 하나 이상 = 문단 경계
    .map(t => t.trim())
    .filter(Boolean)
    .forEach(chunk => {
      const p = _el('p', 'word-read-p');
      chunk.split('\n').forEach((line, i) => {
        if (i) p.appendChild(document.createElement('br'));
        p.appendChild(document.createTextNode(line));
      });
      box.appendChild(p);
    });
}

function _wordFullDate(iso) {
  const d = new Date(iso);
  return d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일';
}

function _wordDate(iso) {
  const d = new Date(iso);
  return (d.getMonth() + 1) + '/' + d.getDate();
}

/** 접었다 폈다 하는 묶음 */
function _wordGroup(title, count, rows, mine, opts, openByDefault) {
  const sec = _el('section', 'word-group' + (openByDefault ? ' is-open' : ''));

  const head = _el('button', 'word-group-head');
  head.type = 'button';
  head.setAttribute('aria-expanded', String(!!openByDefault));
  head.appendChild(_el('span', 'word-group-title', title));
  head.appendChild(_el('span', 'word-group-count', count + '개'));
  const mark = _el('span', 'word-group-mark');
  mark.setAttribute('aria-hidden', 'true');
  head.appendChild(mark);
  sec.appendChild(head);

  const box = _el('div', 'word-group-body');
  rows.forEach(r => box.appendChild(_wordCard(r, mine, opts)));
  sec.appendChild(box);

  head.onclick = () => {
    const open = sec.classList.toggle('is-open');
    head.setAttribute('aria-expanded', String(open));
    if (open) _wordClampAll();
  };
  return sec;
}

function _renderWord(items) {
  _wordItems = items || [];
  const wrap = document.getElementById('wordList');
  wrap.innerHTML = '';

  if (!_wordItems.length) {
    _wordState('');
    const empty = _el('div', 'word-empty');
    empty.appendChild(_el('p', 'word-empty-title', '아직 나눈 말씀이 없어요'));
    empty.appendChild(_el('p', 'word-empty-text', '첫 묵상을 남겨보세요. 몇 문장이면 충분해요.'));
    wrap.appendChild(empty);
    return;
  }
  _wordState('');

  const mine = _wordMine();
  if (_wordViewMode() === 'person') _renderWordByPerson(wrap, mine);
  else                              _renderWordByWeek(wrap, mine);

  requestAnimationFrame(_wordClampAll);
}

function _renderWordByWeek(wrap, mine) {
  const weeks = [];
  _wordItems.forEach(it => {
    let g = weeks.find(w => w.week === it.week);
    if (!g) { g = { week: it.week, rows: [] }; weeks.push(g); }
    g.rows.push(it);
  });
  // 이번 주만 펼치고 지난 주는 접어 둔다
  weeks.forEach((g, i) => {
    wrap.appendChild(_wordGroup(_wordWeekLabel(g.week), g.rows.length, g.rows, mine, { showDate: true }, i === 0));
  });
}

function _renderWordByPerson(wrap, mine) {
  const people = [];
  const anon = [];
  _wordItems.forEach(it => {
    const name = (it.display_name || '').trim();
    if (!name) { anon.push(it); return; }
    let g = people.find(p => p.name === name);
    if (!g) { g = { name: name, rows: [] }; people.push(g); }
    g.rows.push(it);
  });
  people.sort((a, b) => b.rows.length - a.rows.length);

  // 사람별에서는 전부 접은 채로 시작한다. 한 사람 것만 펼쳐 두면
  // 다른 이름들이 그 아래로 밀려나 누가 있는지 한눈에 안 들어온다.
  // 이 화면의 쓸모는 '누가 무엇을 나눴나' 를 훑는 것이라 목차처럼 둔다.
  people.forEach(g => {
    wrap.appendChild(_wordGroup(g.name, g.rows.length, g.rows, mine, { showDate: true, hideName: true }, false));
  });

  // 익명 글은 한 사람으로 묶지 않는다. 서로 다른 사람의 글일 수 있다.
  if (anon.length) {
    const sec = _wordGroup('익명으로 나눈 글', anon.length, anon, mine, { showDate: true, hideName: true }, false);
    const note = _el('p', 'word-group-note', '이름을 적지 않은 글이에요. 여러 사람의 글일 수 있어요.');
    sec.querySelector('.word-group-body').prepend(note);
    wrap.appendChild(sec);
  }
}

async function _wordRemove(id) {
  const token = _wordMine()[id];
  if (!token) return;
  if (!confirm('이 글을 지울까요? 되돌릴 수 없어요.')) return;
  try {
    await _wordCall('remove', { id: id, edit_token: token });
    const map = _wordMine(); delete map[id];
    _wordStore(WORD.mineKey, JSON.stringify(map));
    await loadWord();
  } catch (err) {
    _wordState('지우지 못했어요. 잠시 뒤에 다시 시도해주세요.');
  }
}

/* ── 쓰기 창 ────────────────────────────────────────── */

function openWordWrite() {
  const form = document.getElementById('wordForm');
  const done = document.getElementById('wordDone');
  form.hidden = false; done.hidden = true;

  // 이번 주 말씀이 걸려 있으면 구절 칸을 미리 채워 둔다. 지우고 다른 구절을
  // 적어도 된다. 비어 있을 때만 넣어 쓰던 글을 덮지 않는다.
  const verse = document.getElementById('wordVerse');
  if (_wordWeekly && _wordWeekly.verse_ref && !verse.value) {
    verse.value = _wordWeekly.verse_ref;
  }
  _wordFormError('');
  _wordFormBusy(false);
  openOverlay('word');
  requestAnimationFrame(() => _focusDialog('wordSheet'));
}

function closeWordWrite() { closeOverlay('word'); }

function _wordFormError(msg) {
  const el = document.getElementById('wordError');
  el.textContent = msg || '';
  el.hidden = !msg;
}

function _wordFormBusy(on) {
  const btn = document.getElementById('wordSubmit');
  btn.disabled = on;
  btn.textContent = on ? t('rsvp.sending', '보내는 중...') : t('word.send', '나누기');
}

async function _wordSubmit(e) {
  e.preventDefault();
  _wordFormError('');

  const body = document.getElementById('wordBody').value.trim();
  if (!body) { _wordFormError('묵상을 적어주세요.'); document.getElementById('wordBody').focus(); return; }

  const scope = document.querySelector('input[name="wordScope"]:checked');
  const token = _wordToken();

  _wordFormBusy(true);
  try {
    const pick = scope ? scope.value : 'team';
    const data = await _wordCall('create', {
      verse_ref: document.getElementById('wordVerse').value.trim(),
      body: body,
      display_name: document.getElementById('wordName').value.trim(),
      share_now: pick === 'now',       // 암호 없이 누구나
      share_later: pick === 'later',   // 공연 뒤에 공개
      edit_token: token
    });
    if (data.item && data.item.id) _wordMine({ [data.item.id]: token });

    document.getElementById('wordForm').hidden = true;
    document.getElementById('wordDone').hidden = false;
    requestAnimationFrame(() => document.querySelector('#wordDone .rsvp-done-close').focus());

    // 글을 비우고 목록을 새로 그린다
    document.getElementById('wordVerse').value = '';
    document.getElementById('wordBody').value = '';
    document.getElementById('wordCount').textContent = '0';
    await loadWord();
  } catch (err) {
    _wordFormError(err.status === 401 ? '암호가 바뀐 것 같아요. 창을 닫고 다시 들어와주세요.'
                                      : '보내지 못했어요. 인터넷 연결을 확인하고 다시 시도해주세요.');
    _wordFormBusy(false);
  }
}


/* ══════════════════════════════════
   4. donate.js — 후원 모달
══════════════════════════════════ */

function openDonate()  { openOverlay('donate'); }
function closeDonate() { closeOverlay('donate'); }

function copyAccount() {
  const account = document.getElementById('donateAccount').textContent;
  _copyToClipboard(account, () => {
    showToast('계좌번호가 복사되었습니다');
  });
}


/* ══════════════════════════════════
   5. share.js — 공유 바텀시트 + 공유 기능
══════════════════════════════════ */

function openShare()  { openOverlay('share'); }
function closeShare() { closeOverlay('share'); }

/* ── Now Playing 키보드 지원 ── */
document.addEventListener('DOMContentLoaded', () => {
  const np = document.getElementById('nowPlaying');
  if (np) np.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleBgmFromBar(); }
  });
});

/* ── 아래로 끌어내려 닫기 (바닥에서 올라오는 시트 공통) ──────────
   손가락을 따라 시트가 같이 내려오고, 충분히 내렸거나 빠르게 튕기면 닫힌다.
   덜 내렸으면 제자리로 돌아간다. iOS 시트와 같은 감각을 맞춘 것. */

const DRAG_SHEETS = { shareSheet: 'share', memberSheet: 'member' };
const DRAG_CLOSE_PX = 90;     // 이만큼 내리면 닫는다
const DRAG_FLICK_V  = 0.5;    // px/ms — 짧게 내려도 빠르면 닫는다

Object.keys(DRAG_SHEETS).forEach(id => {
  const sheet = document.getElementById(id);
  if (!sheet) return;

  let startY = 0, lastY = 0, startT = 0, dragging = false;

  const setY = y => { sheet.style.transform = 'translateX(-50%) translateY(' + y + 'px)'; };
  const reset = () => { sheet.style.transition = ''; sheet.style.transform = ''; };

  sheet.addEventListener('touchstart', e => {
    if (!sheet.classList.contains('open')) return;
    dragging = true;
    startY = lastY = e.touches[0].clientY;
    startT = Date.now();
    sheet.style.transition = 'none';     // 끄는 동안에는 애니메이션을 끈다
  }, { passive: true });

  sheet.addEventListener('touchmove', e => {
    if (!dragging) return;
    lastY = e.touches[0].clientY;
    const dy = lastY - startY;
    if (dy > 0) setY(dy);                // 위로는 끌리지 않게 아래로만
  }, { passive: true });

  sheet.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    const dy = lastY - startY;
    const v = dy / Math.max(1, Date.now() - startT);

    sheet.style.transition = '';
    if (dy > DRAG_CLOSE_PX || v > DRAG_FLICK_V) {
      sheet.style.transform = '';         // 닫기 애니메이션은 .open 제거가 처리
      closeOverlay(DRAG_SHEETS[id]);
    } else {
      reset();                            // 제자리로
    }
  }, { passive: true });

  sheet.addEventListener('touchcancel', () => { dragging = false; reset(); }, { passive: true });
});


/* ── 참여 신청 창: 위쪽을 쓸어내려 닫기 ──────────────────────
   창 안에 입력 칸이 많아 세로 스크롤이 생긴다. 그래서 아무 데나
   잡아 끌면 글을 읽으려던 손짓까지 닫기로 먹힌다. 손잡이를 잡았거나
   이미 맨 위까지 올라온 상태에서만 끌리게 했다.
   가운데 정렬이라 끄는 동안 transform 에 translate(-50%, -50%) 를
   유지해야 창이 좌상단으로 튀지 않는다. */
(function () {
  const modal = document.getElementById('rsvpSheet');
  if (!modal) return;
  const handle = modal.querySelector('.sheet-handle');

  let startY = 0, lastY = 0, startT = 0, dragging = false;

  const setY = y =>
    modal.style.transform = 'translate(-50%, calc(-50% + ' + y + 'px)) scale(1)';
  const reset = () => { modal.style.transition = ''; modal.style.transform = ''; };

  modal.addEventListener('touchstart', e => {
    if (!modal.classList.contains('open')) return;
    const onHandle = handle && handle.contains(e.target);
    if (!onHandle && modal.scrollTop > 0) return;   // 내용을 읽는 중이면 끌지 않는다
    dragging = true;
    startY = lastY = e.touches[0].clientY;
    startT = Date.now();
    modal.style.transition = 'none';
  }, { passive: true });

  modal.addEventListener('touchmove', e => {
    if (!dragging) return;
    lastY = e.touches[0].clientY;
    const dy = lastY - startY;
    if (dy > 0) setY(dy);                            // 아래로만
  }, { passive: true });

  modal.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    const dy = lastY - startY;
    const v = dy / Math.max(1, Date.now() - startT);

    modal.style.transition = '';
    if (dy > DRAG_CLOSE_PX || v > DRAG_FLICK_V) {
      modal.style.transform = '';
      closeRsvp();
    } else {
      reset();
    }
  }, { passive: true });

  modal.addEventListener('touchcancel', () => { dragging = false; reset(); }, { passive: true });
})();


/* ── Toast Notification ── */

let _toastTimer = null;

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

/* ── Share Actions ── */

function shareKakao() {
  closeShare();
  const shareData = {
    title: '찬양이 좋아서 모인 청년들 LIVE CONCERT 2026',
    text: '찬양 콘서트에 함께해요!',
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    _copyToClipboard(window.location.href, () => {
      showToast('링크가 복사되었습니다. 카카오톡에 붙여넣기 해주세요');
    });
  }
}

function shareInstagram() {
  closeShare();
  _copyToClipboard(window.location.href, () => {
    showToast('링크가 복사되었습니다. DM으로 공유해보세요');
  });
}

function copyLink(silent) {
  closeShare();
  _copyToClipboard(window.location.href, () => {
    if (!silent) showToast('링크가 복사되었습니다');
  });
}

/* ── Internal Clipboard Helper ── */

function _copyToClipboard(text, callback) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (callback) callback();
    }).catch(() => {
      _fallbackCopy(text, callback);
    });
  } else {
    _fallbackCopy(text, callback);
  }
}

function _fallbackCopy(text, callback) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
  ta.setAttribute('readonly', '');      // 잠깐 초점을 줘도 휴대폰 키보드가 올라오지 않게
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    if (callback) callback();
  } catch (e) {
    console.warn('클립보드 복사 실패:', e);
  }
  document.body.removeChild(ta);
}


/* 곡·사람 이름 도우미 — 이 사이트는 한국어로만 보여 준다 */
function _lyrics(part) { return part.lyrics; }
function _songTitle(song) { return song.title; }
function _partLabel(part) { return part.label; }
function _noteName(note) { return note; }
function _tagName(tag) { return tag; }
function _personName(person) { return person ? person.name : ''; }
function _roleName(role) { return role; }


/* ══════════════════════════════════
   boot — 최초 렌더 및 라우팅 시작
══════════════════════════════════ */

initMainCinema();
renderDetailGrid();
renderFinaleDate();
renderMembers();
renderSongList();
_updateLP();
_rsvpBindCount();
document.getElementById('rsvpForm').addEventListener('submit', _rsvpSubmit);
document.getElementById('wordForm').addEventListener('submit', _wordSubmit);
document.getElementById('wordLockForm').addEventListener('submit', _wordUnlock);
(function () {
  const ta = document.getElementById('wordBody');
  const out = document.getElementById('wordCount');
  ta.addEventListener('input', () => { out.textContent = ta.value.length; });
})();
updateDday();
setInterval(updateDday, 60000);
route();
