import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

const badgeVariantStyles: Record<BadgeVariant, string> = {
  default: "border-accent/50 bg-accent/15 text-accent",
  secondary: "border-line bg-muted text-ink",
  destructive: "border-danger/40 bg-danger/10 text-danger",
  outline: "border-line text-subtle bg-surface/60",
  success: "border-success/50 bg-success/15 text-success",
  warning: "border-warning/50 bg-warning/15 text-warning",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-2xl border px-2 py-0.5 font-sans text-xs font-bold   transition-colors shadow-none select-none",
        badgeVariantStyles[variant] || badgeVariantStyles.default,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
