import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const badgeVariantStyles: Record<BadgeVariant, string> = {
  default: "border-transparent bg-cyan-500 text-black shadow font-bold",
  secondary: "border-neutral-700 bg-neutral-800 text-neutral-200",
  destructive: "border-red-500/30 bg-red-500/10 text-red-400 font-bold",
  outline: "border-neutral-800 text-neutral-300 bg-neutral-900/40",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        badgeVariantStyles[variant] || badgeVariantStyles.default,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
