create table waf.taxonomies
(
  id         uuid primary key,
  name       text        not null,
  parent_id  uuid,
  created_at timestamptz not null default now(),

  constraint taxonomies_parent_id_not_self_check
    check (parent_id is null or parent_id <> id),

  constraint taxonomies_name_trimmed_check
    check (name = btrim(name)),

  constraint taxonomies_name_not_blank_check
    check (char_length(name) > 0),

  constraint taxonomies_parent_id__taxonomies_id_fkey
    foreign key (parent_id)
      references waf.taxonomies (id)
      on delete cascade
);
