import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, ReactNode } from "react";
import { Sep } from "./Sep";

type ModalProps = {
  title?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({
  title,
  description,
  isOpen,
  onClose,
  children,
}: ModalProps) {
  console.log(isOpen);
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as={"div"} className={"z-100 relative"} onClose={onClose}>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Panel className="w-full max-w-lg transform rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-opacity border-gray-600 border-2">
                <div className={"flex flex-row"}>
                  {title && (
                    <Dialog.Title className="text-lg font-bold leading-6 text-gray-400">
                      {title}
                    </Dialog.Title>
                  )}
                  <XMarkIcon
                    className={
                      "ml-auto rounded-full font-bold text-cyan-500 w-6 h-6 cursor-pointer"
                    }
                    onClick={onClose}
                  />
                </div>
                {description && (
                  <Dialog.Description className="text-sm leading-6 text-gray-500">
                    {description}
                  </Dialog.Description>
                )}
                <Sep className={"mt-2"} />
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
