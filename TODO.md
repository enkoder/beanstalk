# TODO

## User

- [ ] Add displayname to user profile
- [ ] User member since field
- [ ] NRDB & ABR links
- [x] Add is_admin
- [ ] Look into NRDB OAuth

## Leader

- [ ] match_slip POST
- [ ] seasons PATCH (Admin)
- [ ] seasons PUT (Admin)
- [ ] Add tournament owner field
- [ ] tournaments PATCH (Admin & owner)
- [ ] tournaments PUT (Admin & owner)
- [ ] leaderboard GET query params
- [x] Pagination
- [ ] tournaments/conclude POST

## Queue Consumer

- [ ] New consumer worker (shuffle code around)
- [ ] Calculate rank and update table upon tournament conclusion
- [ ] add /leaderboard/re-calculate POST endpoint

## Netrunner

- [ ] Fetch and cache cards

## Misc

- [ ] Look into http://www.aesopstables.net/about codebase to see how this fits into anrpc
- [ ] Update code to use new name

## Root

- [ ] Figure out why pages isn't deploying to prod
- [ ] Develop plan for frontend
- [ ] Logged out view
- [ ] Logged in view
- [ ] Admin views
- [ ] Leaderboard page
- [ ] Profile editor
- [ ] Add tournament page
- [ ] Report tournament stats (??)

/api/leaderboard
