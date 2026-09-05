import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

const badgeVariantStyles: Record<BadgeVariant, string> = {
  default: "border-safety-orange/50 bg-safety-orange/15 text-safety-orange",
  secondary: "border-zinc-700 bg-zinc-800 text-zinc-200",
  destructive: "border-red-500/40 bg-red-500/10 text-red-400",
  outline: "border-zinc-800 text-zinc-400 bg-zinc-950/60",
  success: "border-acid-green/50 bg-acid-green/15 text-acid-green",
  warning: "border-amber-500/50 bg-amber-500/15 text-amber-400",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors shadow-none select-none",
        badgeVariantStyles[variant] || badgeVariantStyles.default,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
