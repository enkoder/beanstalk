import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, type ReactNode } from "react";
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
      <Dialog as={"div"} className={"relative z-100"} onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-lg transform rounded-2xl border-2 border-gray-600 bg-gray-900 p-6 text-left align-middle shadow-xl transition-opacity">
                <div className={"flex flex-row"}>
                  {title && (
                    <Dialog.Title className="font-bold text-gray-400 text-lg leading-6">
                      {title}
                    </Dialog.Title>
                  )}
                  <XMarkIcon
                    className={
                      "ml-auto h-6 w-6 cursor-pointer rounded-full font-bold text-cyan-500"
                    }
                    onClick={onClose}
                  />
                </div>
                {description && (
                  <Dialog.Description className="text-gray-500 text-sm leading-6">
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
