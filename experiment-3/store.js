import { Task } from './task.js';

export class TaskStore {
  #key = 'todo_tasks';
  #tasks = [];
  #listeners = [];

  constructor() { this.#load(); }

  #load() {
    const raw = localStorage.getItem(this.#key);
    this.#tasks = raw ? JSON.parse(raw).map(Task.fromJSON) : [];
  }
  #save() {
    localStorage.setItem(this.#key, JSON.stringify(this.#tasks.map(t => t.toJSON())));
    this.#notify();
  }
  #notify() { this.#listeners.forEach(fn => fn(this.#tasks)); }

  subscribe(fn) { this.#listeners.push(fn); fn(this.#tasks); }

  add(text, priority) {
    this.#tasks.push(new Task({ text, priority })); this.#save();
  }
  remove(id) {
    this.#tasks = this.#tasks.filter(t => t.id !== id); this.#save();
  }
  toggle(id) {
    this.#tasks.find(t => t.id === id)?.toggle(); this.#save();
  }
  edit(id, text) {
    this.#tasks.find(t => t.id === id)?.edit(text); this.#save();
  }
  reorder(dragId, dropId) {
    const drag = this.#tasks.find(t => t.id === dragId);
    const drop = this.#tasks.find(t => t.id === dropId);
    if (!drag || !drop) return;
    [drag.order, drop.order] = [drop.order, drag.order];
    this.#tasks.sort((a, b) => a.order - b.order);
    this.#save();
  }
  getFiltered(filter, sort) {
    let tasks = [...this.#tasks];
    if (filter === 'active')    tasks = tasks.filter(t => !t.completed);
    if (filter === 'completed') tasks = tasks.filter(t =>  t.completed);
    if (sort === 'priority') {
      const w = { high: 0, medium: 1, low: 2 };
      tasks.sort((a, b) => w[a.priority] - w[b.priority]);
    } else {
      tasks.sort((a, b) => a.order - b.order);
    }
    return tasks;
  }
}