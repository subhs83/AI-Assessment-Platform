import { motion } from "framer-motion";

export default function StaggerContainer({ children }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{
        once: false,
        amount: 0.1
      }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.14
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}