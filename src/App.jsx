
import { useEffect, useState } from "react";
import "./App.css";

const STORAGE_KEY = "jtronix-task-tracker-tasks";

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (!savedTasks) {
      return [];
    }

    const parsedTasks = JSON.parse(savedTasks);

    if (!Array.isArray(parsedTasks)) {
      return [];
    }

    return parsedTasks.filter(
      (task) =>
        task &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        typeof task.completed === "boolean"
    );
  } catch {
    return [];
  }
}

function App() {
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState(loadTasks);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [tasks]);

  function addTask(event) {
    event.preventDefault();

    const title = taskInput.trim();

    if (!title) {
      setError("Please enter a task before adding.");
      return;
    }

    const newTask = {
      id: crypto.randomUUID(),
      title,
      completed: false,
    };

    setTasks((previousTasks) => [...previousTasks, newTask]);
    setTaskInput("");
    setError("");
    setFilter("All");
  }

  function toggleTask(taskId) {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function deleteTask(taskId) {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== taskId)
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "Completed") {
      return task.completed;
    }

    if (filter === "Pending") {
      return !task.completed;
    }

    return true;
  });

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">✓</span>
          <span>Task Tracker</span>
        </div>
        <span className="header-label">My Workspace</span>
      </header>

      <main className="main-content">
        <section className="welcome">
          <p className="eyebrow">STAY ORGANIZED</p>
          <h1>My Tasks</h1>
          <p className="subtitle">
            Keep track of your work, one task at a time.
          </p>
        </section>

        <section className="task-card">
          <h2>Add a New Task</h2>

          <form className="task-form" onSubmit={addTask}>
            <input
              type="text"
              value={taskInput}
              onChange={(event) => {
                setTaskInput(event.target.value);
                setError("");
              }}
              placeholder="Enter a task..."
              aria-label="Enter a task"
            />

            <button type="submit" className="add-button">
              + Add Task
            </button>
          </form>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          <div className="stats">
            <div className="stat-item">
              <span>Total Tasks</span>
              <strong>{totalTasks}</strong>
            </div>

            <div className="stat-item completed-stat">
              <span>Completed</span>
              <strong>{completedTasks}</strong>
            </div>

            <div className="stat-item pending-stat">
              <span>Pending</span>
              <strong>{pendingTasks}</strong>
            </div>
          </div>

          <div className="section-heading">
            <h2>Tasks</h2>
            <span className="task-count">
              {filteredTasks.length}{" "}
              {filteredTasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>

          <div className="filter-section">
            <span className="filter-label">Filter by:</span>

            <div className="filter-buttons" aria-label="Filter tasks">
              {["All", "Pending", "Completed"].map((filterOption) => (
                <button
                  key={filterOption}
                  type="button"
                  className={`filter-button ${
                    filter === filterOption ? "active-filter" : ""
                  }`}
                  onClick={() => setFilter(filterOption)}
                  aria-pressed={filter === filterOption}
                >
                  {filterOption}
                </button>
              ))}
            </div>

            <span className="save-status" role="status">
              {storageError
                ? "Saving unavailable"
                : "✓ Auto-saving enabled"}
            </span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">☑</div>

              <p className="empty-title">
                {tasks.length === 0
                  ? "No tasks yet"
                  : `No ${filter.toLowerCase()} tasks`}
              </p>

              <p className="empty-description">
                {tasks.length === 0
                  ? "Add your first task using the field above."
                  : "Try another filter to see your tasks."}
              </p>
            </div>
          ) : (
            <ul className="task-list">
              {filteredTasks.map((task) => (
                <li className="task-item" key={task.id}>
                  <input
                    className="task-checkbox"
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} as ${
                      task.completed ? "pending" : "completed"
                    }`}
                  />

                  <span
                    className={`task-title ${
                      task.completed ? "task-completed" : ""
                    }`}
                  >
                    {task.title}
                  </span>

                  <span
                    className={`status-badge ${
                      task.completed
                        ? "status-completed"
                        : "status-pending"
                    }`}
                  >
                    {task.completed ? "Completed" : "Pending"}
                  </span>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete ${task.title}`}
                    title="Delete task"
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="footer">
          Built to make your day more productive.
        </footer>
      </main>
    </div>
  );
}

export default App;
