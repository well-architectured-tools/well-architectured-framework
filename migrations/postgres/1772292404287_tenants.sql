create table waf.tenants
(
  id           uuid primary key,
  external_key text        not null,
  created_at   timestamptz not null default now(),

  constraint tenants_external_key_not_blank_check
    check (char_length(external_key) > 0),

  constraint tenants_external_key_length_check
    check (char_length(external_key) <= 255),

  constraint tenants_external_key_format_check
    check (external_key ~ '^[A-Za-z0-9][A-Za-z0-9_-]*$')
);

create unique index tenants_external_key_uidx
  on waf.tenants (lower(external_key));
