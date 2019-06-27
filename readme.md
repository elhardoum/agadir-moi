### Admin install

```shell
# clone the repo
git clone https://github.com/elhardoum/agadir-moi && cd agadir-moi

# setup environment variables
cp .env.sample .env && $EDITOR $_

# regenerate JWT signing keys
cd admin/src/pem && rm *
ssh-keygen # make sure the filename is auth_rsa

# convert the pub key to pem format
ssh-keygen -f auth_rsa.pub -e -m pem > auth_rsa.pem.pub && mv auth_rsa.pem.pub auth_rsa.pub

# to setup the database, run the docker containers
docker-compose up -d

# ssh into postgres container
docker-compose exec postgres sh

# switch user
su -u postgres 

# create db/user
createuser agadirmoi; createdb agadirmoi

# log into psql interactive shell
psql -U postgres

# setup user and privileges
grant all privileges on database agadirmoi to agadirmoi
alter user agadirmoi with encrypted password 'agadirmoi'

# now exit psql, login again as agadirmoi user
psql -U agadirmoi

# setup tables: execute the content of `admin/db.sql`
# ..

# reboot containers
docker-compose down; docker-compose up -d
```

### Mobile app development

```shell
cd mobile

# setup env
cp env.sample.json env.json && $EDITOR $_

# install dependencies
npm install

# setup android project
react-native eject

# link dependencies
react-native link

# start the app
react-native run-android
```

## Todo

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
- [x] localize everything to baguette
- [x] remove unused assets

Optional - if time allows

- [ ] onscroll expand/collapse toolbar on news/events by reducing vertical padding gradually.
- [ ] data sync is done on boot - if user reaches screens before data is initially fetched then abort XHRs and make subsequent ones
- [x] news/events single view: queue below index and show/hide elements to preserve browsing state for better reading experience

