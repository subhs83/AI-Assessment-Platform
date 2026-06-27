import { motion } from "framer-motion";

export default function StaggerItem({ children }) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 60
        },
        show: {
          opacity: 1,
          y: 0
        }
      }}
      transition={{
        duration: 0.8
      }}
    >
      {children}
    </motion.div>
  );
}