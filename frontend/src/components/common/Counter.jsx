import CountUp from "react-countup";
import useInView from "../../hooks/useInView";

export default function Counter({
  end = 0,
  start = 0,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 1.2,
  threshold = 0.3,
  triggerOnce = true,
}) {
  const target = Number(end);

  const { ref, isInView } = useInView({
    threshold,
    triggerOnce,
  });

  return (
    <span ref={ref}>
      {isInView ? (
        <CountUp
          start={Number(start) || 0}
          end={Number.isFinite(target) ? target : 0}
          duration={duration}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
          separator=","
        />
      ) : (
        <>
          {prefix}
          {Number(start).toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}
          {suffix}
        </>
      )}
    </span>
  );
}