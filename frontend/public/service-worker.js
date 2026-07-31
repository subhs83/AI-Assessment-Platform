/* eslint-disable no-restricted-globals */

/* IndiaEduCore Service Worker */

const CACHE_NAME = "indiaeducore-static-v2";

const STATIC_ASSETS = [
  "/icons/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png"
];


// Install
self.addEventListener(
  "install",
  (event) => {

    event.waitUntil(

      caches.open(CACHE_NAME)
        .then((cache) => {

          return cache.addAll(
            STATIC_ASSETS
          );

        })

    );

    self.skipWaiting();

  }
);


// Activate
self.addEventListener(
  "activate",
  (event) => {

    event.waitUntil(

      caches.keys()
        .then((cacheNames) => {

          return Promise.all(

            cacheNames
              .filter(
                (cacheName) =>
                  cacheName !== CACHE_NAME
              )
              .map(
                (cacheName) =>
                  caches.delete(cacheName)
              )

          );

        })

    );

    self.clients.claim();

  }
);


// Fetch
self.addEventListener(
  "fetch",
  (event) => {

    const request =
      event.request;


    // Only handle GET requests
    if (
      request.method !== "GET"
    ) {
      return;
    }


    event.respondWith(

      caches.match(request)
        .then(
          (cachedResponse) => {

            if (cachedResponse) {

              return cachedResponse;

            }


            return fetch(request);

          }
        )

    );

  }
);