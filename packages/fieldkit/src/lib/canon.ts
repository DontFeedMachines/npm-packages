// canon; deterministic json canonicalization for cryptographic signing and verification

export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalize).join(',') + ']';
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalize(obj[k])).join(',') + '}';
}

export function stripSignature<T extends Record<string, unknown>>(obj: T): Omit<T, 'signature'> {
  const { signature, ...rest } = obj;
  return rest;
}
