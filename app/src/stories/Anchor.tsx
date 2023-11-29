import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHashtag } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

type AnchorProps = {
  id: string;
  className?: string;
  children: ReactNode;
};

export function Anchor({ id, className, children }: AnchorProps): JSX.Element {
  const navigate = useNavigate();
  return (
    <div className={twMerge(className, "flex flex-row items-center")}>
      <FontAwesomeIcon
        className={"cursor pr-2"}
        icon={faHashtag}
        onClick={() => navigate(`#${id}`)}
      />
      <h6 id={id} className={"text-2xl text-gray-300"}>
        {children}
      </h6>
    </div>
  );
}
