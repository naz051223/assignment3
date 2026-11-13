import { useReducer, type Dispatch } from 'react'
import { taskReducer, initialState, type Task, type Action } from './taskReducer'
import { FILTERS, FILTER_LABELS, countByFilter, filterTasks, type Filter } from './filter'
import TaskRow from './TaskRow'
import './styles.css'

function AddForm({ dispatch }: { dispatch: Dispatch<Action> }) {
  function addTask(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim()
    if (title) dispatch({ type: 'add', id: crypto.randomUUID(), title })
  }
  return (
    <form action={addTask} className="add-form">
      <label htmlFor="title">What needs to get done?</label>
      <div className="input-row">
        <input id="title" name="title" placeholder="Write a task and make a little progress..." required maxLength={200} />
        <button className="primary" type="submit">+ Add task</button>
      </div>
      <p className="hint">New tasks start in To do. Use Next to move them forward.</p>
    </form>
  )
}
function FilterBar({ filter, counts, dispatch }: {
  filter: Filter; counts: Record<Filter, number>; dispatch: Dispatch<Action>
}) {
  return <nav className="filters" aria-label="Filter tasks by status">
    {FILTERS.map((item) => <button key={item} type="button"
      aria-pressed={filter === item} className={filter === item ? 'filter active' : 'filter'}
      onClick={() => dispatch({ type: 'setFilter', filter: item })}>
      {FILTER_LABELS[item]} <span className="count">({counts[item]})</span>
    </button>)}
  </nav>
}
function TaskList({ tasks, dispatch }: { tasks: Task[]; dispatch: Dispatch<Action> }) {
  return tasks.length ? <ul className="task-list">
    {tasks.map((task) => <TaskRow key={task.id} task={task}
      onNext={() => dispatch({ type: 'advance', id: task.id })}
      onDelete={() => dispatch({ type: 'remove', id: task.id })} />)}
  </ul> : <div className="empty"><span aria-hidden="true">✓</span><h3>No tasks here.</h3>
    <p>Add a task above or choose another filter.</p></div>
}
export default function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState)
  const counts = countByFilter(state.tasks)
  const visible = filterTasks(state.tasks, state.filter)
  return <main className="shell">
    <header><div className="brand"><span className="brand-mark" aria-hidden="true">✓</span> SMALL STEPS</div>
      <span className="course">SEN0415 / ASSIGNMENT 03</span></header>
    <section className="intro"><p className="eyebrow">A LITTLE FOCUS, EVERY DAY</p>
      <h1>Task Manager<span>.</span></h1><p>Make a plan. Move it forward. See your progress.</p></section>
    <section className="board" aria-label="Task manager">
      <AddForm dispatch={dispatch} />
      <div className="board-toolbar"><h2>Your tasks <span>{counts.all}</span></h2>
        <div className="tools"><button type="button" disabled={!state.past.length}
          onClick={() => dispatch({ type: 'undo' })}>↶ Undo</button>
          <button type="button" disabled={!counts.done} onClick={() => dispatch({ type: 'clearDone' })}>Clear done</button></div>
      </div>
      <FilterBar filter={state.filter} counts={counts} dispatch={dispatch} />
      <div role="status" className="list-summary">Showing {visible.length} of {counts.all} tasks <span>{FILTER_LABELS[state.filter]}</span></div>
      <TaskList tasks={visible} dispatch={dispatch} />
      <div className="board-footer"><span>{counts.done} of {counts.all} completed</span>
        <span>To do → In progress → Done → To do</span></div>
    </section>
    <footer>Tuba Nazlı İpekyüz <span>2200004323 · Advanced Web Programming</span></footer>
  </main>
}
