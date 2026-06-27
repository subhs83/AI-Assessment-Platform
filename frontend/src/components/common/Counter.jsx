import CountUp from "react-countup";

export default function Counter({
  end = 0,
  start = 0,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 1.2,
  enableScrollSpy = false,
  scrollSpyOnce = true,
}) {
  return (
    <CountUp
      start={start}
      end={Number(end) || 0}
      duration={duration}
      decimals={decimals}
      prefix={prefix}
      suffix={suffix}
      separator=","
      enableScrollSpy={enableScrollSpy}
      scrollSpyOnce={scrollSpyOnce}
    />
  );
}