CREATE TABLE IF NOT EXISTS taxonomies
(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

  CONSTRAINT taxonomies_parent_id_not_self_check
    CHECK (parent_id IS NULL OR parent_id <> id),

  CONSTRAINT taxonomies_name_trimmed_check
    CHECK (name = trim(name)),

  CONSTRAINT taxonomies_name_not_blank_check
    CHECK (length(name) > 0),

  CONSTRAINT taxonomies_parent_id__taxonomies_id_fkey
    FOREIGN KEY (parent_id)
      REFERENCES taxonomies (id)
      ON DELETE CASCADE
);
