import { SelectHTMLAttributes } from "react";

export type Option = {
  id: number;
  text: string;
};

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: Option[];
  initialOptionText?: string;
  label?: string;
};

export function Select({
  label,
  options,
  initialOptionText,
  onChange,
  ...props
}: SelectProps) {
  return (
    <div className={"m-2 flex h-16 w-full flex-col text-gray-400"}>
      {label && <small className={"px-4"}>{label}</small>}
      <select
        className={
          "h-full w-full rounded-3xl border border-gray-600 bg-slate-900 px-4 py-2 text-gray-400"
        }
        onChange={onChange}
        {...props}
      >
        {initialOptionText && <option>{initialOptionText}</option>}
        {options.map((option) => (
          <option value={option.id}>{option.text}</option>
        ))}
      </select>
    </div>
  );
}
