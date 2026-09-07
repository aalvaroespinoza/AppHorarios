import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantStyles: Record<ButtonVariant, string> = {
  default: "glass-primary",
  destructive: "border border-danger/60 bg-danger/15 text-danger hover:bg-danger/25 hover:border-danger",
  outline: "border border-line bg-surface/80 hover:bg-muted hover:border-line text-ink",
  secondary: "border border-line bg-muted text-ink hover:bg-elevated hover:border-line",
  ghost: "border border-transparent hover:border-line hover:bg-muted/80 text-subtle hover:text-ink",
  link: "text-accent underline-offset-4 hover:underline",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "min-h-11 px-4 py-2 text-sm",
  sm: "min-h-11 px-3 py-2 text-sm",
  lg: "h-11 px-5 text-sm",
  icon: "h-11 w-11 p-0 flex items-center justify-center",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild: _asChild, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl font-sans   transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-40 active:translate-y-[0.5px] cursor-pointer shadow-none select-none",
          variantStyles[variant] || variantStyles.default,
          sizeStyles[size] || sizeStyles.default,
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
