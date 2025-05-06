import React from "react";
import { buttonVariants, ButtonVariantProps } from "./button";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariantProps & {
    icon?: boolean;
  };

export const Button: React.FC<Props> = ({
  className,
  variant,
  size,
  icon = false,
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
      className={cn(buttonVariants({ variant, size, icon }), className)}
      onClick={handleClick}
      {...props}
    />
  );
};
