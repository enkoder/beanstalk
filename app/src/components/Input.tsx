import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HTMLInputTypeAttribute, InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  type: HTMLInputTypeAttribute;
};

export function Input({ label, id, type, className, ...props }: InputProps) {
  return (
    <div className={"flex w-full flex-col text-gray-200"}>
      <text
        className={"block pl-4 text-sm font-medium leading-6 text-gray-400"}
      >
        {label}
      </text>

      <div
        id={id}
        className={twMerge(
          "relative flex h-full w-full cursor-default items-center border border-gray-600 bg-gray-900 py-1.5 pl-3 pr-2 text-left text-gray-400 shadow-sm sm:text-sm sm:leading-6",
          className,
        )}
      >
        {type === "search" && (
          <MagnifyingGlassIcon
            className={"mr-2 h-5 w-5 text-gray-400"}
            aria-hidden="true"
          />
        )}
        <input
          className={"w-full bg-slate-900 p-1 focus:outline-none"}
          type={type}
          {...props}
        />
      </div>
    </div>
  );
}
