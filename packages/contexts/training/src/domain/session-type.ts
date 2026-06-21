import { InvalidSessionType } from './errors';

// The Hyrox-relevant session types the Classifier assigns.
const SESSION_TYPES = ['run', 'sled', 'burpees', 'mixed'] as const;

export type SessionTypeValue = (typeof SESSION_TYPES)[number];

// Value object: immutable, validated in the factory, compared by value.
export class SessionType {
  private constructor(public readonly value: SessionTypeValue) {}

  static of(value: string): SessionType {
    const normalized = value.trim().toLowerCase();
    if (!SESSION_TYPES.includes(normalized as SessionTypeValue)) {
      throw new InvalidSessionType(value);
    }
    return new SessionType(normalized as SessionTypeValue);
  }

  equals(other: SessionType): boolean {
    return this.value === other.value;
  }
}
