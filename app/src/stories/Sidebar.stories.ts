import { Sidebar } from "./Sidebar";
import { withRouter } from "storybook-addon-react-router-v6";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Beanstalk/Sidebar",
  component: Sidebar,
  decorators: [withRouter],
  argTypes: {
    onMenuClick: { action: "menu-click" },
    onButtonClick: { action: "button-click" },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    isOpen: true,
    activeButton: 1,
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    activeButton: 1,
  },
};
