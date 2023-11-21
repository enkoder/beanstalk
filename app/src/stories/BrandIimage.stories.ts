import { BrandImage } from "./BrandImage";
import greenBeans from "../../images/beanstalk_royalties.png";
import { StoryObj } from "@storybook/react";
import type { Meta } from "@storybook/react";

const meta = {
  title: "Beanstalk/BrandImage",
  component: BrandImage,
} satisfies Meta<typeof BrandImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: greenBeans,
  },
};
