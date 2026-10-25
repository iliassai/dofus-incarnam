export type DofusElement = "Terre" | "Feu" | "Eau" | "Air";

export interface Character {
  id: number;
  name: string;
  element: DofusElement;
  level: number;
  active: boolean;

  // Index signature: dynamic properties must use these value types.
  [key: string]: string | number | boolean;
}

export type SpellCategory = "attack" | "defense" | "healing";

export interface Spell {
  id: number;
  name: string;
  category: SpellCategory;
  power: number;
}

export type GameEvent =
| { type: "spell-cast"; characterId: number; spellName: string }
| { type: "level-up"; characterId: number; newLevel: number }
| { type: "character-banned"; characterId: number };

export type SpellCastEvent = Extract<GameEvent, { type: "spell-cast" }>;

// Conditional type: choose an output type based on the spell category.
export type SpellOutput<T extends SpellCategory> =
T extends "attack" ? number :
T extends "defense" ? boolean :
T extends "healing" ? string :
never;

// infer extracts an array element type.
export type ArrayElement<T> =
T extends (infer Item)[] ? Item : never;

// Utility type examples.
// Omit<Character, "id"> would drop the known keys because of the index signature,
// so we remove "id" with a key-remapping mapped type instead.
export type NewCharacter = {
  [K in keyof Character as K extends "id" ? never : K]: Character[K];
};
export type CharacterSummary = Pick<Character, "id" | "name" | "element">;
export type CharacterUpdate = Partial<Character>;

export type AttackSpell = Extract<Spell, { category: "attack" }>;
export type NonHealingCategory = Exclude<SpellCategory, "healing">;
export type ElementMastery = Record<DofusElement, number>;
