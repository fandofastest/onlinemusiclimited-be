import mongoose from "mongoose";

export function getStringParam(
  value: string | null,
  opts?: { minLen?: number; maxLen?: number; trim?: boolean }
): string | null {
  if (value === null) return null;
  const trimmed = opts?.trim === false ? value : value.trim();
  if (opts?.minLen !== undefined && trimmed.length < opts.minLen) return null;
  if (opts?.maxLen !== undefined && trimmed.length > opts.maxLen) return null;
  return trimmed;
}

export function parsePositiveInt(value: string | null): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export function getEnumParam<T extends readonly string[]>(
  value: string | null,
  allowed: T
): T[number] | null {
  if (!value) return null;
  const v = value.trim();
  return (allowed as readonly string[]).includes(v) ? (v as T[number]) : null;
}
