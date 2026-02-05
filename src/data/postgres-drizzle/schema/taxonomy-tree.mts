import { pgTable, uuid } from 'drizzle-orm/pg-core';

export const taxonomyTree = pgTable('taxonomy_tree', {
  id: uuid('id').primaryKey().notNull(),
  baseTreeId: uuid('base_tree_id').references((): any => taxonomyTree.id, {
    onDelete: 'restrict',
  }),
});
