---
paths:
  - "src/app/**/*.tsx"
  - "src/components/**/*.tsx"
---

# Forms

Forms use `react-hook-form`, `@hookform/resolvers/zod`, and `zod`.

## Rules

1. Define a Zod schema next to the form unless it is shared by multiple forms.
2. Infer form value types with `z.infer<typeof schema>`.
3. Use `zodResolver(schema)` in `useForm`.
4. Use UI form primitives from `src/components/ui/form.tsx`.
5. Keep submit state explicit with `isLoading` or equivalent.
6. Surface validation errors through `FormMessage`.
7. Do not put API/network side effects inside presentational subcomponents; keep them in the form/page orchestration component.
