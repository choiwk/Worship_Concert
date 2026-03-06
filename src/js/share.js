/**
 * share.js
 * 공유 바텀시트 제어 + 공유 기능 구현
 *
 * 구성:
 * - openShare()      : 바텀시트 열기
 * - closeShare()     : 바텀시트 닫기
 * - shareKakao()     : 카카오톡 공유
 * - shareInstagram() : 인스타그램 DM 공유
 * - copyLink()       : URL 클립보드 복사
 * - showToast()      : 하단 토스트 메시지 표시
 * - 스와이프 다운 닫기 (touchstart / touchend)
 */

/* ── Open / Close ── */

function openShare() {
  document.getElementById('modalBackdrop').classList.add('open');
  document.getElementById('shareSheet').classList.add('open');
  document.body.style.overflow = 'hidden';  // 배경 스크롤 잠금
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
    if (dy > 60) closeShare();  // 60px 이상 아래로 스와이프하면 닫기
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

/**
 * 카카오톡 공유
 * 실제 배포 시: Kakao SDK를 index.html에 추가하고
 * Kakao.Share.sendDefault({...}) 방식으로 교체할 것
 */
function shareKakao() {
  closeShare();
  const url = encodeURIComponent(window.location.href);
  // 카카오 앱 딥링크 (앱 설치 시 동작)
  window.open('kakaotalk://msg/send?text=' + url, '_blank');
  showToast('카카오톡으로 공유합니다');
}

/**
 * 인스타그램 DM 공유
 * Instagram은 웹에서 DM 직접 공유를 제한하므로
 * Web Share API → 시스템 공유 시트 → Instagram 선택
 * 미지원 브라우저는 링크 복사로 fallback
 */
function shareInstagram() {
  closeShare();

  if (navigator.share) {
    navigator.share({
      title: '찬양이 좋아서 모인 청년들 LIVE CONCERT 2026',
      text: '2026.11.21 찬양 콘서트 — 함께해요!',
      url: window.location.href
    }).catch(() => {
      // 사용자가 취소한 경우 무시
    });
  } else {
    // fallback: 링크 복사 후 안내
    _copyToClipboard(window.location.href);
    showToast('링크를 복사했습니다. Instagram DM에 붙여넣기 해주세요 ✉️');
  }
}

/**
 * URL 링크 복사
 * @param {boolean} [silent=false] - true이면 sheet를 닫지 않고 toast만 표시하지 않음
 */
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
