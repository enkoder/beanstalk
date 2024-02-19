import { Listbox, Transition } from "@headlessui/react";
import { Fragment, type ReactNode } from "react";

import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface SelectProps<T> {
  width: string;
  label?: string;
  items: T[];
  renderItem: (o: T | undefined) => ReactNode;
  selected: T | undefined;
  onChange: (o: T | undefined) => void;
}

export function Select<T>({
  width,
  label,
  items,
  renderItem,
  selected,
  onChange,
}: SelectProps<T>) {
  return (
    <Listbox
      as={"div"}
      className={twMerge(width)}
      value={selected}
      onChange={onChange}
    >
      {({ open }) => (
        <>
          {label && (
            <Listbox.Label className="block pl-4 font-medium text-gray-400 text-sm leading-6">
              {label}
            </Listbox.Label>
          )}
          <div className="relative">
            <Listbox.Button
              className={clsx(
                width,
                "relative h-12 cursor-default rounded-lg bg-gray-900 py-1.5 pr-10 pl-3 text-left text-gray-400 shadow-sm ring-1 ring-gray-600 ring-inset sm:text-sm sm:leading-6 focus:outline-none focus:ring-2 focus:ring-cyan-600",
              )}
            >
              <span className="flex items-center">
                <span className="block truncate">{renderItem(selected)}</span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="scrollbar scrollbar-track-gray-900 scrollbar-thumb-cyan-600 absolute z-10 mt-1 max-h-56 w-full overflow-auto overflow-y-auto rounded-md border border-cyan-500 bg-gray-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm focus:outline-none">
                {items.map((item, i) => (
                  <Listbox.Option
                    key={String(i)}
                    className={({ active }) =>
                      clsx(
                        active ? "bg-gray-950 text-cyan-400" : "text-gray-400",
                        "relative cursor-default select-none py-2 pr-9 pl-3",
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
                            className={clsx(
                              active
                                ? "font-bold text-cyan-400"
                                : "text-gray-400",
                              "absolute inset-y-0 right-0 flex items-center pr-4",
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
