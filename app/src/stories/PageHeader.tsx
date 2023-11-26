type PageHeaderProps = {
  text: string;
};

export function PageHeading({ text }: PageHeaderProps) {
  return <h1 className={"pb-4 text-3xl text-gray-100"}>{text}</h1>;
}
