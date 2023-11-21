import { ChangeEventHandler } from "react";

interface OptionType {
  id: number;
  text: string;
}

export interface SelectProps {
  options: OptionType[];
  selectedId: number;
  handleOnChange: ChangeEventHandler<HTMLSelectElement>;
}

export function Select({ options, selectedId, handleOnChange }: SelectProps) {
  return (
    <div className={"h-10 w-10 min-w-[200px]"}>
      <label>Season</label>
      <select
        className={
          "h-full w-full rounded-3xl border bg-gray border-gray-light text-gray-light"
        }
        onChange={handleOnChange}
      >
        {options.map((option) => (
          <option value={option.id} selected={option.id == selectedId}>
            {option.text}
          </option>
        ))}
      </select>
    </div>
  );
}
