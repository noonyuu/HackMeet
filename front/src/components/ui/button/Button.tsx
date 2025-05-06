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
  ...props
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, icon }), className)}
      {...props}
    />
  );
};
