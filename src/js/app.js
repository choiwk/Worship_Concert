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

const TABS = ['main', 'songs', 'artists', 'story'];

let _prevRoute = null;
let _songListScroll = 0;

function _scroller() {
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
  }

  // 곡 상세에서 목록으로 돌아온 경우에만 보던 자리를 복원하고,
  // 그 외에는 기존 동작대로 맨 위로 올린다.
  const back = prev && prev.tab === 'songs' && prev.slug && r.tab === 'songs' && !r.slug;
  const y = back ? _songListScroll : 0;

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
  const target = '#/' + name;
  if (location.hash === target) route();   // 같은 해시는 hashchange가 안 난다
  else location.hash = target;
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
  const ul = document.getElementById('songList');
  if (!ul) return;
  ul.innerHTML = '';

  SONGS.forEach(song => {
    const li = _el('li', 'song-item');

    const a = _el('a', 'song-row' + (isLeadSong(song) ? ' is-featured' : ''));
    a.href = '#/songs/' + song.slug;
    const hasVerse = song.parts.some(p => p.bible);
    a.setAttribute('aria-label',
      song.no + '번 ' + song.title + (song.tag ? ', ' + song.tag : '') +
      ' — 가사' + (hasVerse ? '와 말씀' : '') + ' 보기');

    a.appendChild(_el('span', 'song-num', song.no));

    const mid = _el('span', 'song-main');

    const head = _el('span', 'song-head-row');
    head.appendChild(_el('span', 'song-title-text', song.title));
    if (song.tag) head.appendChild(_el('span', 'song-badge tag-' + tagKind(song.tag), song.tag));
    mid.appendChild(head);

    // 안에 무엇이 들어 있는지 미리 알려준다.
    // 말씀은 12곡 중 일부에만 있어서 장식이 아니라 실제 정보가 된다.
    const meta = _el('span', 'song-meta');
    meta.appendChild(_metaTag('icon-lyrics', '가사'));
    if (song.parts.some(p => p.bible)) meta.appendChild(_metaTag('icon-verse', '말씀'));
    mid.appendChild(meta);

    a.appendChild(mid);

    const arrow = _el('span', 'song-arrow', '→');
    arrow.setAttribute('aria-hidden', 'true');
    a.appendChild(arrow);

    li.appendChild(a);
    ul.appendChild(li);
  });
}

/* 배지 종류. 곡 데이터의 tag 문자열을 여기서 한 번만 해석한다
   (예전에는 '대표곡' 비교가 세 곳에 흩어져 있어 이름을 바꾸면 빠뜨리기 쉬웠다) */
const TAG_KIND = { '주제곡': 'lead', '기도': 'pray' };
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

