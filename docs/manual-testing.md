# Manual Testing Plan

The accessibility widget was exercised manually against different static HTML host pages. Each scenario embeds the production bundle via a `<script>` tag and invokes `window.initAccessibilityWidget()`.

## Scenarios

1. **Light theme marketing page** (`examples/light-theme.html`)
   - Confirms default colors integrate with light UI.
   - Verifies keyboard shortcut `Ctrl + Alt + A` opens/closes the panel.
   - Checks focus is returned to the launcher button after closing.
  - Toggles each control (contrast, adjustable contrast level, text size, magnifier, line spacing, dyslexia font, link highlighting, filters, reduced motion) and confirms corresponding class or style is injected on `<html>`.
  - Activates high contrast together with grayscale/sepia filters and contrast level adjustments to verify visual effects layer correctly.

2. **Dark theme application page** (`examples/dark-theme.html`)
   - Body has `class="accessibility-widget-host-dark"` to demonstrate dark host mode.
   - Validates high contrast, filters, and reduced motion toggles remain legible.
   - Ensures locale switching to Turkish (`initAccessibilityWidget({ locale: 'tr' })`) updates labels.

## Regression Checklist

- Panel is announced as ready via screen-reader friendly live region.
- Reset button reverts all controls to default state.
- Magnifier scaling restores default layout when reset or disabled.
- Dyslexia-friendly font and link highlighting options update text and anchors as expected.
- Local storage retains selections after page reload.
- Destroying the widget via returned API removes injected classes and listeners.
- Combined visual effects (contrast + filters) continue to apply after refresh and can be cleared via **Reset**.

> Run these scenarios by serving the repository root (`npx serve .`) or opening the HTML files directly in a browser.
