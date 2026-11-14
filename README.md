# Assignment 3 — Task Manager with a Reducer

**Full name:** Tuba Nazlı İpekyüz  
**Student number:** 2200004323  
**Course:** SEN0415 Advanced Web Programming — Fall 2026, Week 5

## Open by double-click

Extract the ZIP, then double-click index.html. It contains the compiled React app and CSS and requires no server or installation. app.html is the Vite source entry. After editing source files, run npm run build to regenerate index.html. For source development, npm run dev opens /app.html with live updates.

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

The reducer takes the current state and an action, then returns the next state. It needs to be pure so that the same inputs give the same result. I use spread syntax, map and filter instead of changing the existing state. If I used push on the old tasks array, its reference would stay the same, and React might skip an update. It could also change the older lists saved for undo.

The add form creates the task ID with crypto.randomUUID() and sends it with the action. The reducer only uses the ID it receives. This keeps random values outside the reducer and makes testing simpler because a test can provide a fixed ID.

The filtered list and the counts are calculated from state.tasks while the component renders. I do not save them as separate state because they are already based on information in the task list. Otherwise, I would need to update several values after each action. For example, deleting a completed task could remove it from the list but leave the Done count at one if I forgot to update that count.

Keeping the filter in the reducer makes the state changes easier to follow: clicking a filter sends a setFilter action. Undo needs extra care, though, because changing a filter should not be undone. I solve this by keeping only earlier task lists in past. Undo restores the tasks while keeping the filter currently selected.

## Bonus 4: Git repository

GitHub username: naz051223

Profile: https://github.com/naz051223

Repository: https://github.com/naz051223/assignment3

The repository contains the implementation history in separate commits, the four screenshots and a .gitignore excluding node_modules and dist. The repository link above is provided for reviewing the assignment.

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

Submit `assignment3.zip` to the Assignment 3 entry on CATS before its posted deadline. The archive contains one `assignment3` folder and excludes installed packages. Review the reducer explanation, understand every line, and revise the wording to your own explanation before submission, as required by the course AI policy. Make sure the instructor can open the repository link before claiming Bonus 4.


