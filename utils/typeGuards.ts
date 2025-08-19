// Type guard utility functions for safe type checking

/**
 * Check if a value is truthy (handles various database return types)
 * Supports: boolean true, string 'true'/'1', number 1
 */
export function isTrue(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }
  if (typeof value === 'number') return value === 1;
  return false;
}

/**
 * Check if a value is falsy (handles various database return types)
 * Supports: boolean false, string 'false'/'0', number 0, null, undefined
 */
export function isFalse(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'boolean') return !value;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === '';
  }
  if (typeof value === 'number') return value === 0;
  return false;
}

/**
 * Convert any value to boolean safely
 */
export function toBoolean(value: unknown): boolean {
  return isTrue(value);
}

/**
 * Check if a value is a valid string and not empty
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if a value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Safely parse a number from various input types
 */
export function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Check if an object has a specific property
 */
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}

/**
 * Type guard for checking if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for arrays
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Safe JSON parse with type guard
 */
export function parseJSON<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}