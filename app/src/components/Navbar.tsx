import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { Fragment, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import greenBeans from "../../assets/ai_beanstalk_royalties.jpeg";
import { AuthService } from "../client";
import useAuth from "../useAuth";

export type MenuItem = {
  name: string;
  onClick: () => void;
  needsUser: boolean;
};

export type Navigation = {
  name: string;
  to: string;
  isCurrent: boolean;
};

export function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState<string>();
  const { data: authUrl } = useQuery<string>({
    queryKey: ["authUrl"],
    queryFn: () => AuthService.getGetLoginUrl(),
  });

  function handleLogin() {
    if (authUrl) window.location.assign(authUrl);
  }

  const navigation: Navigation[] = [
    { name: "Leaderboard", to: "/", isCurrent: true },
    //{ name: "Seasons", to: "/seasons", isCurrent: false },
    { name: "Tags", to: "/tags", isCurrent: false },
    { name: "Beans", to: "/beans", isCurrent: false },
    { name: "Code", to: "/code", isCurrent: false },
    { name: "Sim", to: "/sim", isCurrent: false },
    { name: "FAQ", to: "/faq", isCurrent: false },
  ];

  const menu: MenuItem[] = [
    {
      name: "Profile",
      needsUser: true,
      onClick: () => {
        navigate("/@me");
      },
    },
    {
      name: "Your Results",
      needsUser: true,
      onClick: () => {
        navigate(`/results/${user?.name}`);
      },
    },
    {
      name: "Login",
      needsUser: false,
      onClick: handleLogin,
    },
    {
      name: "Logout",
      needsUser: true,
      onClick: logout,
    },
  ];

  useEffect(() => {
    for (const nav of navigation) {
      if (location.pathname === nav.to) {
        setCurrent(nav.to);
      }
    }
  }, [location]);

  return (
    <Disclosure as="nav" className="mx-auto max-w-7xl z-[9999] bg-gray-900">
      {({ open }) => (
        <>
          <div className="px-2 md:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center md:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-cyan-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-600">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link
                    to={"/"}
                    className={clsx(
                      "flex flex-row items-center text-lg text-cyan-500",
                    )}
                  >
                    <img
                      className={"h-10 rounded-full"}
                      src={greenBeans}
                      alt="logo"
                    />
                    <strong className={"pl-4 text-xl"}>Beanstalk</strong>
                  </Link>
                </div>
                <div className="hidden md:ml-6 md:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        to={item.to}
                        className={clsx(
                          item.to === current
                            ? "bg-gray-950 text-cyan-400"
                            : "text-gray-400 hover:bg-cyan-600 hover:text-gray-950",
                          "rounded-lg px-3 py-2",
                        )}
                        aria-current={item.to === current ? "page" : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute  inset-y-0 right-0 flex items-center pr-2 md:static md:inset-auto md:ml-6 md:pr-0">
                {/* Bell icon, use this later once there is a blog
                <button
                  type="button"
                  className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>
                */}

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <UserCircleIcon
                        className={clsx(
                          user != null ? "text-cyan-400" : "text-gray-400",
                          "h-8 w-8 ",
                        )}
                        aria-hidden={true}
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md border border-gray-600 bg-gray-900 py-1 text-cyan-400 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {menu.map((menuItem) => (
                        <>
                          {((menuItem.needsUser && user != null) ||
                            (!menuItem.needsUser && user == null)) && (
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  type={"button"}
                                  onClick={menuItem.onClick}
                                  className={clsx(
                                    active
                                      ? "rounded-lg bg-cyan-600 text-gray-950"
                                      : "",
                                    "mx-2 block w-44 px-4 py-2 text-gray-400",
                                  )}
                                >
                                  {menuItem.name}
                                </button>
                              )}
                            </Menu.Item>
                          )}
                        </>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  as="a"
                  href={item.to}
                  className={clsx(
                    item.to === current
                      ? "bg-gray-950 text-cyan-400"
                      : "text-cyan-400 hover:bg-cyan-600 hover:text-gray-950",
                    "block rounded-md px-3 py-2 text-base font-medium",
                  )}
                  aria-current={item.to === current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
