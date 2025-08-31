# PRD: Refined Grocery List Interaction Model

- Version: 1.0
- Date: 2025-08-31
- Owner: Grocery App UI

## 1. Overview

Replace the modal behavior of the "Usual Groceries" list with an inline, scrollable view, and make the "Shopping Cart" open in a modal for focused review. This improves usability by keeping frequent items visible while enabling an unobstructed cart review.

## 2. Current State (as of this PRD)

- `app/components/UsualGroceries.tsx` shows a 3-item preview with a “Show all” button that opens a full-screen overlay via `createPortal` and locks body scroll.
- `app/components/GroceryList.tsx` renders the cart inline with a scroll container (`max-h-48 sm:max-h-64`) and auto-scrolls on new items.
- `app/page.tsx` renders the Shopping Cart inline with item count, Export, and Clear buttons. No cart modal exists.
- `app/components/ExportDialog.tsx` is a reusable modal for export fallback and serves as a style reference for modal visuals.

## 3. Goals

- Improve “Usual Groceries” by making it scrollable inline on the main page.
- Provide a focused, larger view of the “Shopping Cart” in a modal.
- Keep adding items via voice simple and uninterrupted.
- Reduce UI clutter and list overlap.

## 4. User Stories

- As a user, I can scroll my “Usual Groceries” inline on the main page while speaking items to add.
- As a user, I can click the “Shopping Cart” to open a larger, scrollable modal to review all items.
- As a user, the cart modal is unobstructed and easy to dismiss.

## 5. Functional Requirements

### 5.1 Usual Groceries (`app/components/UsualGroceries.tsx`)

1. Remove the “Show all” button and all modal/portal logic (including body scroll lock).
2. Render the full list inline in the section with a visible vertical scrollbar when content exceeds the allocated height.
3. Apply a fixed or max height so this section does not push other content off-screen (suggestion: `max-h-64 sm:max-h-80 overflow-y-auto`).
4. Preserve `onUsualGroceriesChange` behavior and the existing default list initialization.

### 5.2 Shopping Cart (`app/page.tsx` + `app/components/GroceryList.tsx`)

1. Make the Shopping Cart section on the main page a clickable area when the cart has items (`role="button"`, keyboard accessible with Enter/Space).
2. Clicking opens a modal that contains:
   - Header: title (“Shopping Cart”) and item count, plus a close button.
   - Body: a scrollable list using `GroceryList`.
   - Footer: “Export” and “Clear” buttons wired to existing handlers.
3. The modal is dismissible by:
   - Close button.
   - Clicking the backdrop.
   - Pressing Escape.
4. Inline on the main page:
   - Show the section title and item count.
   - If empty, show the existing empty state and do not open the modal on click.
   - Do not render the full cart inline when items exist; use the modal for full review.

### 5.3 GroceryList adjustments (`app/components/GroceryList.tsx`)

1. Add a prop to control the scroll container height (e.g., `scrollContainerClassName?: string`).
2. Default behavior remains unchanged for inline usage (current `max-h-48 sm:max-h-64`).
3. In the modal, pass classes to allow the modal to control height (e.g., `flex-1 overflow-y-auto`, no `max-h`).

## 6. Non-Goals

- No changes to voice recognition or item extraction logic.
- No changes to the export format/content.
- No changes to grocery state management (`useGroceryList`).

## 7. Design Considerations

- Modal visual language consistent with existing `glass-strong`/`glass` styles and animations.
- Modal sizing: `max-w-lg` (or similar) and `max-h-[80vh]`; internal content area scrolls.
- Smooth open/close transitions aligned with current animation style.
- Scrollbars should be visible on interaction.

## 8. Accessibility

- Modal: `role="dialog"`, `aria-modal="true"`, and an accessible label from the header.
- Backdrop click closes the modal; Escape closes the modal.
- Shopping Cart section (when clickable): `role="button"`, `tabIndex=0`, and handles Enter/Space activation.

## 9. Technical Plan

- Modify `app/components/UsualGroceries.tsx`:
  - Remove all portal/overlay logic and the “Show all” button.
  - Render full list inline with a scrollable container and height constraints.

- Modify `app/components/GroceryList.tsx`:
  - Add `scrollContainerClassName?: string` to override the internal scroll container’s classes.
  - Use default classes for inline cart; allow modal to pass custom classes.

- Modify `app/page.tsx`:
  - Add `isCartOpen` state with open/close handlers.
  - Make the Shopping Cart section act as a button when `groceryItems.length > 0`.
  - Move the inline list rendering into a new modal; keep empty state inline.
  - Reuse existing `handleExportList` and `clearGroceryList` inside the modal.

- Add `app/components/ShoppingCartModal.tsx`:
  - Backdrop (click-to-close) and container using `glass-strong` styles.
  - Header (title, count, close button), body (hosts `GroceryList`), footer (Export, Clear buttons).
  - Handle Escape key; stopping propagation within modal content.

## 10. Acceptance Criteria

- Usual Groceries:
  - Inline, scrollable list; no modal appears.
  - Section has fixed/max height and does not overflow the main layout.

- Shopping Cart:
  - When non-empty, clicking the section opens a modal with correct item count.
  - Modal shows full, scrollable `GroceryList`.
  - Modal contains Export and Clear buttons functioning as before.
  - Modal closes via close button, backdrop click, and Escape.
  - Inline page retains the empty state when cart is empty and does not open the modal.

- No regressions in voice-driven add/remove/modify behavior or export formatting.

## 11. Implementation Notes

- Suggested heights:
  - Usual Groceries: `max-h-64 sm:max-h-80 overflow-y-auto`.
  - Modal container: `max-h-[80vh]`; body area `flex-1 overflow-y-auto`.
- Keep `GroceryList` auto-scroll on new items in both inline and modal contexts.
- Consider extracting modal styles from `ExportDialog.tsx` for consistency.

## 12. Risks & Mitigations

- Risk: Conflicting scroll behaviors between `GroceryList` and modal.
  - Mitigation: Allow modal to own height via `scrollContainerClassName` prop.
- Risk: Accessibility regressions.
  - Mitigation: Verify keyboard interactions and ARIA attributes in both inline and modal contexts.

## 13. Success Metrics

- Fewer clicks to view usual groceries (no modal step).
- Positive feedback on readability and flow.
- Smooth interactions validated by manual testing: scrolling works; modal opens/closes as expected; no layout overflow.

