/**
 * tabs.js
 * 하단 탭 전환 로직
 * - 탭 버튼 클릭 시 해당 페이지 표시
 * - 비활성 페이지 숨김
 * - 페이지 전환 후 스크롤 상단 이동
 * - reveal 애니메이션 재트리거
 */

/**
 * 탭 전환 함수
 * @param {string} name   - 전환할 페이지 ID 접미사 ('main' | 'songs' | 'artists')
 * @param {HTMLElement} btn - 클릭된 탭 버튼 요소
 */
function switchTab(name, btn) {
  // 모든 페이지 비활성화
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // 모든 탭 버튼 비활성화
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  // 선택된 페이지 & 버튼 활성화
  document.getElementById('page-' + name).classList.add('active');
  btn.classList.add('active');

  // 스크롤 최상단 이동
  window.scrollTo({ top: 0, behavior: 'instant' });

  // 새 페이지의 reveal 요소 관찰 시작
  triggerReveal();
}
