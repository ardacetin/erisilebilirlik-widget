# Manual Testing Plan

The accessibility widget was exercised manually against different static HTML host pages. Each scenario embeds the production bundle via a `<script>` tag and invokes `window.initAccessibilityWidget()`.

## Scenarios

1. **Light theme marketing page** (`examples/light-theme.html`)
   - Confirms default colors integrate with light UI.
   - Verifies keyboard shortcut `Ctrl + Alt + A` opens/closes the panel.
   - Checks focus is returned to the launcher button after closing.
   - Toggles each control (contrast, text size, line spacing, filters, reduced motion) and confirms corresponding class or style is injected on `<html>`.

2. **Dark theme application page** (`examples/dark-theme.html`)
   - Body has `class="accessibility-widget-host-dark"` to demonstrate dark host mode.
   - Validates high contrast, filters, and reduced motion toggles remain legible.
   - Ensures locale switching to Turkish (`initAccessibilityWidget({ locale: 'tr' })`) updates labels.

## Regression Checklist

- Panel is announced as ready via screen-reader friendly live region.
- Reset button reverts all controls to default state.
- Local storage retains selections after page reload.
- Destroying the widget via returned API removes injected classes and listeners.

> Run these scenarios by serving the repository root (`npx serve .`) or opening the HTML files directly in a browser.
