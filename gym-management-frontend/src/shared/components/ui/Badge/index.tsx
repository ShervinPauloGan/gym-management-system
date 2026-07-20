import clsx from "clsx";

type BadgeVariant = "default" | "active" | "inactive" | "warning";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-surface-container text-[#111111]",
  active: "bg-primary text-primary-foreground",
  inactive: "bg-surface-container-high text-muted",
  warning: "bg-surface-container text-[#111111] border border-amber-400",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
}
