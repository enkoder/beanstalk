import { Combobox, ComboboxProps, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { Fragment, ReactNode, useState } from "react";

type Nullable = true;
type Tag = "div";

type BaseProps<T> = {
  width: string;
  label?: string;
  placeholder: string;
  items: T[];
  renderItem: (v: T | null) => ReactNode | string;
  preProcess: (items: T[], query: string) => T[];
};

type SingleComboxProps<T> = BaseProps<T> &
  ComboboxProps<T, Nullable, false, Tag> & {
    onChange: (value: T | null) => void;
    selected: T | null;
    itemToString?: (value: T | null) => string;
    multiple: false;
  };

type MultiComboboxProps<T> = BaseProps<T> &
  ComboboxProps<T, Nullable, true, Tag> & {
    onChange: (value: T[]) => void;
    selected: T[];
    itemToString?: (value: T[]) => string;
    multiple: true;
  };

export default function ComboBox<T>({
  width,
  label,
  items,
  renderItem,
  preProcess,
  itemToString,
  selected,
  onChange,
  placeholder,
  multiple,
}: SingleComboxProps<T> | MultiComboboxProps<T>) {
  const [query, setQuery] = useState("");

  const filteredItems = preProcess(items, query);

  return (
    <Combobox
      as={"div"}
      className={width}
      value={selected}
      onChange={onChange}
      // @ts-ignore
      multiple={multiple}
    >
      {({ open }) => (
        <>
          {label && (
            <Combobox.Label className="block pl-4 text-sm font-medium leading-6 text-gray-400">
              {label}
            </Combobox.Label>
          )}

          <div className="relative">
            <Combobox.Input
              className={clsx(
                width,
                "relative h-12 cursor-default rounded-lg bg-gray-900 py-1.5 pl-3 pr-10 text-left text-gray-400 shadow-sm ring-1 ring-inset ring-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-600 sm:text-sm sm:leading-6",
              )}
              displayValue={
                itemToString
                  ? (value: T & T[]) => itemToString(value)
                  : undefined
              }
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
            />
            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-cyan-500 bg-gray-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filteredItems.length === 0 && query !== "" ? (
                  <div className="relative cursor-default select-none px-4 py-2 text-gray-400">
                    Nothing found.
                  </div>
                ) : (
                  filteredItems.map((item, i) => (
                    <Combobox.Option
                      key={String(i)}
                      className={({ active }) =>
                        clsx(
                          active
                            ? "bg-gray-950 text-cyan-400"
                            : "text-gray-400",
                          "relative cursor-default select-none py-2 pl-3 pr-9",
                        )
                      }
                      value={item}
                    >
                      {({ selected, active }) => (
                        <>
                          <div className="flex items-center">
                            <span
                              className={clsx(
                                selected ? "font-bold" : "font-normal",
                                "block truncate",
                              )}
                            >
                              {renderItem(item)}
                            </span>
                          </div>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                active ? "text-white" : "text-teal-600"
                              }`}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </div>
        </>
      )}
    </Combobox>
  );
}
