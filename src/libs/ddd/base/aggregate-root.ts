import { Entity } from './entity.js';
import { DomainEvent } from './domain-event.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class AggregateRoot<Props extends Record<string, any>> extends Entity<Props> {
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
