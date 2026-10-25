import {
  type Character,
  type Spell,
  type GameEvent,
  type SpellCastEvent,
  type DofusElement,
  type ElementMastery,
  type SpellCategory,
  type SpellOutput,
  type ArrayElement,
  type CharacterSummary,
  type CharacterUpdate,
  type AttackSpell,
  type NonHealingCategory,
} from "./types";

import { CharacterRepository, SpellRepository } from "./repository";
import { Log, Cache } from "./decorators";

const validElements: readonly DofusElement[] = ["Terre", "Feu", "Eau", "Air"];

// "value is DofusElement" is a type predicate.
function isElement(value: unknown): value is DofusElement {
  return typeof value === "string" && validElements.some((element) => element === value);
}

// Type guard: safely narrow unknown data to a Character.
function isCharacter(value: unknown): value is Character {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    typeof isElement(candidate.element) &&
    typeof candidate.level === "number" &&
    typeof candidate.active === "boolean"
  );
}

function handleSpellCast(event: SpellCastEvent): void {
  console.log(`Character ${event.characterId} cast ${event.spellName}`);
}

class SpellCalculator {
  @Cache
  calculatePower(basePower: number, multiplier: number): number {
    console.log("Calculating...");
    return basePower * multiplier;
  }
}

class GameService {
  constructor(
    private readonly characters: CharacterRepository,
    private readonly spells: SpellRepository,
  ) {}

  @Log
  castSpell(characterId: number, spellId: number): string {
    const character = this.characters.findById(characterId);
    const spell = this.spells.findById(spellId);

    if (!character || !spell) {
      throw new Error("Character or spell not found");
    }

    return `${character.name} casts ${spell.name}!`;
  }

  findByElement(element: DofusElement): CharacterSummary[] {
    return this.characters
      .findByElement(element)
      .map(({ id, name, element }) => ({ id, name, element }));
  }

  updateCharacter(id: number, changes: CharacterUpdate): boolean {
    return this.characters.update(id, changes);
  }

  getSpellEvents(events: GameEvent[]): SpellCastEvent[] {
    return events.filter((event): event is SpellCastEvent => event.type === "spell-cast");
  }
}

const characters = new CharacterRepository();
const spells = new SpellRepository();

characters.add({
  id: 1,
  name: "Tristepin",
  element: "Terre",
  level: 150,
  active: true,
  characterClass: "Iop",
});

characters.add({
  id: 2,
  name: "Evangelyne",
  element: "Air",
  level: 180,
  active: true,
});

characters.add({
  id: 3,
  name: "Amalia",
  element: "Eau",
  level: 120,
  active: true,
});

spells.add({
  id: 101,
  name: "Colère de Iop",
  category: "attack",
  power: 80,
});

spells.add({
  id: 102,
  name: "Armure Terrestre",
  category: "defense",
  power: 60,
});

const game = new GameService(characters, spells);

console.log("\n--- Cast a spell ---");
console.log(game.castSpell(1, 101));

console.log("\n--- Find characters by element ---");
console.log(game.findByElement("Terre"));

console.log("\n--- Update a character ---");
game.updateCharacter(1, { level: 151 });
console.log(characters.findById(1));

console.log("\n--- Type guard ---");
const unknownCharacter: unknown = characters.findById(1);
if (isCharacter(unknownCharacter)) {
  console.log(`${unknownCharacter.name} plays element ${unknownCharacter.element}`);
}

console.log("\n--- Record utility type ---");
const mastery: ElementMastery = {
  Terre: 100,
  Feu: 80,
  Eau: 90,
  Air: 70,
};
console.log(mastery);

console.log("\n--- Extract spell-cast events ---");
const events: GameEvent[] = [
  { type: "spell-cast", characterId: 1, spellName: "Bond" },
  { type: "level-up", characterId: 2, newLevel: 181 },
  { type: "character-banned", characterId: 3 },
];
console.log(game.getSpellEvents(events));

console.log("\n--- Ex 1: register a new character (no id given) ---");
const newcomer = characters.register({
  name: "Yugo",
  element: "Feu",
  level: 1,
  active: true,
});
console.log(newcomer);
// characters.register({}); // compile error: name, element, level, active are required

console.log("\n--- Ex 2: findByElement on the repository ---");
console.log(characters.findByElement("Terre"));
console.log(characters.findByElement("Feu"));
// characters.findByElement("Cra"); // compile error: not a valid element

console.log("\n--- Ex 3: handleSpellCast only accepts spell-cast events ---");
handleSpellCast({
  type: "spell-cast",
  characterId: 1,
  spellName: "Colère de Iop",
});
// handleSpellCast({ type: "level-up", characterId: 2, newLevel: 181 }); // compile error

console.log("\n--- Ex 4: ValidateSpellPower ---");
spells.add({
  id: 103,
  name: "Mot Soignant",
  category: "healing",
  power: 50,
});

try {
  spells.add({
    id: 104,
    name: "Sort Invalide",
    category: "attack",
    power: -10,
  });
} catch (error: unknown) {
  console.log("Rejected:", error instanceof Error ? error.message : error);
}
console.log("Spells stored:", spells.getAll().length);

console.log("\n--- Ex 5: Cache decorator ---");
const calculator = new SpellCalculator();
console.log(calculator.calculatePower(10, 3));
console.log(calculator.calculatePower(10, 3));
console.log(calculator.calculatePower(5, 2));

console.log("\n--- Ex 6: stricter type guard ---");
const validData: unknown = {
  id: 1,
  name: "Tristepin",
  element: "Terre",
  level: 150,
  active: true,
};

const invalidData: unknown = {
  id: 2,
  name: "Ogrest",
  element: "Ombre",
  level: 200,
  active: true,
};

console.log(isCharacter(validData)); // true
console.log(isCharacter(invalidData)); // false

// Compile-time demonstrations: these aliases are checked by TypeScript.
type CastArguments = Parameters<GameService["castSpell"]>;
type CastResult = ReturnType<GameService["castSpell"]>;
type AttackOutput = SpellOutput<"attack">; // number
type HealingOutput = SpellOutput<"healing">; // string
type SpellItem = ArrayElement<Spell[]>; // Spell
type AttackSpellExample = AttackSpell;
type RemainingCategories = NonHealingCategory;
type CategoryExample = SpellCategory;

const typeExamples:
  | [
      CastArguments,
      CastResult,
      AttackOutput,
      HealingOutput,
      SpellItem,
      AttackSpellExample["category"],
      RemainingCategories,
      CategoryExample,
    ]
  | null = null;

void typeExamples;
