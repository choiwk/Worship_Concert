const CACHE_NAME = 'worship-concert-v11';
const ASSETS = [
  './',
  './index.html',
  './src/css/style.css?v=11',
  './src/js/app.js?v=11',
  './src/js/songs.js?v=11',
  './manifest.json',
  './public/fonts/Sarang-site.woff2',
  './public/audio/bgm.mp3',
  './public/videos/MainWorship.mp4',
  './public/images/story-01.jpg',
  './public/images/story-02.jpg',
  './public/images/story-03.jpg',
  './public/images/story-04.jpg',
  './public/images/story-05.jpg',
  './public/images/story-06.jpg',
  './public/images/story-07.jpg',
  './public/images/story-08.jpg',
  './public/images/story-09-0.JPG',
  './public/images/story-09-1.JPG',
  './public/images/story-09-2.JPG',
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
