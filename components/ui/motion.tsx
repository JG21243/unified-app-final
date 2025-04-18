"use client"

import { motion } from "framer-motion"

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const FadeIn = ({ children, ...props }: any) => (
  <motion.div initial="hidden" animate="visible" exit="exit" variants={fadeIn} {...props}>
    {children}
  </motion.div>
)

export const SlideUp = ({ children, ...props }: any) => (
  <motion.div initial="hidden" animate="visible" exit="exit" variants={slideUp} {...props}>
    {children}
  </motion.div>
)

export const SlideIn = ({ children, ...props }: any) => (
  <motion.div initial="hidden" animate="visible" exit="exit" variants={slideIn} {...props}>
    {children}
  </motion.div>
)

export const StaggerContainer = ({ children, ...props }: any) => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer} {...props}>
    {children}
  </motion.div>
)

export const StaggerItem = ({ children, ...props }: any) => (
  <motion.div variants={fadeIn} {...props}>
    {children}
  </motion.div>
)

