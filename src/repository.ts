import type { Character, Spell, NewCharacter } from "./types";
import { Log, MeasureTime, ValidateSpellPower } from "./decorators";

export class Repository<T extends { id: number }> {
  private items: T[] = [];

  @Log
  add(item: T): void {
    this.items.push(item);
  }

  @MeasureTime
  findById(id: number): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  getAll(): T[] {
    return [...this.items];
  }

  update(id: number, changes: Partial<T>): boolean {
    const item = this.findById(id);

    if (!item) return false;

    Object.assign(item, changes);
    return true;
  }
}

export class CharacterRepository extends Repository<Character> {
  register(data: NewCharacter): Character {
    const id = Math.max(0, ...this.getAll().map((c) => c.id)) + 1;
    const character: Character = { id, ...data };
    this.add(character);
    return character;
  }
  findByElement(element: Character["element"]): Character[] {
    return this.getAll().filter((character) => character.element === element);
  }
}

export class SpellRepository extends Repository<Spell> {
  @ValidateSpellPower
  override add(spell: Spell): void {
    super.add(spell);
  }
}
