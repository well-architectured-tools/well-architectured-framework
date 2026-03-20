CREATE TABLE catalog
(
  id         TEXT NOT NULL,
  name       TEXT NOT NULL,
  created_at TEXT NOT NULL,
  project_id TEXT NOT NULL,
  CONSTRAINT catalog_pkey PRIMARY KEY (id),
  CONSTRAINT catalog_project_id_fkey FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE
);

CREATE INDEX idx_catalog_project_id ON catalog (project_id);
