// Full name: Tuba Nazlı İpekyüz | Student number: 2200004323
import type { Filter } from './filter'
export type Status = 'todo' | 'in-progress' | 'done'
export type Task = { id: string; title: string; status: Status }
export type State = { tasks: Task[]; filter: Filter; past: Task[][] }
export type Action =
  | { type: 'add'; id: string; title: string }
  | { type: 'advance'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'clearDone' }
  | { type: 'undo' }
export const initialState: State = { tasks: [], filter: 'all', past: [] }
const NEXT: Record<Status, Status> = {
  todo: 'in-progress', 'in-progress': 'done', done: 'todo',
}
function remember(state: State, tasks: Task[]): State {
  return { ...state, tasks, past: [...state.past, state.tasks] }
}
export function taskReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      const title = action.title.trim()
      if (!title || state.tasks.some((task) => task.id === action.id)) return state
      return remember(state, [...state.tasks, { id: action.id, title, status: 'todo' }])
    }
    case 'advance':
      if (!state.tasks.some((task) => task.id === action.id)) return state
      return remember(state, state.tasks.map((task) =>
        task.id === action.id ? { ...task, status: NEXT[task.status] } : task,
      ))
    case 'remove':
      if (!state.tasks.some((task) => task.id === action.id)) return state
      return remember(state, state.tasks.filter((task) => task.id !== action.id))
    case 'setFilter':
      return { ...state, filter: action.filter }
    case 'clearDone':
      if (!state.tasks.some((task) => task.status === 'done')) return state
      return remember(state, state.tasks.filter((task) => task.status !== 'done'))
    case 'undo': {
      const previous = state.past.at(-1)
      return previous ? { ...state, tasks: previous, past: state.past.slice(0, -1) } : state
    }
    default: {
      const unhandled: never = action
      throw new Error(`Unhandled action: ${JSON.stringify(unhandled)}`)
    }
  }
}

