import { useEffect, useRef, useState } from "react";

export default function useInView({
  threshold = 0.3,
  triggerOnce = true,
  root = null,
  rootMargin = "0px",
} = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);

          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => observer.unobserve(element);;
  }, [threshold, triggerOnce, root, rootMargin]);

  return { ref, isInView };
}