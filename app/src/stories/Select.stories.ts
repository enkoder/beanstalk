import { Select } from "./Select";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Beanstalk/Select",
  component: Select,
  argTypes: { onChange: { action: "change" } },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = ["Item 1", "Item 2", "Item 3"];
const selected = "Item 1";

export const Basic: Story = {
  args: {
    items: items,
    selected: selected,
    renderItem: (s: string) => {
      return s;
    },
  },
};

export const Label: Story = {
  args: {
    items: items,
    selected: selected,
    renderItem: (s: string) => {
      return s;
    },
    label: "Items",
  },
};
