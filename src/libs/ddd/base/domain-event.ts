import { DateTime } from '../value-objects/date-time.value-object.js';

export abstract class DomainEvent<T> {
  protected readonly _dateTimeOccurred: DateTime;
  protected readonly eventData: T;

  protected constructor(eventData: T) {
    this._dateTimeOccurred = DateTime.createNow();
    this.eventData = Object.freeze(eventData);
  }

  get dateTimeOccurred(): string {
    return this._dateTimeOccurred.iso;
  }
}
