import { motion } from "framer-motion";

export default function FloatingBlobs() {
  return (
    <>
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="
        absolute
        -top-20
        -left-20
        h-72
        w-72
        rounded-full
        bg-blue-300/20
        blur-3xl"
      />

      <motion.div
        animate={{
          y: [0, 40, 0],
          x: [0, -20, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="
        absolute
        top-40
        -right-20
        h-80
        w-80
        rounded-full
        bg-purple-300/20
        blur-3xl"
      />

      <motion.div
        animate={{
          y: [0, -20, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="
        absolute
        bottom-0
        left-1/3
        h-64
        w-64
        rounded-full
        bg-indigo-300/20
        blur-3xl"
      />
    </>
  );
}