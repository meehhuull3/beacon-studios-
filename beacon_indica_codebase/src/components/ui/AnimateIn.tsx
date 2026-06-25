import React from "react";
import { motion } from "framer-motion";

interface AnimateInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  scale?: number;
  id?: string;
}

export function AnimateIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.65,
  scale = 1,
}: AnimateInProps) {
  const getInitialOffset = () => {
    switch (direction) {
      case "up":
        return { y: 32 };
      case "down":
        return { y: -32 };
      case "left":
        return { x: 32 };
      case "right":
        return { x: -32 };
      case "none":
      default:
        return {};
    }
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: scale, ...getInitialOffset() }}
      whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // premium custom cubic-bezier ease-out
      }}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
