# Specification

## Summary
**Goal:** Fix the primary navigation dropdown so that opening it does not cause its items to overlap or crowd adjacent dropdown menu headings.

**Planned changes:**
- Set the open dropdown panel to use absolute positioning so it floats above the page content instead of pushing sibling nav elements
- Apply a sufficiently high z-index to the dropdown panel so it renders on top of surrounding content
- Ensure the navigation bar has `overflow: visible` so the dropdown is not clipped
- Verify that closing the dropdown fully restores the navigation bar layout with no residual overlap

**User-visible outcome:** Clicking the first dropdown in the primary navigation opens a panel that floats cleanly above the page; all dropdown items are fully readable and no other navigation headings are shifted, overlapped, or obscured.
