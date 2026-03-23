# Icons and Emoji Rendering on iOS

This document summarizes the issue encountered with icon and emoji rendering on the iOS simulator and the rationale for the transition to SVG-based icons.

## The Issue

In the initial development phase of **Job Vault Mobile**, literal emojis (e.g., 😊, ✅, 💀) were used as markers for job-related events in the calendar and event lists. While these rendered correctly on Android devices, they appeared as **question marks** or "broken" font symbols on the iPhone simulator.

### Diagnostic Findings

Through a series of tests on the user's environment, we discovered that:

1.  **SVG-based icons** (`lucide-react-native`) rendered perfectly on all platforms.
2.  **Font-based icons** (`MaterialCommunityIcons`) also rendered correctly once the native assets were initialized.
3.  **Literal Emojis** (both standard text and Unicode escape sequences) consistently failed to render on the iOS simulator.

### Root Cause Hypothesis

The issue appears to be related to the specific combination of **React Native 0.81.5** and **React 19.1.0** (a bleeding-edge environment at the time of discovery). There is a known bug or regression in how iOS handles system emoji font fallback within certain view hierarchies or when custom fonts/themes (like those in `react-native-paper`) are applied.

## The Solution: SVG-based Icons

To resolve this and ensure platform consistency, we replaced the literal emoji markers with SVG icons from the `lucide-react-native` library.

### Why SVG (`lucide-react-native`) was chosen:

1.  **Platform Independence:** SVGs do not rely on the host system's font engine or emoji support. They are rendered as paths, ensuring they look identical on iOS, Android, and Web.
2.  **Color Control:** Unlike standard emojis, SVG icons can be easily themed and colored to match the app's UI palette (using the existing `color` property from our `MARKER_OPTIONS` configuration).
3.  **Performance:** `lucide-react-native` (via `react-native-svg`) is highly optimized for React Native and avoids the overhead of loading large custom font files.
4.  **Scalability:** SVG icons scale perfectly without pixelation, maintaining high visual quality on Retina and high-DPI displays.

### UI Implementation Details

- **SVG Icons:** The app uses `lucide-react-native` for all markers.
- **Mapping:** A mapping object `MARKER_OPTIONS` in `components/EventDetailItem/EventDetailItem.jsx` associates labels with Lucide icon components.
- **UI Consistency:** The marker picker and display components use these SVG components, ensuring a consistent look across all platforms.
- **Cleanup:** The code has been refactored to remove unused emoji strings and rename components from "emoji" to "marker" where appropriate.

## Conclusion

By "resorting" to the SVG icon method, we achieved a more robust, professional, and cross-platform compatible UI that is immune to the system-level font rendering inconsistencies often found in newer simulator environments.
