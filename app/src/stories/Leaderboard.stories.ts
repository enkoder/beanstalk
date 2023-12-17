import type { Meta, StoryObj } from "@storybook/react";
import { withRouter } from "storybook-addon-react-router-v6";
import { LeaderboardResponse, LeaderboardRow } from "../client";
import { LeaderboardTable } from "./LeaderboardTable";

const meta = {
  title: "Beanstalk/Leaderboard",
  component: LeaderboardTable,
  decorators: [withRouter],
  argTypes: {},
} satisfies Meta<typeof LeaderboardTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const users: LeaderboardRow[] = [];
for (let i = 0; i++; i < 100) {
  users.push({ id: i, name: `name${i}`, rank: i, points: 100, attended: 10 });
  console.log(i);
}

const leaderboard = {
  users: Array.from(Array(100).keys()).map((i) => {
    return {
      id: i,
      name: `Person ${i}`,
      rank: i + 1,
      points: 100 / (i + 1),
      attended: 10,
    };
  }),
  total: 3,
  pages: 1,
  current_page: 0,
} as LeaderboardResponse;

export const Default: Story = {
  args: {
    leaderboard: leaderboard,
    selectedSeason: 0,
    searchString: "",
  },
};
