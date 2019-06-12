create table if not exists users (
    id serial,
    email varchar(80) not null,
    first_name varchar(30),
    last_name varchar(30),
    password varchar(90) not null,
    registered bigint,
    reset_token varchar(60),
    auth_key varchar(30),
    roles varchar(60),
    primary key(id)
);
