import { HTMLInputTypeAttribute, InputHTMLAttributes } from "react";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  type: HTMLInputTypeAttribute;
};

export function Input({ label, id, type, className, ...props }: InputProps) {
  return (
    <div
      className={twMerge(className, " relative flex flex-col text-gray-200")}
    >
      <text className={"absolute -top-5 px-4 text-sm"}>{label}</text>
      <div
        id={id}
        className={twMerge(
          className,
          "flex flex-row items-center border border-gray-600 bg-slate-900 px-4 py-2",
        )}
      >
        {type === "search" && (
          <FontAwesomeIcon icon={faSearch} className={"p-1 text-gray-200"} />
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
