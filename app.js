// 待辦清單使用原生 JavaScript，資料儲存在瀏覽器的 localStorage。
const STORAGE_KEY = 'my-copilot-workshop-todos';
const THEME_KEY = 'my-copilot-workshop-theme';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const remainingCount = document.getElementById('remaining-count');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');
const filterButtons = document.querySelectorAll('.btn-filter');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

let currentFilter = 'all';

// 只接受欄位完整且型別正確的資料，避免舊資料或損毀資料影響畫面。
function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((todo) =>
      todo &&
      typeof todo.id === 'string' &&
      typeof todo.text === 'string' &&
      typeof todo.completed === 'boolean'
    );
  } catch (error) {
    console.warn('讀取待辦事項失敗，將以空清單開始。', error);
    return [];
  }
}

let todos = loadTodos();

// 將目前清單寫入 localStorage。
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 套用指定主題並更新切換按鈕。
function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  themeIcon.textContent = isDark ? '☀️' : '🌙';
  themeLabel.textContent = isDark ? '淺色模式' : '深色模式';
  themeToggle.setAttribute('aria-pressed', String(isDark));
}

// 優先使用手動選擇，沒有儲存選擇時跟隨作業系統設定。
function initializeTheme() {
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem(THEME_KEY);
  } catch (error) {
    console.warn('讀取主題設定失敗，將跟隨作業系統設定。', error);
  }

  if (savedTheme === 'light' || savedTheme === 'dark') {
    applyTheme(savedTheme);
    return;
  }

  applyTheme(systemTheme.matches ? 'dark' : 'light');
  systemTheme.addEventListener('change', (event) => {
    applyTheme(event.matches ? 'dark' : 'light');
  });
}

// 取得目前篩選條件符合的待辦事項。
function getVisibleTodos() {
  if (currentFilter === 'active') {
    return todos.filter((todo) => !todo.completed);
  }
  if (currentFilter === 'completed') {
    return todos.filter((todo) => todo.completed);
  }
  return todos;
}

// 依照篩選條件提供相符的空清單提示。
function getEmptyMessage() {
  if (currentFilter === 'all' && todos.length === 0) {
    return '還沒有任何待辦事項,新增一個吧!';
  }
  if (currentFilter === 'active') {
    return todos.length > 0 ? '太棒了，沒有未完成的事項！' : '目前沒有未完成的事項。';
  }
  if (currentFilter === 'completed') {
    return '目前沒有已完成的事項。';
  }
  return '目前沒有符合條件的待辦事項。';
}

// 依照篩選結果更新清單、空狀態與整體未完成數量。
function render() {
  const visibleTodos = getVisibleTodos();
  list.replaceChildren();

  visibleTodos.forEach((todo) => {
    const item = document.createElement('li');
    item.className = todo.completed ? 'todo-item completed' : 'todo-item';
    item.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.className = 'todo-checkbox';
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `標記「${todo.text}」為完成`);

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn-delete';
    deleteButton.type = 'button';
    deleteButton.textContent = '×';
    deleteButton.setAttribute('aria-label', `刪除「${todo.text}」`);

    item.append(checkbox, text, deleteButton);
    list.append(item);
  });

  emptyState.textContent = getEmptyMessage();
  emptyState.hidden = visibleTodos.length !== 0;
  remainingCount.textContent = `未完成:${todos.filter((todo) => !todo.completed).length} 項`;
}

// 新增待辦並產生唯一識別碼。
function addTodo(text) {
  todos.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text,
    completed: false,
  });
  saveTodos();
  render();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }

  addTodo(text);
  input.value = '';
  input.focus();
});

themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
});

// 切換篩選條件時同步按鈕狀態與清單內容。
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle('is-active', isActive);
      filterButton.setAttribute('aria-pressed', String(isActive));
    });

    render();
  });
});

// 透過事件委派處理勾選與刪除。
list.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const item = event.target.closest('.todo-item');
  if (!item) {
    return;
  }

  const { id } = item.dataset;
  if (!id) {
    return;
  }

  if (event.target.matches('.todo-checkbox')) {
    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  } else if (event.target.matches('.btn-delete')) {
    todos = todos.filter((todo) => todo.id !== id);
  } else {
    return;
  }

  saveTodos();
  render();
});

initializeTheme();
render();
