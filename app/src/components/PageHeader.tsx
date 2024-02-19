import { clsx } from "clsx";
import type { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  text: string;
  includeUnderline?: boolean;
};

export function PageHeading({
  text,
  includeUnderline,
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={clsx(
        "flex flex-row",
        includeUnderline && "border-gray-700 border-b pb-2",
      )}
    >
      <h1 className={twMerge(className, "text-3xl text-gray-300")} {...props}>
        {text}
      </h1>
      {children && <div className={"mt-auto ml-auto"}>{children}</div>}
    </div>
  );
}
