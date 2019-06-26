## Backend - administration UI

- [x] Docker dev structure
- [x] Auth via JWT or cookie/crypt based login
- [x] postgres for admin relational db needs
- [x] user roles: super admin, admin, moderator
- [x] post attachments to firebase
- [ ] moderators can approve/dismiss complaints
- [x] super admin has caps of normal admins, plus managing all user roles
- [ ] notifications preference for mods
- [ ] Safari auth issue
- [x] news CRUD
- [x] events CRUD
- [x] users CRUD
- [x] important phone numbers CRUD
- [x] migrate some configs to dotenv
- [x] migrate firebase URIs to dotenv
- [ ] posts - persist ids raw list in memory for NoSQL pagination
<!-- https://am.elh.solutions/events/edit/40411111111111111 -->


## Android

- [x] firebase data store and sync (advertises real time syncing for connected devices)
- [ ] push notifications or sms for opted collectors
- [x] data sync - preload everything on start, store data locally, compare timestamps to fetch new updates
- [x] news index and details
- [x] events index and details
- [x] phones list and native linking
- [x] weather screen + use central server to bypass free-package limitations, update data each 3 hours, push to firebase
- [ ] complaints
- [ ] encombrants
- [ ] localize everything to baguette
- [ ] remove unused assets / reduce app size

Optional - if time allows

- [ ] onscroll expand/collapse toolbar on news/events by reducing vertical padding gradually.
- [ ] data sync is done on boot - if user reaches screens before data is initially fetched then abort XHRs and make subsequent ones
- [x] news/events single view: queue below index and show/hide elements to preserve browsing state for better reading experience

