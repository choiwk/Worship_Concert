/**
 * reveal.js
 * 스크롤 시 요소 Fade-up 애니메이션
 * - IntersectionObserver로 뷰포트 진입 감지
 * - .reveal 클래스 요소에 .visible 추가
 * - 탭 전환 시 새 페이지에 재적용 가능
 */

/**
 * 현재 활성 페이지의 미노출 .reveal 요소를 모두 관찰 시작
 * tabs.js의 switchTab() 호출 후 실행됨
 */
function triggerReveal() {
  const els = document.querySelectorAll('.page.active .reveal:not(.visible)');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10 });

  els.forEach(el => observer.observe(el));
}

// 첫 페이지 로드 시 즉시 실행
triggerReveal();

// ── 모바일 자동재생 강제 실행 ──────────────────
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