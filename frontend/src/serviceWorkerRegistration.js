const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
  window.location.hostname === "[::1]" ||
  window.location.hostname.match(
    /^127(?:\.\d+){0,2}\.\d+$/
  )
);

export function register(config) {

  if (
    process.env.NODE_ENV === "production" &&
    "serviceWorker" in navigator
  ) {

    window.addEventListener(
      "load",
      () => {

        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

        if (isLocalhost) {

          checkValidServiceWorker(
            swUrl,
            config
          );

          navigator.serviceWorker.ready.then(() => {
            console.log(
              "Service worker ready"
            );
          });

        } else {

          registerValidSW(
            swUrl,
            config
          );

        }

      }
    );

  }

}



export function unregister() {

  if ("serviceWorker" in navigator) {

    navigator.serviceWorker.ready
      .then((registration) => {

        registration.unregister();

      })
      .catch((error) => {

        console.error(
          "Service worker unregister failed:",
          error
        );

      });

  }

}




function registerValidSW(
  swUrl,
  config
) {

  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {

      console.log(
        "Service worker registered",
        registration
      );


      if (registration.waiting) {

        config?.onUpdate?.(
          registration
        );

      }


    })
    .catch((error) => {

      console.error(
        "Service worker registration failed:",
        error
      );

    });

}


function checkValidServiceWorker(
  swUrl,
  config
) {

  fetch(swUrl, {
    headers: {
      "Service-Worker": "script",
    },
  })
    .then((response) => {

      const contentType =
        response.headers.get(
          "content-type"
        );


      if (
        response.status === 404 ||
        (
          contentType &&
          !contentType.includes(
            "javascript"
          )
        )
      ) {

        navigator.serviceWorker.ready.then(
          (registration) => {

            registration.unregister()
              .then(() => {

                window.location.reload();

              });

          }
        );

      } else {

        registerValidSW(
          swUrl,
          config
        );

      }

    })
    .catch(() => {

      console.log(
        "No internet connection. App running without service worker update."
      );

    });

}