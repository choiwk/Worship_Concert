const CACHE_NAME = 'worship-concert-v3';
const ASSETS = [
  './',
  './index.html',
  './src/css/style.css',
  './src/js/app.js',
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

// 요청 가로채기: 캐시 우선, 네트워크 폴백
self.addEventListener('fetch', (e) => {
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
