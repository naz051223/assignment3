import type { Task } from './taskReducer'
import { FILTER_LABELS } from './filter'
type TaskRowProps = { task: Task; onNext: () => void; onDelete: () => void }
export default function TaskRow({ task, onNext, onDelete }: TaskRowProps) {
  return <li className="task-row">
    <span className={`status-dot ${task.status}`} aria-hidden="true" />
    <span className="task-title">{task.title}</span>
    <span className={`badge ${task.status}`}>{FILTER_LABELS[task.status]}</span>
    <button type="button" onClick={onNext} aria-label={`Advance ${task.title}`}>Next →</button>
    <button type="button" className="delete" onClick={onDelete} aria-label={`Delete ${task.title}`}>Delete</button>
  </li>
}
