import { clsx } from "clsx";
import { HTMLAttributes } from "react";
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
        includeUnderline && "border-b border-gray-700 pb-2",
      )}
    >
      <h1 className={twMerge(className, "text-3xl text-gray-300")} {...props}>
        {text}
      </h1>
      {children && <div className={"ml-auto mt-auto"}>{children}</div>}
    </div>
  );
}
