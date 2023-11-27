import { Anchor } from "./Anchor";
import { withRouter } from "storybook-addon-react-router-v6";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Beanstalk/Anchor",
  component: Anchor,
  decorators: [withRouter],
  argTypes: {},
} satisfies Meta<typeof Anchor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    id: "title-section",
    className: "m-4",
    children: <h1>Title of the section</h1>,
  },
};
