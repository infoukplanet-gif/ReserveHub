# Design System Specification

## 1. Overview & Creative North Star: "The Architectural Ledger"

This design system is built upon the "Architectural Ledger" philosophy. Inspired by the precision of Linear and the clarity of Stripe, it rejects the "floating" chaos of modern web design in favor of a structured, intentional, and high-trust environment. 

The Creative North Star is **Structured Intellectualism**. We are not building a generic SaaS tool; we are building a high-performance workspace for coordination. This is achieved through:
*   **Intentional Asymmetry:** Breaking the predictable 12-column grid to favor content-first information density.
*   **Tonal Authority:** Using color only as a functional signal, never as decoration.
*   **Bespoke Geometry:** A rigid adherence to 8px and 12px radii to create a "fitted" aesthetic that feels custom-tailored.

---

## 2. Color Architecture

The system utilizes a Material-inspired layering approach to define hierarchy without relying on heavy borders or artificial "glows."

### Primary & Functional Palettes
*   **Primary Action Blue (`#2563EB`):** Reserved strictly for the single most important action on a screen.
*   **Deep Action Blue (`#1D4ED8`):** Hover states only. Provides immediate tactical feedback.
*   **Accent Violet (`#7C3AED`):** Exclusive to status badges. Used to distinguish "System States" from "User Actions."
*   **Confirmed Green (`#16A34A`) / Critical Red (`#DC2626`):** Used sparingly to denote binary outcomes (Success/Failure).

### Surface Hierarchy & The "No-Line" Rule
To achieve a premium, editorial feel, designers must prohibit 1px solid borders for broad sectioning. Instead, boundaries are defined by **Background Color Shifts**:
*   **Canvas (`#F8FAFC`):** The base layer of the application.
*   **Surface Lowest (`#FFFFFF`):** High-priority card containers.
*   **Surface Container Low (`#F2F4F6`):** Secondary sidebars or utility panels.
*   **Surface Container High (`#E6E8EA`):** Tooltips or nested modal elements.

**Surface Nesting Principle:** Always place a `Surface Lowest` (#FFFFFF) card on a `Canvas` (#F8FAFC) background. This creates a natural, soft-contrast lift that signals importance without visual noise.

---

## 3. Typography: Editorial Precision

The system uses **Inter** for structural UI and **Noto Sans JP** for multi-language support. The hierarchy is designed to feel like a high-end financial journal.

| Level | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | 36px | Bold | 1.2 | Page-level entry points |
| **H1** | 28px | Bold | 1.3 | Primary section headers |
| **H2** | 22px | SemiBold | 1.4 | Secondary content blocks |
| **H3** | 18px | SemiBold | 1.5 | Modular sub-heads |
| **Body** | 15px | Regular | 1.6 | Standard content |
| **Body Small** | 13px | Regular | 1.6 | Secondary metadata |
| **Price Large** | 28px | Bold | 1.0 | Key financial metrics |
| **Price Small** | 14px | Medium | 1.0 | Inline currency values |

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are forbidden unless an element is physically "floating" above the content (e.g., Modals).

*   **The Layering Principle:** Depth is achieved by stacking surface tiers. A card (`#FFFFFF`) sitting on the `Page Canvas` (`#F8FAFC`) provides sufficient visual separation.
*   **Ambient Shadows:** For floating elements, use a highly diffused shadow: `0px 4px 20px rgba(15, 23, 42, 0.04)`. The shadow color must be a tinted version of `Primary Text` (#0F172A) at very low opacity to mimic natural light.
*   **The Ghost Border:** For accessibility within white-on-white environments, use a "Ghost Border" of `Subtle Border (#E2E8F0)` at 50% opacity. Never use high-contrast 100% opaque black/grey borders.

---

## 5. Component Logic

### Buttons (The Core Interaction)
*   **Primary:** Solid `#2563EB`, White text, 8px radius. **Strict Rule:** Max one per screen.
*   **Secondary:** Ghost style. Background `#EFF6FF`, Text `#2563EB`, no border.
*   **Tertiary:** Transparent background, `Secondary Text (#64748B)`.
*   **Note:** No pill-shaped buttons. All buttons must maintain the 8px architectural radius.

### Cards & Containers
*   **Radius:** 12px.
*   **Border:** 1px solid `#E2E8F0`.
*   **Spacing:** Use `Spacing 6 (1.5rem)` for internal padding.
*   **Rule:** Forbid divider lines within cards. Use vertical whitespace (from the 4px scale) or a `Surface Container Low` background shift to separate headers from content.

### Badges (Pills)
*   **Style:** Pill-shaped (9999px radius).
*   **Color:** Use `Accent Violet` or `Soft Action Background` with high-contrast text. These are the only elements allowed to be fully rounded to distinguish them from interactive buttons.

### States: The "Empty & Loading" Standard
*   **Loading Skeletons:** Use `Surface Container High (#E6E8EA)` for skeleton blocks. Do not use pulsing animations; use a static, subtle shimmer.
*   **Empty States:** Center-aligned, using `Faint Text (#94A3B8)` for descriptions. No illustrations. Use a subtle icon and a single Secondary Action button.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use the 4px base unit for all spacing (4, 8, 12, 16, 24, 32).
*   **Do** use "Surface-on-Surface" layering to create hierarchy instead of lines.
*   **Do** allow for generous white space (32px-64px) between major functional groups.
*   **Do** use `Noto Sans JP` specifically for Japanese characters to maintain weight consistency with `Inter`.

### Don’t
*   **Don’t** use gradients, glows, or AI-generated imagery. The brand is human-led and precise.
*   **Don’t** use pill-shaped buttons for actions; keep them squared with 8px radius.
*   **Don’t** use 100% black for text. Always use `Primary Text (#0F172A)` to maintain a professional, "ink-on-paper" feel.
*   **Don’t** nest more than three levels of surface containers (Canvas > Surface > Nested Card). Excessive layering leads to cognitive load.