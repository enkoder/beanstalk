import type { Meta, StoryObj } from "@storybook/react";
import { withRouter } from "storybook-addon-react-router-v6";
import { FilterSection } from "./FilterSection";

const meta = {
  title: "Beanstalk/FilterSection",
  component: FilterSection,
  decorators: [withRouter],
  render: ({ ...args }) => (
    <div className={"m-8"}>
      <FilterSection hasSearchBar={false} {...args} />
    </div>
  ),
} satisfies Meta<typeof FilterSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSearchBar: Story = {
  args: {
    hasSearchBar: true,
  },
};

export const WithoutSearchBar: Story = {
  args: {
    hasSearchBar: false,
  },
};
