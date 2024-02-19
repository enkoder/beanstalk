import colors from "tailwindcss/colors";

type StarProps = {
  count: number;
};

export function Stars({ count }: StarProps) {
  const rand = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const getBoxShadow = () => {
    const shadows = [];
    for (let i = 0; i < count; i++) {
      shadows.push(
        `${rand(-50, 50)}svw ${rand(-50, 50)}svh ${rand(0, 2)}px ${rand(
          0,
          2,
        )}px ${colors.gray[200]}`,
      );
    }
    return shadows.join(",");
  };

  return (
    <div
      className={
        "-z-1 fixed top-1/2 left-1/2 h-[1px] w-[1px] animate-zoom rounded-full bg-gray-300 transition-zoom duration-5"
      }
      style={{ boxShadow: getBoxShadow() }}
    />
  );
}
