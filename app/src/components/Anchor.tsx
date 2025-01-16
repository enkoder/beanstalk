import { HashtagIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type AnchorProps = {
  id: string;
  className?: string;
  children: ReactNode;
};

export function Anchor({ id, className, children }: AnchorProps): JSX.Element {
  const navigate = useNavigate();
  return (
    <div className={clsx(className, "flex flex-row items-center")}>
      <HashtagIcon
        className={clsx(className, "cursor mr-2 h-6 w-6 text-gray-300 text-sm")}
        onClick={() => navigate(`#${id}`)}
      />
      <h6 id={id} className={"text-2xl text-gray-300"}>
        {children}
      </h6>
    </div>
  );
}
