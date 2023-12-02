import { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

type SepProps = HTMLAttributes<HTMLElement> & {
  showLine?: boolean;
};

export const Sep = ({ showLine, className }: SepProps) => {
  return (
    <hr
      className={twMerge(
        className,
        clsx(showLine ? "border border-gray-700" : "border-none"),
      )}
    />
  );
};
