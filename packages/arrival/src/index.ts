/**
 * @dappsnap/arrival
 *
 * A clean, abstract S-expression serialization library with custom protocol support.
 *
 * Features:
 * - Convert JavaScript objects to S-expressions
 * - Support for custom serialization via Symbol.toSymbolicExpression
 * - Proper formatting with indentation
 * - Type-safe with TypeScript
 *
 * Basic usage:
 * ```typescript
 * import { toSExpr, formatSExpr, TO_SEXPR, SEXPR_TAG, sexpr } from '@dappsnap/arrival';
 *
 * // Simple conversion
 * const expr = toSExpr({ name: "test", value: 42 });
 * console.log(formatSExpr(expr));
 * // Output: (map :name "test" :value 42)
 *
 * // Custom serialization
 * class MyClass {
 *   [TO_SEXPR]() {
 *     return [SEXPR_TAG, 'my-class', this.data];
 *   }
 * }
 * ```
 */

export {
  formatSExpr,
  // Helpers
  sexpr, SEXPR_TAG, slist, smap, TO_SEXPR,
  // Core functions
  toSExpr, toSExprString,
  // Types
  type SExpr,
  type SExprDefinition
} from "./serializer";

// LIPS engine
export { Environment, exec, env as lipsGlobalEnv } from "lips";

// Sandboxed environment with Fantasy Land and Ramda
export { createSandboxedEnvironment, sandboxedEnv } from "./enhanced-environment";
export { RAMDA_FUNCTIONS } from "./ramda-functions";

// Fantasy Land LIPS integration
export { applyFantasyLandPatches } from "./fantasy-land-lips";

// Rosetta Environment (seamless LIPS ↔ JS interop)
export {
  createRosettaWrapper, jsToLips, lipsToJs, type RosettaFunction
} from "./rosetta-environment";

// Serialized execution wrapper
export { execSerialized } from "./execSerialized";

// Re-export everything for convenience
export * from "./serializer";
