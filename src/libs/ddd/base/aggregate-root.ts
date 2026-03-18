import { Entity } from './entity.js';
import { DomainEvent } from './domain-event.js';

export abstract class AggregateRoot<TProps extends Record<string, unknown>> extends Entity<TProps> {
  protected uncommittedDomainEvents: DomainEvent<unknown>[] = [];

  pullDomainEvents(): DomainEvent<unknown>[] {
    const events: DomainEvent<unknown>[] = [...this.uncommittedDomainEvents];
    this.uncommittedDomainEvents = [];
    return events;
  }

  protected addDomainEvent(domainEvent: DomainEvent<unknown>): void {
    this.uncommittedDomainEvents.push(domainEvent);
  }
}
