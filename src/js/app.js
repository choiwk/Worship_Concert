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

  const sc = _scroller();
  sc.scrollTop = y;
  requestAnimationFrame(() => {
    sc.scrollTop = y;
    requestAnimationFrame(() => {
      sc.scrollTop = y;
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

    const a = _el('a', 'song-row' + (song.tag === '대표곡' ? ' is-featured' : ''));
    a.href = '#/songs/' + song.slug;
    a.setAttribute('aria-label',
      song.no + '번 ' + song.title + (song.tag ? ', ' + song.tag : '') + ' — 가사와 말씀 보기');

    a.appendChild(_el('span', 'song-num', song.no));

    const mid = _el('span', 'song-main');
    mid.appendChild(_el('span', 'song-title-text', song.title));
    if (song.tag) mid.appendChild(_el('span', 'song-badge tag-' + (song.tag === '대표곡' ? 'lead' : 'pray'), song.tag));
    a.appendChild(mid);

    const arrow = _el('span', 'song-arrow', '→');
    arrow.setAttribute('aria-hidden', 'true');
    a.appendChild(arrow);

    li.appendChild(a);
    ul.appendChild(li);
  });
}

/* ── 곡 상세 ───────────────────────────────────────────── */

function renderSongDetail(slug) {
  const wrap = document.getElementById('songDetail');
  const song = findSong(slug);
  if (!wrap || !song) return false;

  const idx = SONGS.indexOf(song);
  wrap.innerHTML = '';
  wrap.className = song.tag === '기도' ? 'is-prayer' : '';

  /* 목록으로 돌아가기 */
  const back = _el('a', 'song-back');
  back.href = '#/songs';
  back.appendChild(_el('span', null, '← 곡 리스트'));
  wrap.appendChild(back);

  /* 머리말 */
  const head = _el('header', 'song-head');
  head.appendChild(_el('p', 'song-head-num', song.no));
  const h1 = _el('h1', 'song-head-title', song.title);
  head.appendChild(h1);
  if (song.artist) head.appendChild(_el('p', 'song-head-artist', song.artist));
  if (song.tag) {
    head.appendChild(_el('span', 'song-badge tag-' + (song.tag === '대표곡' ? 'lead' : 'pray'), song.tag));
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
      word.appendChild(_extLink(part.bible.url, '말씀 보기', 'song-word-link',
                                part.bible.ref + ' 본문 보기'));
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
   3. dday.js — D-Day 카운트다운 + 캘린더
══════════════════════════════════ */

// 콘서트 날짜 (확정 후 여기만 수정)
const CONCERT_DATE = new Date('2026-11-21T20:00:00+09:00');

function updateDday() {
  const el = document.getElementById('ddayCounter');
  if (!el) return;
  const now = new Date();
  const diff = CONCERT_DATE - now;

  if (diff <= 0) {
    el.textContent = 'TODAY';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  el.textContent = 'D-' + days;
}

updateDday();
setInterval(updateDday, 60000);

function addToCalendar() {
  const title = '찬양이 좋아서 모인 청년들 LIVE CONCERT';
  const start = '20261121T110000Z'; // UTC (KST 20:00)
  const end = '20261121T124000Z';   // UTC (KST 21:40)
  const location = '향상교회 3층, 기흥구 언동로 140';
  const details = '찬양이 좋아서 모인 청년들 LIVE CONCERT 2026';

  const gcalUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent(title)
    + '&dates=' + start + '/' + end
    + '&location=' + encodeURIComponent(location)
    + '&details=' + encodeURIComponent(details);

  window.open(gcalUrl, '_blank');
}


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

function openDonate() {
  document.getElementById('donateBackdrop').classList.add('open');
  document.getElementById('donateModal').classList.add('open');
}

function closeDonate() {
  document.getElementById('donateBackdrop').classList.remove('open');
  document.getElementById('donateModal').classList.remove('open');
}

function copyAccount() {
  const account = document.getElementById('donateAccount').textContent;
  _copyToClipboard(account, () => {
    showToast('계좌번호가 복사되었습니다');
  });
}


/* ══════════════════════════════════
   5. share.js — 공유 바텀시트 + 공유 기능
══════════════════════════════════ */

function openShare() {
  document.getElementById('modalBackdrop').classList.add('open');
  document.getElementById('shareSheet').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeShare() {
  document.getElementById('modalBackdrop').classList.remove('open');
  document.getElementById('shareSheet').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── ESC 키로 모달 닫기 ── */

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (document.getElementById('shareSheet').classList.contains('open')) closeShare();
    if (document.getElementById('donateModal').classList.contains('open')) closeDonate();
  }
});

/* ── Now Playing 키보드 지원 ── */
document.addEventListener('DOMContentLoaded', () => {
  const np = document.getElementById('nowPlaying');
  if (np) np.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleBgmFromBar(); }
  });
});

/* ── Swipe Down to Close ── */

let _touchStartY = 0;

document.addEventListener('DOMContentLoaded', () => {
  const sheet = document.getElementById('shareSheet');

  sheet.addEventListener('touchstart', e => {
    _touchStartY = e.touches[0].clientY;
  }, { passive: true });

  sheet.addEventListener('touchend', e => {
    const dy = e.changedTouches[0].clientY - _touchStartY;
    if (dy > 60) closeShare();
  }, { passive: true });
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

renderSongList();
_updateLP();
route();
