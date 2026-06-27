import { useEffect, useState } from "react";
import Confetti from "react-confetti";

export default function ResultConfetti({
  show,
  duration = 3000,
}) {
  const [isRunning, setIsRunning] = useState(show);

  useEffect(() => {
    if (!show) return;

    setIsRunning(true);

    const timer = setTimeout(() => {
      setIsRunning(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [show, duration]);

  if (!isRunning) return null;

  return (
    <Confetti
      recycle={false}
      numberOfPieces={800}
      gravity={0.22}
      initialVelocityY={18}
      tweenDuration={6000}
    />
  );
}