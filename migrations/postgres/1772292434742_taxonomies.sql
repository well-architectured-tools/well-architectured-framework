create table waf.taxonomies
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

  constraint taxonomies_name_trimmed_check
    check (name = btrim(name)),

  constraint taxonomies_name_not_blank_check
    check (char_length(name) > 0),

  constraint taxonomies_tenant_id_parent_id__taxonomies_tenant_id_id_fkey
    foreign key (tenant_id, parent_id)
      references waf.taxonomies (tenant_id, id)
      on delete restrict,

  constraint taxonomies_tenant_id__tenants_id_fkey
    foreign key (tenant_id)
      references waf.tenants (id)
      on delete restrict
);

create unique index taxonomies_tenant_id_name_uidx
  on waf.taxonomies (tenant_id, lower(name));
