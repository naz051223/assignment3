# Assignment 3 — Task Manager with a Reducer

**Full name:** Tuba Nazlı İpekyüz  
**Student number:** 2200004323  
**Course:** SEN0415 Advanced Web Programming — Fall 2026, Week 5

## Run

Use Node.js 20.19+ (or a supported newer version).

```sh
npm install
npm run dev
npm test
npm run build
```

The application deliberately starts with no tasks and the All filter. State lives in App with `useReducer(taskReducer, initialState)` and reaches child components through props. There is no Context or state library. Data lasts only for the current page session; refresh starts a new list.

## Required features

- Add a task; blank titles are ignored and surrounding spaces are trimmed.
- Next cycles To do → In progress → Done → To do.
- Delete removes one task. Clear done removes all completed tasks across filters.
- Four filter buttons display live counts; the active button is highlighted.
- An empty filter shows “No tasks here.”
- `filterTasks` and `countByFilter` derive the view from the complete task list.
- Strict TypeScript, typed actions and an exhaustive `never` check cover reducer actions.

## Bonus 1: Undo

State contains `tasks: Task[]`, `filter: Filter` and `past: Task[][]`. Each actual task change appends the previous list to `past`, while undo restores the most recent list and removes that history entry. Filter changes never enter history, undo preserves the current filter, and invalid/no-op task actions do not consume history; Undo is disabled when history is empty.

## Bonus 2: Tests

`npm test` runs Vitest once and exits. Tests cover every action, three advances returning to todo, consecutive undo, restoring cleared tasks, filters, counts, frozen input immutability, unknown IDs, empty input, no-op clearing, duplicate IDs, blank titles and counts after deletion.

Verified output:

```text
> task-manager-assignment3@0.0.0 test
> vitest run

 RUN  v5.1.0
 Test Files  1 passed (1)
      Tests  31 passed (31)
```

`npm run build` also passed (strict TypeScript check and Vite production build).

## Bonus 3: Explain your reducer

A reducer describes how an action changes the current state. It must be pure: the same state and action must produce the same result without changing anything outside the function. My reducer creates a new state object and replaces arrays or task objects when their contents change. If I changed an existing array with push, React could see the same reference and skip an update. Mutation would also damage my undo history because earlier snapshots could point to the same changed data.

The form creates each task ID with crypto.randomUUID() before dispatching the add action. Creating a random ID inside the reducer would mean that calling it twice with identical arguments could produce different tasks. Passing the ID in the action makes the reducer predictable and lets tests choose fixed IDs.

I store only the complete task list, the selected filter, and previous task lists for undo. During rendering, filterTasks selects visible tasks and countByFilter calculates the numbers. Storing those results separately would require updating several copies of the same information. For example, deleting a done task could remove its row but leave the Done count unchanged if I forgot to update the stored counts.

Moving the filter into reducer state made transitions easier to describe with typed actions. Every filter click now dispatches setFilter, and task actions explicitly preserve the current filter. The extra challenge was undo: it should restore task data without restoring an old filter. Keeping history as task arrays rather than complete state objects solves that problem.

## Bonus 4: Git repository

Repository: https://github.com/naz051223/assignment3

The private repository contains the implementation history in separate commits, the four screenshots and a .gitignore excluding node_modules and dist. Give the instructor access using the account announced in CATS before submitting.

## Screenshots

Three tasks were entered through the interface, with one task in each status. The four required images show that same task list with each filter selected:

- `screenshots/all.png`
- `screenshots/todo.png`
- `screenshots/in-progress.png`
- `screenshots/done.png`

## Files

- `src/taskReducer.ts`: state, typed actions, immutable transitions and undo.
- `src/filter.ts`: pure filtering and counting helpers.
- `src/App.tsx`: reducer owner and components receiving props.
- `src/TaskRow.tsx`: a single task with its actions.
- `src/taskReducer.test.ts`: automated reducer and helper tests.

## Submission

Submit `assignment3.zip` to the Assignment 3 entry on CATS before its posted deadline. The archive contains one `assignment3` folder and excludes installed packages. Review the reducer explanation, understand every line, and revise the wording to your own explanation before submission, as required by the course AI policy. Make sure the instructor has access to the private repository before claiming Bonus 4.

