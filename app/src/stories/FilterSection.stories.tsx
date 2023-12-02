import { FilterSection } from "./FilterSection";
import { withRouter } from "storybook-addon-react-router-v6";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Beanstalk/FilterSection",
  component: FilterSection,
  decorators: [withRouter],
  render: ({ ...args }) => (
    <div className={"m-8"}>
      <FilterSection hasSearchBar={false} {...args}></FilterSection>
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
