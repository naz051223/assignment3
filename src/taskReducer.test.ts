import { describe, expect, it } from 'vitest'
import { initialState, taskReducer, type State, type Task, type Action } from './taskReducer'
import { countByFilter, filterTasks, FILTERS } from './filter'
const tasks: Task[] = [
  { id: 'a', title: 'Read the slides', status: 'todo' },
  { id: 'b', title: 'Build the reducer', status: 'in-progress' },
  { id: 'c', title: 'Review requirements', status: 'done' },
]
const makeState = (): State => ({ tasks: structuredClone(tasks), filter: 'all', past: [] })
describe('taskReducer', () => {
  it('starts empty with all selected and no history', () => {
    expect(initialState).toEqual({ tasks: [], filter: 'all', past: [] })
  })
  it('adds a trimmed todo task and remembers the previous list', () => {
    const result = taskReducer(initialState, { type: 'add', id: 'a', title: '  Study  ' })
    expect(result.tasks).toEqual([{ id: 'a', title: 'Study', status: 'todo' }])
    expect(result.past).toEqual([[]])
  })
  it('ignores a blank title and a duplicate id without consuming history', () => {
    const state = makeState()
    expect(taskReducer(state, { type: 'add', id: 'd', title: '  ' })).toBe(state)
    expect(taskReducer(state, { type: 'add', id: 'a', title: 'Duplicate' })).toBe(state)
  })
  it('cycles todo to in-progress to done to todo', () => {
    let state = makeState()
    for (const status of ['in-progress', 'done', 'todo']) {
      state = taskReducer(state, { type: 'advance', id: 'a' })
      expect(state.tasks[0].status).toBe(status)
    }
    expect(state.past).toHaveLength(3)
  })
  it('deletes only the matching task', () => {
    const result = taskReducer(makeState(), { type: 'remove', id: 'b' })
    expect(result.tasks.map((task) => task.id)).toEqual(['a', 'c'])
  })
  it.each(FILTERS)('sets filter %s without changing tasks or history', (filter) => {
    const state = makeState()
    const result = taskReducer(state, { type: 'setFilter', filter })
    expect(result.filter).toBe(filter)
    expect(result.tasks).toBe(state.tasks)
    expect(result.past).toBe(state.past)
  })
  it('clears done and keeps the active filter', () => {
    const state = { ...makeState(), filter: 'done' as const }
    const result = taskReducer(state, { type: 'clearDone' })
    expect(result.tasks.map((task) => task.id)).toEqual(['a', 'b'])
    expect(result.filter).toBe('done')
    expect(result.past).toEqual([state.tasks])
  })
  it.each(['advance', 'remove'] as const)('ignores an unknown id for %s', (type) => {
    const state = makeState()
    expect(taskReducer(state, { type, id: 'missing' })).toBe(state)
  })
  it('does not create history when clearDone removes nothing', () => {
    const state = { ...initialState, tasks: [tasks[0]] }
    expect(taskReducer(state, { type: 'clearDone' })).toBe(state)
    expect(taskReducer(initialState, { type: 'clearDone' })).toBe(initialState)
  })
  it('undoes clearDone while retaining the current filter', () => {
    const state = makeState()
    const cleared = taskReducer(state, { type: 'clearDone' })
    const filtered = taskReducer(cleared, { type: 'setFilter', filter: 'todo' })
    const result = taskReducer(filtered, { type: 'undo' })
    expect(result.tasks).toEqual(tasks)
    expect(result.filter).toBe('todo')
    expect(result.past).toEqual([])
  })
  it('supports consecutive undo and stops safely at empty history', () => {
    let state = taskReducer(initialState, { type: 'add', id: 'a', title: 'Study' })
    state = taskReducer(state, { type: 'advance', id: 'a' })
    state = taskReducer(state, { type: 'remove', id: 'a' })
    state = taskReducer(state, { type: 'undo' })
    expect(state.tasks[0].status).toBe('in-progress')
    state = taskReducer(state, { type: 'undo' })
    expect(state.tasks[0].status).toBe('todo')
    state = taskReducer(state, { type: 'undo' })
    expect(state.tasks).toEqual([])
    expect(taskReducer(state, { type: 'undo' })).toBe(state)
  })
  const actions: Action[] = [
    { type: 'add', id: 'd', title: 'New' }, { type: 'advance', id: 'a' },
    { type: 'remove', id: 'a' }, { type: 'setFilter', filter: 'done' },
    { type: 'clearDone' }, { type: 'undo' },
  ]
  it.each(actions)('never mutates frozen input for $type', (action) => {
    const state = { ...makeState(), past: [[{ ...tasks[0] }]] }
    const before = structuredClone(state)
    state.tasks.forEach(Object.freeze)
    state.past.forEach((list) => { list.forEach(Object.freeze); Object.freeze(list) })
    Object.freeze(state.tasks); Object.freeze(state.past); Object.freeze(state)
    taskReducer(state, action)
    expect(state).toEqual(before)
  })
  it('reuses unchanged task objects and replaces only an advanced object', () => {
    const state = makeState()
    const result = taskReducer(state, { type: 'advance', id: 'a' })
    expect(result).not.toBe(state)
    expect(result.tasks).not.toBe(state.tasks)
    expect(result.tasks[0]).not.toBe(state.tasks[0])
    expect(result.tasks[1]).toBe(state.tasks[1])
  })
})
describe('derived filters and counts', () => {
  it.each(FILTERS)('returns matching tasks for %s', (filter) => {
    const result = filterTasks(tasks, filter)
    expect(result).toEqual(filter === 'all' ? tasks : tasks.filter((task) => task.status === filter))
  })
  it('counts every status and total', () => {
    expect(countByFilter(tasks)).toEqual({ all: 3, todo: 1, 'in-progress': 1, done: 1 })
  })
  it('handles empty input for every filter', () => {
    for (const filter of FILTERS) expect(filterTasks([], filter)).toEqual([])
    expect(countByFilter([])).toEqual({ all: 0, todo: 0, 'in-progress': 0, done: 0 })
  })
  it('updates counts after deletion', () => {
    const result = taskReducer(makeState(), { type: 'remove', id: 'c' })
    expect(countByFilter(result.tasks)).toEqual({ all: 2, todo: 1, 'in-progress': 1, done: 0 })
  })
  it('updates a filtered list after advance, add, and undo', () => {
    let state: State = { ...makeState(), filter: 'todo' }
    state = taskReducer(state, { type: 'advance', id: 'a' })
    expect(filterTasks(state.tasks, state.filter)).toEqual([])
    state = taskReducer(state, { type: 'add', id: 'd', title: 'New task' })
    expect(filterTasks(state.tasks, state.filter).map((task) => task.id)).toEqual(['d'])
    state = taskReducer(state, { type: 'undo' })
    expect(filterTasks(state.tasks, state.filter)).toEqual([])
  })
  it('does not mutate frozen input in either helper', () => {
    const input = structuredClone(tasks)
    input.forEach(Object.freeze); Object.freeze(input)
    for (const filter of FILTERS) filterTasks(input, filter)
    countByFilter(input)
    expect(input).toEqual(tasks)
  })
})
