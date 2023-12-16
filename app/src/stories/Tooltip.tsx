import { Popover, Transition } from "@headlessui/react";
import { clsx } from "clsx";
import {
  ElementType,
  Fragment,
  HTMLAttributes,
  ReactNode,
  useState,
} from "react";
import { usePopper } from "react-popper";
import { twMerge } from "tailwind-merge";

type TooltipProps = HTMLAttributes<HTMLDivElement> & {
  as: ElementType;
  panel: ReactNode;
  duration?: number;
};

export function Tooltip({
  as,
  panel,
  duration = 200,
  className,
  children,
}: TooltipProps) {
  const [t, setT] = useState<NodeJS.Timeout | null>(null);
  // Popper positioning
  const [buttonElement, setButtonElement] = useState<HTMLButtonElement | null>(
    null,
  );
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );
  const { styles, attributes } = usePopper(buttonElement, popperElement, {
    placement: "top",
  });

  const closePopover = () => {
    if (!buttonElement) return;
    return buttonElement.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
  };

  const onMouseEnter = (open: boolean) => {
    if (!buttonElement) return;
    if (t) clearTimeout(t);
    if (open) return;
    return buttonElement.click();
  };

  const onMouseLeave = (open: boolean) => {
    if (!open) return;
    const timeout = setTimeout(() => closePopover(), duration);
    setT(timeout);
  };

  return (
    <Popover as={as} className={"relative h-full w-full"}>
      {({ open }) => {
        return (
          <>
            <div
              className={"h-full w-full"}
              onMouseLeave={onMouseLeave.bind(null, open)}
            >
              <Popover.Button
                ref={setButtonElement}
                onMouseEnter={onMouseEnter.bind(null, open)}
                onMouseLeave={onMouseLeave.bind(null, open)}
              >
                {children}
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel
                  ref={setPopperElement}
                  style={styles.popper}
                  {...attributes.popper}
                  className={twMerge(
                    clsx(
                      className,
                      "z-100 rounded-lg bg-gray-900 text-sm text-cyan-400 shadow-sm",
                    ),
                  )}
                >
                  <div
                    className="overflow-hidden rounded-lg shadow-lg"
                    onMouseEnter={onMouseEnter.bind(null, open)}
                    onMouseLeave={onMouseLeave.bind(null, open)}
                  >
                    {panel}
                  </div>
                </Popover.Panel>
              </Transition>
            </div>
          </>
        );
      }}
    </Popover>
  );
}
