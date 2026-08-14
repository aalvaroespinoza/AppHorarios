import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-cyan-500 text-black hover:bg-cyan-400 font-bold shadow",
  destructive: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 shadow-sm",
  outline: "border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-200",
  secondary: "bg-neutral-800 text-neutral-200 hover:bg-neutral-700 shadow-sm",
  ghost: "hover:bg-neutral-800 text-neutral-300 hover:text-white",
  link: "text-cyan-400 underline-offset-4 hover:underline",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-8 rounded-xl px-3 text-xs",
  lg: "h-12 rounded-2xl px-6 text-base",
  icon: "h-9 w-9 p-0 flex items-center justify-center",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
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
