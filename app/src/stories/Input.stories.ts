import { StoryObj } from "@storybook/react";
import type { Meta } from "@storybook/react";
import { Input } from "./Input";

const meta = {
  title: "Beanstalk/Input",
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Input",
    isSearch: false,
  },
};

export const Search: Story = {
  args: {
    placeholder: "Search",
    isSearch: true,
  },
};

export const SearchWithLabel: Story = {
  args: {
    placeholder: "Search",
    isSearch: true,
    label: "Search",
  },
};
