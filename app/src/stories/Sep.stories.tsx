import { StoryObj } from "@storybook/react";
import type { Meta } from "@storybook/react";
import { Sep } from "./Sep";

const meta = {
  title: "Beanstalk/Sep",
  component: Sep,
  render: ({ ...args }) => (
    <div className={"m-8"}>
      <Sep {...args} />
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
