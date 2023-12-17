import { clsx } from "clsx";
import { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

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
