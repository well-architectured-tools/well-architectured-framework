import { Project } from '../../../domain/aggregates/project.aggregate.js';
import type { Repository } from '../../../../../libs/kernel/index.js';
import { UuidV7 } from '../../../../../libs/ddd/index.js';

export interface ProjectRepository extends Repository<UuidV7, Project> {}
