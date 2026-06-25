import Dexie, { type Table } from "dexie";
import type { Eloge } from "./types";

class ElogeDB extends Dexie {
  eloges!: Table<Eloge, string>;

  constructor() {
    super("l-eloge");
    this.version(1).stores({
      // primary key id; index createdAt for serene reverse-chronological reading
      eloges: "id, createdAt, type",
    });
  }
}

export const db = new ElogeDB();

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function saveEloge(
  input: Omit<Eloge, "id" | "createdAt" | "updatedAt"> & { id?: string },
): Promise<string> {
  const now = Date.now();
  if (input.id) {
    const existing = await db.eloges.get(input.id);
    if (existing) {
      await db.eloges.put({
        ...existing,
        type: input.type,
        subject: input.subject,
        text: input.text,
        shapedBy: input.shapedBy,
        updatedAt: now,
      });
      return input.id;
    }
  }
  const id = input.id ?? newId();
  await db.eloges.put({
    id,
    type: input.type,
    subject: input.subject,
    text: input.text,
    shapedBy: input.shapedBy,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function deleteEloge(id: string): Promise<void> {
  await db.eloges.delete(id);
}
