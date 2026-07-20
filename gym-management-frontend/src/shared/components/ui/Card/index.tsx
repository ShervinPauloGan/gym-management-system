import { HTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevated, className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx(elevated ? "card-elevated" : "card", "p-6", className)} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
