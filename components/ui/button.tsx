import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark disabled:hover:bg-primary",
  secondary:
    "border border-forest-primary bg-white text-forest-deep hover:bg-natural-muted/40 disabled:hover:bg-white",
  outline:
    "border border-natural-muted bg-white text-forest-deep hover:border-forest-primary hover:bg-natural-muted/25 disabled:hover:border-natural-muted",
  ghost: "text-olive-dark hover:bg-natural-muted/40 hover:text-forest-deep",
  danger:
    "border border-danger bg-white text-danger hover:bg-danger/10 disabled:hover:bg-white",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-lg px-3 text-xs",
  md: "h-10 gap-2 rounded-xl px-4 text-sm",
  lg: "h-12 gap-2 rounded-xl px-5 text-sm",
  icon: "size-10 rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const trailingIcon =
    iconPosition === "right" && icon !== undefined ? (
      <span aria-hidden="true" className="shrink-0">
        {icon}
      </span>
    ) : null;

  const leadingIcon =
    iconPosition === "left" && icon !== undefined ? (
      <span aria-hidden="true" className="shrink-0">
        {icon}
      </span>
    ) : null;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : (
        leadingIcon
      )}
      {children}
      {trailingIcon}
    </button>
  );
}
