/* ══════════════════════════════════════════════════════════
   i18n.js — 이 사이트는 한국어로만 보여 준다.
   (영어·크메르어 번역은 2026-10-25 에 걷어냈다. 예전 판은 git 기록에 있다)

   화면 글을 만드는 코드가 부르는 t('키', '한국어') 는 그대로 두고,
   적어 둔 한국어를 돌려준다.
══════════════════════════════════════════════════════════ */

function t(key, fallback) {
  return fallback !== undefined ? fallback : key;
}

/** 성경 전체 장 링크 — YouVersion 개역한글(88) */
function bibleUrlFor(usfm) {
  return 'https://www.bible.com/ko/bible/88/' + usfm;
}

/* 예전에 고른 언어가 브라우저에 남아 있으면 지운다 */
try { localStorage.removeItem('site-lang'); sessionStorage.removeItem('site-lang'); } catch (e) {}
