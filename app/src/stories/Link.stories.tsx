import type { Meta, StoryObj } from "@storybook/react";
import { withRouter } from "storybook-addon-react-router-v6";
import { Link } from "./Link";

const meta = {
  title: "Beanstalk/Link",
  component: Link,
  decorators: [withRouter],
  render: ({ to }) => (
    <div className={"m-8"}>
      <Link to={to} className={"text-xlg"}>
        Lets brew some beans!
      </Link>
    </div>
  ),
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    to: "",
  },
};
