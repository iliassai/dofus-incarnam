# Dofus Incarnam — TypeScript Mini Project

   A small terminal project (Dofus theme) to practice:

- Generics and generic constraints
   - Utility types: `Pick`, `Omit`, `Partial`, `Record`, `Parameters`, `ReturnType`, `Extract`, `Exclude`
   - Conditional types, `infer` and index signatures
   - Type guards and discriminated unions
   - Legacy TypeScript method decorators (`target`, `propertyKey`, `descriptor`)

   ## Requirements

   - [Bun](https://bun.sh) 1.x

   ## Setup

   ```bash
   bun install
   ```

   ## Run

   ```bash
   bun start
   ```

   ## Type-check

   ```bash
   bun run typecheck
   ```

   If `bun check` is not available in your Bun version, use `bunx tsc --noEmit`.

   ## Project structure

   ```
   src/
     types.ts        Types: Character, Spell, GameEvent, utility and conditional types
     decorators.ts   Log, MeasureTime, ValidateSpellPower, Cache
     repository.ts   Generic Repository<T>, CharacterRepository, SpellRepository
     main.ts         Service, type guards and a demo of every exercise
   ```

