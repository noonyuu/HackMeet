import { cva, VariantProps } from "class-variance-authority";

export const fabVariants = cva(
  "fixed bottom-4 right-4 z-50 flex items-center justify-center rounded-full shadow-lg transition-transform duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-white text-black border border-gray-300",
        primary: "bg-blue-500 text-white",
        secondary: "bg-gray-500 text-white",
      },
      size: {
        sm: "w-10 h-10 text-sm",
        md: "w-12 h-12 text-base",
        lg: "w-14 h-14 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export type FabVariantProps = VariantProps<typeof fabVariants>;
