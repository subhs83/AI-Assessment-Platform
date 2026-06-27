import { motion } from "framer-motion";

export default function StaggerContainer({ children }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{
        once: false,
        amount: 0.12
      }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.2
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}