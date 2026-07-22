const GA_MEASUREMENT_ID = "G-LNJM8MSJZT";


export const trackEvent = (
  eventName,
  eventParams = {}
) => {

  if (
    typeof window !== "undefined" &&
    window.gtag
  ) {

    window.gtag(
      "event",
      eventName,
      eventParams
    );

  }

};


export const trackPageView = (url) => {

  if (
    typeof window !== "undefined" &&
    window.gtag
  ) {

    window.gtag(
      "config",
      GA_MEASUREMENT_ID,
      {
        page_path: url,
      }
    );

  }

};