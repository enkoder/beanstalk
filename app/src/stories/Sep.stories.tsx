import { Sep } from "./Sep";
import { StoryObj } from "@storybook/react";
import type { Meta } from "@storybook/react";

const meta = {
  title: "Beanstalk/Sep",
  component: Sep,
  render: ({ ...args }) => (
    <div className={"m-8"}>
      <Sep {...args}></Sep>
    </div>
  ),
} satisfies Meta<typeof Sep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showLine: true,
  },
};
