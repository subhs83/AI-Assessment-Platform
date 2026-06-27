import { motion } from "framer-motion";

export default function Reveal({
  children,
  delay = 0,
  y = 30
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y
      }}
      whileInView={{
        opacity: 1,
        y: 0
      }}
      viewport={{
        once: true,
        amount: 0.2
      }}
      transition={{
        duration: 0.6,
        delay
      }}
    >
      {children}
    </motion.div>
  );
}