function renderSongDetail(slug) {
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
  back.appendChild(_el('span', 'song-back-label', '곡 리스트'));
  wrap.appendChild(back);

  /* 머리말 */
  const head = _el('header', 'song-head');
  head.appendChild(_el('p', 'song-head-num', song.no));
  const h1 = _el('h1', 'song-head-title', song.title);
  head.appendChild(h1);
  if (song.artist) head.appendChild(_el('p', 'song-head-artist', song.artist));
  if (song.tag) {
    head.appendChild(_el('span', 'song-badge tag-' + tagKind(song.tag), song.tag));
  }
  if (song.tag === '기도') {
    head.appendChild(_el('p', 'song-head-note', '기도하며 함께 드리는 곡입니다'));
  }
  wrap.appendChild(head);

  /* 유튜브 — 제목 바로 아래, 가사 시작 전 */
  if (song.youtube) {
    const yt = _extLink(song.youtube, 'YouTube에서 듣기', 'song-yt', song.title + ' 유튜브에서 듣기');
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('width', '16'); icon.setAttribute('height', '16');
    icon.setAttribute('fill', 'white'); icon.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#icon-yt');
    icon.appendChild(use);
    yt.insertBefore(icon, yt.firstChild);
    wrap.appendChild(yt);
  }

  /* 가사 + 말씀 (한 곡에 두 곡이 이어지면 파트마다 반복) */
  song.parts.forEach((part, i) => {
    const sec = _el('section', 'song-part');

    if (part.label) sec.appendChild(_el('h2', 'song-part-label', part.label));
    else if (i === 0) sec.appendChild(_el('h2', 'song-part-label sr-only', '가사'));

    sec.appendChild(_el('p', 'song-lyrics', part.lyrics));

    if (part.bible) {
      const word = _el('aside', 'song-word');
      word.appendChild(_el('p', 'song-word-label', '이 곡과 함께 묵상할 말씀'));
      word.appendChild(_el('p', 'song-word-ref', part.bible.ref));

      const btn = _el('button', 'song-word-link', '말씀 보기');
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
    a.setAttribute('aria-label', dir + ': ' + target.no + '번 ' + target.title);
    a.appendChild(_el('span', 'song-nav-dir', cls === 'prev' ? '← 이전 곡' : '다음 곡 →'));
    a.appendChild(_el('span', 'song-nav-title', target.title));
    return a;
  };
  if (idx > 0) links.appendChild(make(SONGS[idx - 1], '이전 곡', 'prev'));
  if (idx < SONGS.length - 1) links.appendChild(make(SONGS[idx + 1], '다음 곡', 'next'));
  nav.appendChild(links);
  wrap.appendChild(nav);

  return true;
}

function updateStoryProgress() {
  const prog = document.getElementById('storyProg');
  const storyPage = document.getElementById('page-story');
  if (!prog || !storyPage) return;

  if (!storyPage.classList.contains('active')) {
    prog.style.width = '0%';
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

  const tryPlay = () => {
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
    video.play().catch(() => {});
    _tryStartBgm();
  };
  document.addEventListener('touchstart', onFirstTouch, { once: true });
  document.addEventListener('click', () => { _tryStartBgm(); }, { once: true });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      video.play().catch(() => {});
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

const CONCERT = {
  // 날짜 확정 완료
  confirmed: true,
  dates: [
    { iso: '2026-12-19', short: '2026. 12. 19.', ko: '2026년 12월 19일', dow: '토요일' }
  ],
  time: {
    text: '오후 8:00 ~ 9:30',
    startUTC: 'T110000Z',   // KST 20:00
    endUTC:   'T123000Z'    // KST 21:30
  },
  // 장소는 아직 두 곳 중 하나로 정해지는 중.
  // 확정되면 venues 를 하나만 남기고 venueConfirmed 를 true 로 바꾸면 된다.
  venueConfirmed: false,
  venues: [
    { name: '향상교회 3층', address: '기흥구 언동로 140' },
    { name: '은혜샘물교회 6층 체육관' }
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

  card('날짜', c => {
    CONCERT.dates.forEach((d, i) => {
      const v = _el('p', 'card-value');
      if (i > 0) v.appendChild(_el('span', 'card-note', '또는 '));
      v.appendChild(_el('span', 'card-strong', d.ko + ' ' + d.dow));
      c.appendChild(v);
    });
    if (!CONCERT.confirmed) c.appendChild(_el('p', 'card-note card-note-block', '두 날짜 중 하나로 확정될 예정이에요'));
  }, 'is-date');

  card('시간', c => {
    const v = _el('p', 'card-value');
    v.appendChild(_el('span', 'card-strong', CONCERT.time.text));
    c.appendChild(v);
  });

  card('장소', c => {
    CONCERT.venues.forEach((place, i) => {
      const v = _el('p', 'card-value');
      if (i > 0) v.appendChild(_el('span', 'card-note', '또는 '));
      v.appendChild(_el('span', 'card-strong venue-highlight', place.name));
      c.appendChild(v);
      if (place.address) c.appendChild(_el('p', 'card-value card-sub', place.address));
    });
    if (!CONCERT.venueConfirmed) {
      c.appendChild(_el('p', 'card-note card-note-block', '두 장소 중 하나로 확정될 예정이에요'));
    }
  }, 'full-width');
}

/* ── 멤버 소개 (src/js/members.js 데이터로 렌더) ── */

function renderMembers() {
  const wrap = document.getElementById('memberList');
  if (!wrap || typeof MEMBERS === 'undefined') return;
  wrap.innerHTML = '';

  MEMBERS.forEach((section, gi) => {
    const block = _el('div', 'artist-section-block');
    block.appendChild(_el('h3', 'artist-group-label', section.group));

    const grid = _el('div', 'artist-grid');
    section.people.forEach((person, pi) => {
      // 인스타 주소가 있으면 카드를 눌러 아래에서 올라오는 시트를 연다
      const linked = !!person.instagram;
      const card = _el(linked ? 'button' : 'div', 'artist-card reveal' + (linked ? ' is-linked' : ''));
      if (linked) {
        card.type = 'button';
        card.setAttribute('aria-haspopup', 'dialog');
        card.setAttribute('aria-label',
          person.name + (person.role ? ' ' + person.role : '') + ' 인스타그램 보기');
        card.onclick = () => openMember(gi, pi);
      }

      const avatar = _el('div', 'artist-avatar');
      if (person.photo) {
        const img = _el('img');
        img.src = person.photo;
        img.alt = '';                 // 이름이 바로 아래 있으므로 중복 읽기 방지
        img.loading = 'lazy';
        img.decoding = 'async';
        // 사진을 못 불러오면 조용히 기호로 되돌린다
        img.onerror = () => { img.remove(); avatar.appendChild(_avatarIcon(person)); };
        avatar.appendChild(img);
      } else {
        avatar.appendChild(_avatarIcon(person));
      }

      if (linked) {
        const badge = _el('span', 'artist-ig');
        badge.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-ig"/></svg>';
        avatar.appendChild(badge);
      }
      card.appendChild(avatar);

      card.appendChild(_el('p', 'artist-card-name', person.name));
      if (person.role) card.appendChild(_el('p', 'artist-card-role', person.role));

      grid.appendChild(card);
    });

    block.appendChild(grid);
    wrap.appendChild(block);
  });
}

/** 멤버 카드를 누르면 아래에서 올라오는 시트 */
function openMember(groupIndex, personIndex) {
  const section = MEMBERS[groupIndex];
  const person = section && section.people[personIndex];
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

  document.getElementById('memberName').textContent = person.name;
  const role = document.getElementById('memberRole');
  role.textContent = person.role || section.group;

  // 한마디 — 없으면 영역째 감춘다
  document.getElementById('memberBio').textContent = person.bio || '';
  document.getElementById('memberSay').hidden = !person.bio;

  // 좋아하는 말씀 — 본문과 출처가 모두 있어야 보여준다
  const verse = person.verse;
  const verseBox = document.getElementById('memberVerse');
  const hasVerse = !!(verse && verse.text);
  verseBox.hidden = !hasVerse;
  if (hasVerse) {
    document.getElementById('memberVerseText').textContent = verse.text;
    const refEl = document.getElementById('memberVerseRef');
    refEl.textContent = verse.ref || '';
    refEl.hidden = !verse.ref;
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
  // 인스타는 브랜드 마크 그대로 — 그라데이션 사각형 위에 흰 글리프
  const igIcon = () => {
    const box = _el('span', 'member-meta-icon member-meta-ig');
    box.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-ig"/></svg>';
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
  el.textContent = CONCERT.dates.map(d => d.short).join(' 또는 ') + '\n' +
                   CONCERT.venues.map(v => v.name).join(' 또는 ');
}


/* ══════════════════════════════════
   5. dday.js — D-Day 카운트다운 + 캘린더
══════════════════════════════════ */

function updateDday() {
  const el = document.getElementById('ddayCounter');
  if (!el) return;

  const base = concertBaseDate();
  const target = new Date(base.iso + 'T20:00:00+09:00');
  const diff = target - new Date();

  if (diff <= 0) {
    el.textContent = 'TODAY';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  // 확정 전이므로 어느 날짜 기준인지 밝혀 준다
  el.textContent = CONCERT.confirmed
    ? 'D-' + days
    : 'D-' + days + ' (' + base.ko.replace(/^\d+년 /, '') + ' 기준)';
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
  member: { backdrop: 'memberBackdrop', panel: 'memberSheet'  }
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
  const items = [...panel.querySelectorAll('button, a[href]')]
    .filter(el => el.offsetParent !== null && !el.hidden);
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
  full.href = bible.url;
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
  name.textContent  = song.title;
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
    yt.setAttribute('aria-label', song.title + ' YouTube에서 듣기 (새 탭에서 열림)');
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


/* ══════════════════════════════════
   boot — 최초 렌더 및 라우팅 시작
══════════════════════════════════ */

renderDetailGrid();
renderFinaleDate();
renderMembers();
renderSongList();
_updateLP();
updateDday();
setInterval(updateDday, 60000);
route();
