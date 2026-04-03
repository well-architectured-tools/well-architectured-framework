CREATE TABLE main.catalog
(
  id         UUID        NOT NULL,
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  project_id UUID        NOT NULL,
  CONSTRAINT catalog_pkey PRIMARY KEY (id),
  CONSTRAINT catalog_project_id_fkey FOREIGN KEY (project_id) REFERENCES main.project (id) ON DELETE CASCADE
);

CREATE INDEX idx_catalog_project_id ON main.catalog (project_id);
