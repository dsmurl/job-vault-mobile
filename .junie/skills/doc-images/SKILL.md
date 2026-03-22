---
name: doc-images
description: Manage documentation images by ensuring they are stored in the correct directory, use appropriate formats, and are correctly referenced.
---

# Documentation Images Skill

## Instructions

- **Image Directory:** All documentation images MUST be placed in `docs/images/`.
- **Image Formats:** Prefer SVG for diagrams and PNG/JPG for screenshots.
- **Reference Pattern:** When referencing images in markdown files within `docs/`, always use relative paths starting with `./images/`.
- **Image Creation:** When the user asks to "create a diagram" or "add an image to docs", Junie should:
  1. Generate the content (e.g., SVG code).
  2. Save it as a new file in `docs/images/` with a descriptive, kebab-case filename.
  3. Reference it in the appropriate documentation file using `![Alt Text](./images/filename.svg)`.
