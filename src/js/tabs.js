/**
 * tabs.js
 * 하단 탭 전환 로직
 * - 탭 버튼 클릭 시 해당 페이지 표시
 * - 비활성 페이지 숨김
 * - 페이지 전환 후 스크롤 상단 이동
 * - reveal 애니메이션 재트리거
 * - story 탭 진행 바 갱신
 */
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
