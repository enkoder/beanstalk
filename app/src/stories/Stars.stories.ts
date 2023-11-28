import { Stars } from "./Stars";
import { StoryObj } from "@storybook/react";
import type { Meta } from "@storybook/react";

const meta = {
  title: "Beanstalk/Stars",
  component: Stars,
} satisfies Meta<typeof Stars>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 100,
  },
};
