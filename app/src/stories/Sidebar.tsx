import useAuth from "../useAuth";
import { AuthService, User } from "../client";
// @ts-ignore
import greenBeans from "../../images/beanstalk_royalties.png";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowsSpin,
  faBars,
  faCaretDown,
  faCaretUp,
  faCode,
  faCoins,
  faComputer,
  faElevator,
  faLock,
  faQuestion,
  faRightFromBracket,
  faRightToBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { MouseEventHandler, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "clsx";

const SIDEBAR_WIDTH = 256;
const SIDEBAR_MIN_WIDTH = 80;
const SIDEBAR_FOOTER_MIN_HEIGHT = "56px";
const SIDEBAR_BACKGROUND_COLOR = "bg-gray-900";
const SIDEBAR_TEXT_COLOR = "text-cyan-400";

interface SidebarButtonType {
  icon: IconDefinition;
  label: string;
  selectionStarter: boolean;
  requiresAdmin?: boolean;
  to: string;
}

export const SidebarButtons: SidebarButtonType[] = [
  {
    icon: faElevator,
    label: "Leaderboard",
    selectionStarter: true,
    to: "/",
  },
  {
    icon: faArrowsSpin,
    label: "Seasons",
    selectionStarter: false,
    to: "/seasons",
  },
  {
    icon: faCoins,
    label: "Beans",
    selectionStarter: true,
    to: "/beans",
  },
  {
    icon: faComputer,
    label: "Sim",
    selectionStarter: false,
    to: "/sim",
  },
  {
    icon: faCode,
    label: "Code",
    selectionStarter: false,
    to: "/code",
  },
  {
    icon: faQuestion,
    label: "FAQ",
    selectionStarter: true,
    to: "/faq",
  },
  {
    icon: faLock,
    label: "Admin",
    selectionStarter: true,
    requiresAdmin: true,
    to: "/admin",
  },
];

interface SidebarProps {
  isOpen: boolean;
  onMenuClick: () => void;
  onButtonClick: MouseEventHandler<HTMLDivElement>;
  activeButton: number;
}

export function getSidebarWidth(isOpen: boolean) {
  return isOpen ? SIDEBAR_WIDTH : SIDEBAR_MIN_WIDTH;
}

interface SidebarHeaderProps {
  isOpen: boolean;
  onMenuClick: () => void;
}

export function SidebarHeader({ isOpen, onMenuClick }: SidebarHeaderProps) {
  return (
    <div
      className={clsx(
        SIDEBAR_BACKGROUND_COLOR,
        SIDEBAR_TEXT_COLOR,
        "flex h-16 flex-row items-center justify-between pl-4 pr-4 text-2xl transition-width",
      )}
    >
      {isOpen && (
        <Link to={"/"} className={clsx("flex flex-row items-center")}>
          <img className={"h-12 rounded-full"} src={greenBeans} alt="logo" />
          <strong className={"pl-4"}>Beanstalk</strong>
        </Link>
      )}
      <FontAwesomeIcon
        className={"pl-4 pr-4"}
        icon={faBars}
        onClick={onMenuClick}
      />
    </div>
  );
}

interface SidebarContentProps {
  user: User | undefined | null;
  buttons: SidebarButtonType[];
  activeButton: number;
  onButtonClick: MouseEventHandler;
  isOpen: boolean;
}

export function SidebarContent({
  user,
  buttons,
  activeButton,
  onButtonClick,
  isOpen,
}: SidebarContentProps) {
  const isActive = (i: number) => {
    return activeButton === i;
  };

  return (
    <div
      className={clsx(
        SIDEBAR_BACKGROUND_COLOR,
        SIDEBAR_TEXT_COLOR,
        "flex flex-col items-stretch overflow-x-hidden transition-width",
      )}
    >
      {buttons
        .filter((sb) => !sb.requiresAdmin || (user && !user.is_admin))
        .map((sb, i) => (
          <>
            {sb.selectionStarter && (
              <hr className={"mb-4 border border-cyan-600 pl-4 pr-4"} />
            )}
            <div
              className={clsx(
                "ml-4 flex h-14 flex-row items-center rounded-l-3xl transition-colors",
                "hover:rounded-l-3xl hover:bg-gray-950 hover:text-lg hover:font-bold hover:text-cyan-300",
                isActive(i) && "bg-gray-950 text-lg font-bold text-cyan-300",
              )}
              onClick={onButtonClick}
              button-id={i}
            >
              <FontAwesomeIcon className={"pl-4 pr-4"} icon={sb.icon} />
              {isOpen && <span>{sb.label}</span>}
            </div>
          </>
        ))}
    </div>
  );
}

type SidebarFooterProps = {
  user: User | undefined | null;
  isOpen: boolean;
  handleLogin: () => void;
  handleLogout: () => void;
};

export function SidebarFooter({
  user,
  isOpen,
  handleLogout,
  handleLogin,
}: SidebarFooterProps) {
  const [footerOpen, setFooterOpen] = useState<boolean>(false);

  const toggleSidebarFooter = () => {
    setFooterOpen(!footerOpen);
  };

  const getFooterHeight = () => {
    return footerOpen ? "fit-content" : SIDEBAR_FOOTER_MIN_HEIGHT;
  };

  const renderFooterContent = (u: User | null | undefined) => {
    return (
      // Footer content container
      <div className={"flex flex-col items-stretch"}>
        <hr className={"mb-0 mt-0 border-cyan-500 pl-4 pr-4"} />
        {!u ? (
          <div
            className={
              "ml-4 mr-4 flex h-14 flex-row items-center transition-colors hover:bg-gray-950 hover:font-bold"
            }
            onClick={handleLogin}
          >
            <FontAwesomeIcon icon={faRightToBracket} className={"pl-4 pr-4"} />
            {isOpen && <span>Login</span>}
          </div>
        ) : (
          <div
            className={
              "ml-4 mr-4 flex h-14 flex-row items-center transition-colors hover:bg-gray-950 hover:font-bold"
            }
            onClick={handleLogout}
          >
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className={"pl-4 pr-4"}
            />
            {isOpen && <span>Logout</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    // Outer sidebar footer container
    <div
      className={clsx(
        SIDEBAR_BACKGROUND_COLOR,
        "absolute bottom-0 w-full rounded-3xl border border-solid border-cyan-500",
      )}
      style={{ height: getFooterHeight() }}
    >
      {/* Sidebar footer header container */}
      <div className={"flex w-full flex-row pb-4"}>
        <div className="l-0 h-4 w-4 pl-4 pr-4 pt-4">
          <FontAwesomeIcon icon={faUser} />
        </div>

        {isOpen && (
          <div className={"pl-4 pt-4"}>
            {user ? (
              <Link to={`/results/${user.name}`}>{user.name} </Link>
            ) : (
              <h6>Profile</h6>
            )}
          </div>
        )}

        <div
          className={"ml-auto h-auto cursor-auto pr-4 pt-4"}
          onClick={toggleSidebarFooter}
        >
          {footerOpen ? (
            <FontAwesomeIcon icon={faCaretDown} className={"h-6 w-16"} />
          ) : (
            <FontAwesomeIcon icon={faCaretUp} className={"h-6 w-16"} />
          )}
        </div>
      </div>
      {footerOpen && renderFooterContent(user)}
    </div>
  );
}

export function Sidebar({
  isOpen,
  onMenuClick,
  onButtonClick,
  activeButton,
}: SidebarProps) {
  const { user, logout } = useAuth();

  function handleLogin() {
    AuthService.getGetLoginUrl()
      .then(({ auth_url }) => {
        window.location.assign(auth_url);
      })
      .catch((error) => {
        console.log(error);
      });
    return () => {};
  }

  function handleLogout() {
    logout();
  }

  return (
    <div
      className={clsx(
        SIDEBAR_BACKGROUND_COLOR,
        SIDEBAR_TEXT_COLOR,
        "fixed flex h-full select-none flex-col overflow-hidden duration-500",
      )}
      style={{ width: `${getSidebarWidth(isOpen)}px` }}
    >
      <SidebarHeader onMenuClick={onMenuClick} isOpen={isOpen} />
      <SidebarContent
        user={user}
        buttons={SidebarButtons}
        isOpen={isOpen}
        activeButton={activeButton}
        onButtonClick={onButtonClick}
      />
      <SidebarFooter
        user={user}
        isOpen={isOpen}
        handleLogout={handleLogout}
        handleLogin={handleLogin}
      />
    </div>
  );
}
