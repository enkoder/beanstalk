import { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  text: string;
};

export function PageHeading({ text, className, ...props }: PageHeaderProps) {
  return (
    <h1 className={twMerge(className, "text-3xl text-gray-300")} {...props}>
      {text}
    </h1>
  );
}
