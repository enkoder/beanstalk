type PageHeaderProps = {
  text: string;
};

export function PageHeading({ text }: PageHeaderProps) {
  return <h1 className={"text-3xl text-gray-300"}>{text}</h1>;
}
