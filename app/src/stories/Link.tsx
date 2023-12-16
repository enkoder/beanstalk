import { clsx } from "clsx";
import {
  Link as ReactRouterLink,
  LinkProps as ReactRouterLinkProps,
} from "react-router-dom";
import { twMerge } from "tailwind-merge";

type LinkProps = ReactRouterLinkProps & {
  styleOnHover?: boolean;
};

export function Link({
  styleOnHover = true,
  to,
  className,
  children,
  ...props
}: LinkProps): JSX.Element {
  return (
    <ReactRouterLink
      to={to}
      className={twMerge(
        className,
        clsx(
          styleOnHover && "hover:font-bold hover:text-cyan-400 hover:underline",
          "text-cyan-500",
        ),
      )}
      {...props}
    >
      {children}
    </ReactRouterLink>
  );
}
