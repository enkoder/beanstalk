import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { HashtagIcon } from "@heroicons/react/24/solid";

type AnchorProps = {
  id: string;
  className?: string;
  children: ReactNode;
};

export function Anchor({ id, className, children }: AnchorProps): JSX.Element {
  const navigate = useNavigate();
  return (
    <div className={twMerge(className, "flex flex-row items-center")}>
      <HashtagIcon
        className={"cursor mr-2 h-6 w-6 text-sm text-gray-300"}
        onClick={() => navigate(`#${id}`)}
      />
      <h6 id={id} className={"text-2xl text-gray-300"}>
        {children}
      </h6>
    </div>
  );
}
