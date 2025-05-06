import { cva, VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-white text-black font-main border border-gray-300",
        sns: "bg-white text-black border border-gray-300",
      },
      size: {
        sm: "text-sm p-2",
        lg: "w-88 text-base py-2",
      },
      icon: {
        true: "gap-2",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
