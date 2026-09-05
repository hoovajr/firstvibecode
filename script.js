const STORAGE_KEY = "productivity-garden-tasks";

const PLANT_STAGES = {
  flower: ["🌱", "🌿", "🌼"],
  tree: ["🌱", "🌿", "🌳"],
  succulent: ["🌱", "🌿", "🌵"],
  mushroom: ["🌱", "🍂", "🍄"],
};

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const typeSelect = document.getElementById("task-type");
const taskList = document.getElementById("task-list");
const garden = document.getElementById("garden");
const gardenEmpty = document.getElementById("garden-empty");
const resetBtn = document.getElementById("reset-btn");

const statCompleted = document.getElementById("stat-completed");
const statStreak = document.getElementById("stat-streak");
const statPending = document.getElementById("stat-pending");

let tasks = loadTasks();

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function todayStr(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function finalEmoji(type) {
  const stages = PLANT_STAGES[type] || PLANT_STAGES.flower;
  return stages[stages.length - 1];
}

function render() {
  // Task list
  taskList.innerHTML = "";
  if (tasks.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-list";
    li.textContent = "No seeds planted yet. Add a task above!";
    taskList.appendChild(li);
  } else {
    tasks
      .slice()
      .reverse()
      .forEach((task) => {
        const li = document.createElement("li");
        li.className = "task-item" + (task.done ? " done" : "");

        const checkbox = document.createElement("button");
        checkbox.className = "task-checkbox";
        checkbox.textContent = task.done ? "✓" : "";
        checkbox.title = task.done ? "Mark as not done" : "Mark as done";
        checkbox.addEventListener("click", () => toggleTask(task.id));

        const emoji = document.createElement("span");
        emoji.className = "task-emoji";
        emoji.textContent = (PLANT_STAGES[task.type] || PLANT_STAGES.flower)[0];

        const text = document.createElement("span");
        text.className = "task-text";
        text.textContent = task.text;

        const del = document.createElement("button");
        del.className = "task-delete";
        del.textContent = "✕";
        del.title = "Delete task";
        del.addEventListener("click", () => deleteTask(task.id));

        li.appendChild(checkbox);
        li.appendChild(emoji);
        li.appendChild(text);
        li.appendChild(del);
        taskList.appendChild(li);
      });
  }

  // Garden
  const completedTasks = tasks.filter((t) => t.done);
  garden.innerHTML = "";
  if (completedTasks.length === 0) {
    garden.appendChild(gardenEmpty);
  } else {
    completedTasks.forEach((task) => {
      const span = document.createElement("span");
      span.className = "plant";
      span.textContent = finalEmoji(task.type);
      span.title = task.text;
      garden.appendChild(span);
    });
  }

  // Stats
  statCompleted.textContent = completedTasks.length;
  statPending.textContent = tasks.filter((t) => !t.done).length;
  statStreak.textContent = computeStreak(completedTasks);
}

function computeStreak(completedTasks) {
  const days = new Set(completedTasks.map((t) => t.completedOn).filter(Boolean));
  if (days.size === 0) return 0;

  let streak = 0;
  let cursor = new Date();
  while (true) {
    const key = todayStr(cursor);
    if (days.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function addTask(text, type) {
  tasks.push({
    id: Date.now() + Math.random().toString(36).slice(2),
    text,
    type,
    done: false,
    completedOn: null,
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.done = !task.done;
  task.completedOn = task.done ? todayStr() : null;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text, typeSelect.value);
  input.value = "";
  input.focus();
});

resetBtn.addEventListener("click", () => {
  if (confirm("Clear your whole garden and task list? This cannot be undone.")) {
    tasks = [];
    saveTasks();
    render();
  }
});

render();
