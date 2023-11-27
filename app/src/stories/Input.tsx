import { HTMLInputTypeAttribute, InputHTMLAttributes } from "react";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { clsx } from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  type: HTMLInputTypeAttribute;
};

export function Input({ label, type, ...props }: InputProps) {
  return (
    <div className={"m-2 flex h-16 w-full flex-col text-gray-400"}>
      {label && <small className={"px-4"}>{label}</small>}
      <div
        className={
          "flex h-full w-full flex-row items-center rounded-3xl border border-gray-600 bg-slate-900 px-4 py-2"
        }
      >
        {type === "search" && (
          <FontAwesomeIcon icon={faSearch} className={"p-1 text-gray-400"} />
        )}
        <input
          className={clsx(
            "block h-full w-full bg-slate-900 p-1 focus:outline-none ",
          )}
          type={type}
          {...props}
        />
      </div>
    </div>
  );
}
