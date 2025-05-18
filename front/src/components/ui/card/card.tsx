import clsx from "clsx";

type CardProps = {
  compact?: boolean;
  children?: React.ReactNode;
  className?: string;
};

export const Card = ({
  compact = false,
  children,
  className,
}: CardProps) => {
  return (
    <div
      className={clsx(
        "bg-card rounded-lg shadow-sm bg-white",
        {
          "shadow-xl": !compact,
        },
        className,
      )}
    >
      {children}
    </div>
  );
};
