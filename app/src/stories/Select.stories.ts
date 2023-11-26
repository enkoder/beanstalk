import { Select } from "./Select";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Beanstalk/Select",
  component: Select,
  argTypes: {},
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    options: [
      { id: 0, text: "First Item" },
      { id: 1, text: "Second Item" },
    ],
  },
};

export const Label: Story = {
  args: {
    options: [
      { id: 0, text: "First Item" },
      { id: 1, text: "Second Item" },
    ],
    label: "Seasons",
  },
};
