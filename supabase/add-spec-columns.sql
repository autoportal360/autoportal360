-- Run this in Supabase SQL Editor to add new spec columns
alter table specs add column if not exists airbags int;
alter table specs add column if not exists abs boolean;
alter table specs add column if not exists front_suspension text;
alter table specs add column if not exists rear_suspension text;
alter table specs add column if not exists front_brake text;
alter table specs add column if not exists rear_brake text;
