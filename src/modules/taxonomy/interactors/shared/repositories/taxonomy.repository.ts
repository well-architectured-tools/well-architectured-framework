import { Taxonomy } from '../../../domain/aggregates/taxonomy.aggregate.js';
import type { Repository } from '../../../../../libs/kernel/index.js';
import { UuidV7 } from '../../../../../libs/ddd/index.js';

export type TaxonomyRepository = Repository<UuidV7, Taxonomy>;
