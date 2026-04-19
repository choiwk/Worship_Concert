/* ══════════════════════════════════════════════════════════
   app.js — 통합 스크립트
   순서: tabs → reveal → share
══════════════════════════════════════════════════════════ */


/* ══════════════════════════════════
   1. tabs.js — 하단 탭 전환 로직
══════════════════════════════════ */

function switchTab(name, btn) {
  // ① scroll-behavior: smooth 를 일시적으로 비활성화
  //    → smooth가 켜져 있으면 scrollTo(0,0)이 애니메이션되어 효과 없음
  document.documentElement.style.scrollBehavior = 'auto';
  document.body.style.scrollBehavior = 'auto';

  // ② 탭 / 페이지 클래스 전환
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');
  if (btn)  btn.classList.add('active');

  // ③ 즉시(instant) 스크롤 리셋 — 크로스 브라우저 3중 보장
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  // ④ 다음 프레임에서 reveal 트리거 + scroll-behavior 복원
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.style.scrollBehavior = '';
    document.body.style.scrollBehavior = '';
    triggerReveal();
    updateStoryProgress();
  });
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
   4. lp-player.js — LP 플레이어 곡 전환
══════════════════════════════════ */

const _lpTracks = [
  { num: '01', name: '주를 찾는 모든 자들이', url: 'https://www.youtube.com/results?search_query=주를+찾는+모든+자들이', color: '#c47a6e' },
  { num: '02', name: '친구야', url: 'https://www.youtube.com/results?search_query=친구야+찬양', color: '#7a9e8e' },
  { num: '03', name: '주를 바라보며', url: 'https://www.youtube.com/results?search_query=주를+바라보며+찬양', color: '#8e8aab' },
  { num: '04', name: '모든 생명들아 소리쳐', url: 'https://www.youtube.com/results?search_query=모든+생명들아+소리쳐', color: '#c4a06e' },
  { num: '05', name: '그리운 예루살렘', url: 'https://www.youtube.com/results?search_query=그리운+예루살렘+찬양', color: '#6e9ab5' },
  { num: '06', name: '아름다운 나라', url: 'https://www.youtube.com/results?search_query=아름다운+나라+찬양', color: '#b07e8e' },
  { num: '07', name: '아버지의 사랑으로', url: 'https://www.youtube.com/results?search_query=다시+밤은+없겠고', color: '#8aaa7e' },
  { num: '08', name: '함께 지어져가네', url: 'https://www.youtube.com/results?search_query=함께+지어져가네', color: '#a08a6e' },
  { num: '09', name: '어둔날 다 지나고', url: 'https://www.youtube.com/results?search_query=어둔날+다+지나고+찬양', color: '#7e8ea5' },
  { num: '10', name: '우린 물러서지 않으리', url: 'https://www.youtube.com/results?search_query=우린+물러서지+않으리', color: '#b5806e' }
];
let _lpIndex = 0;

function _updateLP() {
  const t = _lpTracks[_lpIndex];
  document.getElementById('lpLabel').textContent = t.num;
  document.getElementById('lpTrackName').textContent = t.name;
  document.getElementById('lpTrackCount').textContent = (_lpIndex + 1) + ' / ' + _lpTracks.length;
  document.getElementById('lpYtLink').href = t.url;
  // LP 라벨 + YouTube 버튼 색상 변경
  document.getElementById('lpDisc').style.setProperty('--lp-label-color', t.color);
  document.getElementById('lpYtLink').style.background = t.color;
}

function lpNext() {
  _lpIndex = (_lpIndex + 1) % _lpTracks.length;
  _updateLP();
}

function lpPrev() {
  _lpIndex = (_lpIndex - 1 + _lpTracks.length) % _lpTracks.length;
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
    if (!silent) showToast('링크가 복사되었습니다 ✓');
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