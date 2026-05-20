import { Transform } from 'class-transformer';

export function Trim() {
  return Transform(({ value, obj, key }) => {
    const originalValue =
      obj && typeof key === 'string' && key in obj
        ? (obj as Record<string, unknown>)[key]
        : value;

    if (typeof originalValue === 'string') {
      return originalValue.trim();
    }

    return originalValue;
  });
}
