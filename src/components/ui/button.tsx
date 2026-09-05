import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantStyles: Record<ButtonVariant, string> = {
  default: "border border-safety-orange bg-safety-orange text-black font-bold hover:bg-[#ff681a] active:bg-[#e64d00]",
  destructive: "border border-red-500/60 bg-red-500/15 text-red-400 hover:bg-red-500/25 hover:border-red-400",
  outline: "border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-200",
  secondary: "border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-600",
  ghost: "border border-transparent hover:border-zinc-800 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-100",
  link: "text-safety-orange underline-offset-4 hover:underline",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-9 px-3.5 py-1.5 text-xs",
  sm: "h-7 px-2.5 py-1 text-[10px]",
  lg: "h-11 px-5 text-sm",
  icon: "h-8 w-8 p-0 flex items-center justify-center",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-sm font-mono uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-safety-orange disabled:pointer-events-none disabled:opacity-40 active:translate-y-[0.5px] cursor-pointer shadow-none select-none",
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
