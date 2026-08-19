const EPSILON = 1e-9;

/**
 * Floating-point-safe `value >= threshold`. GPA values come from dividing
 * accumulated quality points by credits, which can land a fraction of a
 * cent below an exact boundary (e.g. 3.7999999999999998 instead of 3.8)
 * even though every displayed value rounds to the same number.
 */
export function isAtLeast(value: number, threshold: number): boolean {
  return value >= threshold - EPSILON;
}

/**
 * Floating-point-safe `value === target`. Summed decimal inputs (e.g. a
 * user's weight percentages split unevenly) can land a fraction of a cent
 * off an exact whole number (e.g. 99.99999999999999 instead of 100).
 */
export function isApproximately(value: number, target: number): boolean {
  return Math.abs(value - target) < EPSILON;
}
