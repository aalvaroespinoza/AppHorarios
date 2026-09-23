import type { Transition } from "framer-motion";

export const SPRING_CONFIG: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
  mass: 1,
};

export const SPRING_CONFIG_QUICK: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

// A short, weighted spring gives changes a deliberate frame-to-frame flow
// without making the schedule feel theatrical.
export const HYPERFRAME_SPRING: Transition = {
  type: "spring",
  stiffness: 360,
  damping: 30,
  mass: 0.7,
};

export const TAP_ANIMATION = {
  scale: 0.97,
};

export const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 12, scale: 0.992 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.992 },
  transition: HYPERFRAME_SPRING,
};
