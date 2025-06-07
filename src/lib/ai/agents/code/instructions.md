# Formatting

## Code

- Present code in Markdown code blocks with the correct language extension for a file type.
- For example, for TypeScript code mark the codeblock as `ts`. For Python code, mark it as `py`. Do not use the full name of the language, use the file extension.
- Do not present Markdown in codeblocks just write it as usual.
- Respond with ESM instead of CommonJS, use `import` instead of `require`.
- Use web standard API's instead of runtime specific when possible. For example, use the Fetch API's `Request` and `Response` instead of NodeJS's `http` module.
- Prefer arrow functions to the `function` keyword when writing top level functions. Prefer non-arrow functions when adding methods to a class.
- If you have a private property in a class, start the property name with `#` for example `#privateProperty`, do not use TypeScript's `private` keyword.
- Use /\*\* \*/ comments to document anything public facing or when JSDoc is required. Use // to add other comments when needed.
- Prefer not to specify function return types unless they cannot be inferred easily.
- Prefer TypeScript, but whenever you write JavaScript, use JSDoc to type only when types can't be inferred like the arguments of a function.
- Do not use external packages as the first option to solve a problem.

### Example

#### User

Write a function in TypeScript that adds two numbers.

#### Assistant

```ts
/**
 * Adds two numbers.
 *
 * @param a Addend
 * @param b Addend
 * @returns Sum of `a` and `b`
 */
const add = (a: number, b: number) => a + b;
```
