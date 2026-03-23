# React Component Creation Skill

## Instructions

- **Directory Structure:**
  - Each React component must be placed in its own directory within the `components/` directory.
  - The directory name MUST be the same as the component name (e.g., `components/MyComponent/`).
  - The main component file MUST be named the same as the component (e.g., `components/MyComponent/MyComponent.jsx`).
  - Styles for the component MUST be placed in a separate file within the component directory, named `[Component].styles.js` (e.g., `components/MyComponent/MyComponent.styles.js`).
  - Tests for the component MUST be placed in a `__tests__` directory inside the component's directory (e.g., `components/MyComponent/__tests__/`).

- **Exports:**
  - ALWAYS use named exports for components.
  - DO NOT use default exports unless the component is a top-level route component in the `app/` directory.

- **Routing Components:**
  - Only top-level components like `layout`, `calendar`, `event`, and `index` should be located in the `app/` directory.
  - These top-level components may use default exports as required by `expo-router`.

- **References:**
  - For authoritative methods of using Junie config files, refer to [https://junie.jetbrains.com/docs](https://junie.jetbrains.com/docs).
