import { TaskStore } from './store.js';

const store      = new TaskStore();
let filter       = 'all';
let sortMode     = 'order';
let dragId       = null;

const input      = document.getElementById('taskInput');
const addBtn     = document.getElementById('addBtn');
const list       = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('[data-filter]');
const sortSelect = document.getElementById('sortSelect');
const counter    = document.getElementById('counter');

store.subscribe(tasks => {
  const visible = store.getFiltered(filter, sortMode);
  list.innerHTML = '';
  visible.forEach(task => list.appendChild(createItem(task)));
  counter.textContent = tasks.filter(t => !t.completed).length + ' remaining';
});

function createItem(task) {
  const li = document.createElement('li');
  li.className = `task-item priority-${task.priority}`;
  li.dataset.id = task.id;
  li.draggable = true;
  li.setAttribute('role', 'listitem');
  if (task.completed) li.classList.add('completed');

  li.innerHTML = `
    <button class="check-btn" aria-label="Mark complete" aria-pressed="${task.completed}">
      ${task.completed ? '✅' : '⬜'}
    </button>
    <span class="task-text">${task.text}</span>
    <span class="badge badge-${task.priority}">${task.priority}</span>
    <button class="edit-btn"   aria-label="Edit task">✏️</button>
    <button class="delete-btn" aria-label="Delete task">🗑️</button>
  `;

  li.querySelector('.check-btn').onclick = () => store.toggle(task.id);

  const span = li.querySelector('.task-text');
  li.querySelector('.edit-btn').onclick = () => {
    span.contentEditable = 'true'; span.focus();
    span.onblur = () => {
      span.contentEditable = 'false';
      store.edit(task.id, span.textContent);
    };
  };

  li.querySelector('.delete-btn').onclick = () => store.remove(task.id);

  li.addEventListener('dragstart', e => {
    dragId = task.id;
    e.dataTransfer.effectAllowed = 'move';
    li.classList.add('dragging');
  });
  li.addEventListener('dragend',  () => li.classList.remove('dragging'));
  li.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
  li.addEventListener('drop',     e => { e.preventDefault(); if (dragId !== task.id) store.reorder(dragId, task.id); });

  return li;
}

addBtn.addEventListener('click', () => {
  const text = input.value.trim();
  const pri  = document.getElementById('prioritySelect').value;
  if (!text) { input.focus(); return; }
  store.add(text, pri);
  input.value = '';
});
input.addEventListener('keydown', e => e.key === 'Enter' && addBtn.click());

filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filter = btn.dataset.filter;
  filterBtns.forEach(b => b.removeAttribute('aria-current'));
  btn.setAttribute('aria-current', 'true');
}));

sortSelect.addEventListener('change', e => { sortMode = e.target.value; });