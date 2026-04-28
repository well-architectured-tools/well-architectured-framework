create schema enrich;

CREATE TABLE enrich.project
(
  id         UUID        NOT NULL,
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT project_pkey PRIMARY KEY (id)
);

CREATE TABLE enrich.catalog
(
  id         UUID        NOT NULL,
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  project_id UUID        NOT NULL,
  CONSTRAINT catalog_pkey PRIMARY KEY (id),
  CONSTRAINT catalog_project_id_fkey FOREIGN KEY (project_id) REFERENCES enrich.project (id) ON DELETE CASCADE
);

CREATE INDEX idx_catalog_project_id ON enrich.catalog (project_id);
