  Type Safety Rules

  1. Never use any type - Always use specific types or unknown with type guards
  // ❌ Bad
  catch (error: any) { }

  // ✅ Good  
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
  }
  2. Use type guards for unknown types
  // ✅ Always check types before accessing properties
  if (data && typeof data === 'object' && 'property' in data) {
    // Safe to access data.property
  }

  Variable & Import Rules

  3. Remove unused imports immediately - Don't import what you don't use
  4. Remove unused variables - If a variable isn't used, delete it entirely
  5. Use underscore prefix for intentionally unused parameters
  // ✅ For required but unused parameters
  function handler(_event: Event) { }

  Expression Rules

  6. Don't write standalone expressions - Every statement should have purpose
  // ❌ Bad
  someVariable; // Just sitting there doing nothing

  // ✅ Good
  console.log(someVariable); // Actually using it
  7. Use optional chaining instead of logical AND
  // ❌ Bad
  callback && callback(data);

  // ✅ Good
  callback?.(data);

  React Hooks Rules

  8. Always include all dependencies in useEffect/useCallback
  // ✅ Include ALL dependencies
  useEffect(() => {
    doSomething(value);
  }, [value]); // Don't forget dependencies
  9. Use const by default - Only use let when reassignment is needed

  Error Handling Rules

  10. Handle errors properly with type safety
  // ✅ Safe error handling
  try {
    // code
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(message);
  }

  React/HTML Rules

  11. Escape quotes in JSX - Use &quot; or switch quote types
  // ❌ Bad
  <div>He said "Hello"</div>

  // ✅ Good
  <div>He said &quot;Hello&quot;</div>
  // or
  <div>He said 'Hello'</div>

  File Organization Rules

  12. No duplicate files - Check for existing similar files before creating
  13. Clean up placeholder/TODO code - Remove unused parameters and imports from unfinished code

  General Principles

  - Write type-safe code from the start - Don't add types as an afterthought
  - Every line should have a purpose - No dead code or unused declarations
  - Follow the principle of least privilege - Use the most specific types possible
  - Prefer explicit over implicit - Make intentions clear through proper typing