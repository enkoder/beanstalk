# TODO

## User

- [ ] Add displayname to user profile
- [ ] User member since field
- [ ] NRDB & ABR links
- [x] Add is_admin
- [ ] Look into NRDB OAuth

## Leader

- [x] leaderboard GET query params
- [x] Pagination
- [ ] match_slip POST
- [ ] seasons PATCH (Admin)
- [ ] seasons PUT (Admin)
- [ ] Add tournament owner field
- [ ] tournaments PATCH (Admin & owner)
- [ ] tournaments PUT (Admin & owner)
- [ ] Leaderboard filterable by season & faction
- [ ] tournaments/conclude POST

## Queue Consumer

- [x] New consumer worker (shuffle code around)
- [x] Calculate rank and update table upon tournament conclusion
- [x] add /leaderboard/re-calculate POST endpoint

## Netrunner

- [x] Fetch and cache cards

## Misc

- [ ] Write up RFC and vision statement
- [ ] Look into http://www.aesopstables.net/about codebase to see how this fits into beanstalk
- [ ] Update code to use new name
- [ ] Explore Sentry integration, maybe there's a free tier that won't get too expensive
- [ ] Ensure the app unfurls properly w/ og tags

## Root

- [x] Figure out why pages isn't deploying to prod
- [x] Develop plan for frontend
- [x] Initial Leaderboard page
- [x] Initial user page
- [ ] Leaderboard filterable by season & faction
- [ ] Logged out view
- [ ] Logged in view
- [ ] Admin views
- [ ] Profile editor
- [ ] Add tournament page
- [ ] Report tournament stats (??)
- [ ] Show faction logos and ID name on deck url
- [ ] Finalize style for UI

## Dev Experience

- [ ] Write README on how to dev and run commands
- [ ] GH Actions to run linters
- [ ] Write tests if others start developing on it
- [ ] Add license
- [ ] Add VSCode editor configs to make it easier for people to edit
- [ ] Get off of create-react-app
