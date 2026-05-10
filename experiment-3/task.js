export class Task {
  #id; #text; #completed; #priority; #createdAt; #order;

  constructor({ text, priority = 'medium', id, completed, createdAt, order }) {
    this.#id        = id        ?? crypto.randomUUID();
    this.#text      = text;
    this.#completed = completed ?? false;
    this.#priority  = priority;
    this.#createdAt = createdAt ?? Date.now();
    this.#order     = order     ?? this.#createdAt;
  }

  get id()        { return this.#id; }
  get text()      { return this.#text; }
  get completed() { return this.#completed; }
  get priority()  { return this.#priority; }
  get order()     { return this.#order; }
  set order(v)    { this.#order = v; }

  toggle()  { this.#completed = !this.#completed; }
  edit(txt) { this.#text = txt.trim(); }

  toJSON() {
    return {
      id: this.#id, text: this.#text, completed: this.#completed,
      priority: this.#priority, createdAt: this.#createdAt, order: this.#order
    };
  }

  static fromJSON(obj) { return new Task(obj); }
}