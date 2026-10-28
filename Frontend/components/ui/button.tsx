import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-base leading-6 font-bold rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[var(--primary)] focus-visible:outline-offset-[3px] disabled:pointer-events-none disabled:opacity-50 min-h-11 px-5 py-2.5 cursor-pointer interactive-transition",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[#9db8ff] active:bg-[#7398ff]",
        secondary:
          "bg-[var(--surface-raised)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[#232f50] hover:border-[var(--border-strong)]",
        outline:
          "bg-transparent text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-raised)] hover:border-[var(--border-strong)]",
        ghost:
          "bg-transparent text-[var(--foreground)] hover:bg-[var(--surface)] hover:text-[var(--primary)]",
        destructive:
          "bg-[rgba(255,122,122,0.12)] text-[var(--risk-high)] border border-[rgba(255,122,122,0.3)] hover:bg-[rgba(255,122,122,0.2)]",
        link:
          "text-[var(--primary)] underline-offset-4 hover:underline p-0 min-h-0 h-auto font-normal",
      },
      size: {
        default: "min-h-11 px-5 py-2.5",
        sm: "min-h-9 px-3.5 py-1.5 text-sm",
        lg: "min-h-12 px-7 py-3 text-lg",
        icon: "size-11 p-0 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
