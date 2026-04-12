/* ══════════════════════════════════════════════════════════
   app.js — 통합 스크립트
   순서: tabs → reveal → share
══════════════════════════════════════════════════════════ */


/* ══════════════════════════════════
   1. tabs.js — 하단 탭 전환 로직
══════════════════════════════════ */

function switchTab(name, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  const page = document.getElementById('page-' + name);
  if (page) {
    page.classList.add('active');
  }
  if (btn) {
    btn.classList.add('active');
  }

  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  triggerReveal();
  updateStoryProgress();
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

  const onFirstTouch = () => {
    video.play().catch(() => {});
    document.removeEventListener('touchstart', onFirstTouch);
  };
  document.addEventListener('touchstart', onFirstTouch, { once: true });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      video.play().catch(() => {});
    }
  });
})();


/* ══════════════════════════════════
   3. share.js — 공유 바텀시트 + 공유 기능
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
  const url = encodeURIComponent(window.location.href);
  window.open('kakaotalk://msg/send?text=' + url, '_blank');
  showToast('카카오톡으로 공유합니다');
}

function shareInstagram() {
  closeShare();

  if (navigator.share) {
    navigator.share({
      title: '찬양이 좋아서 모인 청년들 LIVE CONCERT 2026',
      text: '2026.11.21 찬양 콘서트 — 함께해요!',
      url: window.location.href
    }).catch(() => {});
  } else {
    _copyToClipboard(window.location.href);
    showToast('링크를 복사했습니다. Instagram DM에 붙여넣기 해주세요 ✉️');
  }
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
