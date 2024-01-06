import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { Fragment, ReactNode, useState } from "react";

export interface ComboBoxProps<T> {
  width: string;
  label?: string;
  items: T[];
  renderItem: (o: T | undefined) => ReactNode | string;
  itemFilter: (o: T | undefined, query: string) => boolean;
  itemToString: (o: T | undefined) => string;
  selected: T[] | undefined;
  onChange: (o: T[] | undefined) => void;
  placeholder: string;
}

export default function ComboBox<T>({
  width,
  label,
  items,
  renderItem,
  itemFilter,
  itemToString,
  selected,
  onChange,
  placeholder,
}: ComboBoxProps<T>) {
  const [query, setQuery] = useState("");

  const filteredItems =
    query === "" ? items : items.filter((item) => itemFilter(item, query));

  const inputDisplayValue = (item_or_items: T | T[]) => {
    if (Array.isArray(item_or_items)) {
      return item_or_items.map((item) => itemToString(item)).join(",");
    }

    return String(itemToString(item_or_items));
  };

  return (
    <Combobox
      as={"div"}
      className={width}
      value={selected}
      onChange={onChange}
      multiple
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
              displayValue={(item_or_items: T | T[]) =>
                inputDisplayValue(item_or_items)
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
