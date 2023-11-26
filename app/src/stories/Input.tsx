import { InputHTMLAttributes } from "react";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { clsx } from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  isSearch: boolean;
  label?: string;
};

export function Input({ label, isSearch, ...props }: InputProps) {
  const searchProps = isSearch && { type: "search", name: "search" };
  return (
    <div className={"m-2 flex h-16 w-full flex-col text-gray-400"}>
      {label && <small className={"px-4"}>{label}</small>}
      <div
        className={
          "flex h-full w-full flex-row items-center rounded-3xl border border-gray-600 bg-slate-900 px-4 py-2"
        }
      >
        {isSearch && (
          <FontAwesomeIcon icon={faSearch} className={"p-1 text-gray-400"} />
        )}
        <input
          className={clsx(
            "block h-full w-full bg-slate-900 p-1 focus:outline-none ",
          )}
          {...searchProps}
          {...props}
        />
      </div>
    </div>
  );
}
