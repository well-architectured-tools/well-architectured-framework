-- Up Migration

create table taxonomies
(
  tenant_id  uuid        not null,
  id         uuid        not null,
  name       text        not null,
  parent_id  uuid null,
  created_at timestamptz not null default now(),

  constraint taxonomies_tenant_id_id_pkey
    primary key (tenant_id, id),

  constraint taxonomies_parent_id_not_self_check
    check (parent_id is null or parent_id <> id),

  constraint taxonomies_name_not_blank_check
    check (length(btrim(name)) > 0),

  constraint taxonomies_tenant_id_parent_id__taxonomies_tenant_id_id_fkey
    foreign key (tenant_id, parent_id)
      references taxonomies (tenant_id, id)
      on delete restrict
);

create index taxonomies_tenant_id_parent_id_idx
  on taxonomies (tenant_id, parent_id);

create unique index taxonomies_tenant_id_name_lower_uidx
  on taxonomies (tenant_id, lower(btrim(name)));

-- Down Migration
