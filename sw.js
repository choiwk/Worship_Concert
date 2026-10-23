const CACHE_NAME = 'worship-concert-v79';
/* 영상(43MB)과 음원(2.3MB)은 여기 넣지 않는다.
   선캐시에 넣으면 첫 방문에 45MB 를 내려받고서야 설치가 끝난다.
   아래 fetch 처리가 cache-first + 런타임 캐시라, 실제로 재생할 때 캐시된다. */
const ASSETS = [
  './',
  './index.html',
  './src/css/style.css?v=79',
  './src/js/app.js?v=79',
  './src/js/i18n.js?v=79',
  './src/js/bible.js?v=79',
  './src/js/songs.js?v=79',
  './src/js/members.js?v=79',
  './manifest.json',
  './public/fonts/Sarang-site.woff2?v=79',
  './public/images/members/choi-wonkeun.jpg',
  './public/images/story-01.jpg',
  './public/images/story-02.jpg',
  './public/images/story-03.jpg',
  './public/images/story-04.jpg',
  './public/images/story-05.jpg',
  './public/images/story-06.jpg',
  './public/images/story-07.jpg',
  './public/images/story-08.jpg',
  './public/images/story-09-0.JPG?v=79',
  './public/images/story-09-1.JPG?v=79',
  './public/images/story-09-2.JPG?v=79',
  './public/images/story-10.jpg',
  './public/images/story-11.jpg',
  './public/images/story-12.jpg',
  './public/images/story-13.jpg'
];

// 설치: 에셋 캐싱
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 활성화: 이전 캐시 삭제
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 요청 가로채기
//  · HTML: 네트워크 우선 — 새 배포의 ?v= 버전을 즉시 알아야 하므로
//  · 나머지: 캐시 우선 (URL에 ?v= 가 붙어 있어 갱신 시 키가 바뀐다)
self.addEventListener('fetch', (e) => {
  // GET 이 아니거나 바깥 도메인으로 나가는 요청은 손대지 않는다.
  // 참여 신청 POST 가 캐시에 잡히면 두 번째 신청부터 서버에 닿지 않는다.
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;

  const isHTML = e.request.mode === 'navigate' ||
                 (e.request.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      });
    }).catch(() => caches.match('./index.html'))
  );
});
