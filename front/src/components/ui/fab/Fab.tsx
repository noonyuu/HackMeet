import React from "react";
import { fabVariants, FabVariantProps } from "./fab";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
  FabVariantProps & {
    variant?: "default" | "primary" | "secondary";
    size?: "sm" | "md" | "lg";
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  };

export const Fab: React.FC<Props> = ({
  className,
  variant = "default",
  size = "md",
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
  };
  return (
    <button
      className={cn(fabVariants({ variant, size }), className)}
      onClick={handleClick}
      {...props}
    />
  );
};
