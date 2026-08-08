export const SPRING_CONFIG = {
  type: "spring",
  stiffness: 300,
  damping: 25,
  mass: 1,
};

export const SPRING_CONFIG_QUICK = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

export const TAP_ANIMATION = {
  scale: 0.97,
};

export const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15, scale: 0.98 },
  transition: SPRING_CONFIG,
};
