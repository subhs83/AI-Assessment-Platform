import CountUp from "react-countup";

export default function Counter({
end = 0,
start = 0,
suffix = "",
prefix = "",
decimals = 0,
duration = 1.2,
enableScrollSpy = true,
  scrollSpyOnce = true,
  scrollSpyDelay = 100,
}) {
const target = Number(end);

return (
<CountUp
start={Number(start) || 0}
end={Number.isFinite(target) ? target : 0}
duration={duration}
decimals={decimals}
prefix={prefix}
suffix={suffix}
separator=","
enableScrollSpy={enableScrollSpy}
scrollSpyOnce={scrollSpyOnce}
scrollSpyDelay={scrollSpyDelay}
/>
);
}
