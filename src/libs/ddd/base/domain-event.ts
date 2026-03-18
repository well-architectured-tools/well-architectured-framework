import { DateTime } from '../value-objects/date-time.value-object.js';

export abstract class DomainEvent<TData> {
  protected readonly _dateTimeOccurred: DateTime;
  protected readonly eventData: TData;

  protected constructor(eventData: TData) {
    this._dateTimeOccurred = DateTime.createNow();
    this.eventData = Object.freeze(eventData);
  }

  get dateTimeOccurred(): string {
    return this._dateTimeOccurred.iso;
  }
}
