import { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  text: string;
  includeUnderline?: boolean;
};

export function PageHeading({
  text,
  includeUnderline,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <>
      <h1
        className={twMerge(
          className,
          clsx(
            includeUnderline && "border-b border-gray-700 pb-2",
            "text-3xl text-gray-300",
          ),
        )}
        {...props}
      >
        {text}
      </h1>
    </>
  );
}
