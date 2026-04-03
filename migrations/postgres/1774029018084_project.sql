CREATE TABLE main.project
(
  id         UUID        NOT NULL,
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT project_pkey PRIMARY KEY (id)
);
