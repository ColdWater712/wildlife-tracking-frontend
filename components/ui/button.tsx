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
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-dark disabled:hover:bg-primary",
  secondary:
    "bg-primary-soft text-primary-dark hover:bg-primary-soft/70 disabled:hover:bg-primary-soft",
  outline:
    "border border-line-strong bg-surface text-ink-soft hover:border-primary hover:text-primary disabled:hover:border-line-strong",
  ghost: "text-ink-soft hover:bg-surface-muted hover:text-ink",
  danger: "bg-danger text-white hover:brightness-90 disabled:hover:bg-danger",
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
        "inline-flex shrink-0 items-center justify-center font-semibold transition focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
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
