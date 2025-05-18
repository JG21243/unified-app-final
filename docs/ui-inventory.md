# UI Inventory

This file is auto-generated. Run `npm run generate:ui-inventory` (or `pnpm run generate:ui-inventory`) to update the list of components.

**Manual Enhancements & Usage Guidelines:**

While the table below provides a quick overview of components, it's crucial to manually enhance this document with detailed usage guidelines, prop explanations, and variant examples for each key component, especially those in `components/ui/`. This ensures developers use components correctly and consistently.

**Example: Button Component (`components/ui/Button.tsx`)**

*   **Description:** A clickable element used to trigger an action.
*   **When to Use:**
    *   For submitting forms.
    *   Initiating actions like "Save", "Delete", "Create New".
    *   Navigating to a different part of the application if styled as a link.
*   **Props:**
    *   `variant`: (Optional) Defines the visual style of the button.
        *   `default`: Standard button style.
        *   `destructive`: For actions that delete data or have significant consequences.
        *   `outline`: Button with an outline, no solid background.
        *   `secondary`: A less prominent button.
        *   `ghost`: Used for actions that need to be available but not prominent (e.g., icons).
        *   `link`: Styles the button as a hyperlink.
    *   `size`: (Optional) Defines the size of the button.
        *   `default`: Standard size.
        *   `sm`: Small button.
        *   `lg`: Large button.
        *   `icon`: For buttons that only contain an icon.
    *   `asChild`: (Optional) Boolean. If true, the button will render as its child component, merging the button's props with the child's props. Useful for integrating with other components like `Link` from Next.js.
    *   `...rest`: Any other valid HTML button attributes (e.g., `onClick`, `disabled`, `type`).
*   **Do's:**
    *   Use clear and concise text labels.
    *   Use the `destructive` variant for actions that cause data loss.
    *   Use the `disabled` prop when an action is not available.
*   **Don'ts:**
    *   Don't use a button for simple navigation if a standard anchor tag (`<a>`) or Next.js `<Link>` is more appropriate (unless using the `link` variant or `asChild` with a Link).
    *   Avoid overly long text labels.

---

**Example: Input Component (`components/ui/input.tsx`)**

*   **Description:** A standard HTML input field for text-based user input.
*   **When to Use:**
    *   For capturing single-line text, numbers, emails, passwords, URLs, etc.
    *   In forms where users need to type in information.
*   **Props:**
    *   `type`: (Optional) Specifies the type of input. Examples: `text` (default), `password`, `email`, `number`, `search`, `url`.
    *   `className`: (Optional) Additional CSS classes to apply for custom styling.
    *   `placeholder`: (Optional) Text displayed in the input field when it is empty.
    *   `disabled`: (Optional) Boolean. If true, the input field is disabled and cannot be interacted with.
    *   `value`: (Optional) The current value of the input field (for controlled components).
    *   `onChange`: (Optional) Function called when the input value changes.
    *   `...rest`: Any other valid HTML input attributes (e.g., `maxLength`, `minLength`, `required`, `id`, `name`).
*   **Do's:**
    *   Always use a corresponding `<label>` component for accessibility, associating it with the input using `htmlFor` and `id` attributes.
    *   Use the appropriate `type` for the data being collected (e.g., `type="email"` for email addresses).
    *   Provide clear `placeholder` text if the label is not sufficient.
    *   Use the `disabled` prop when the input should not be editable.
*   **Don'ts:**
    *   Don't use an `<input>` for multi-line text; use `<textarea>` instead.
    *   Avoid relying solely on `placeholder` text as a label; it disappears when the user starts typing.

---

**Example: Card Component (`components/ui/card.tsx`)**

*   **Description:** A container component used to group related content and actions, typically with a visual boundary (border, shadow).
*   **When to Use:**
    *   Displaying summaries of information (e.g., a user profile, a product preview, a prompt card).
    *   Grouping distinct sections of a page.
    *   Presenting a collection of items where each item has its own set of details and actions.
*   **Key Sub-Components:**
    *   `Card`: The main container.
    *   `CardHeader`: Optional. Container for the card's header section, often includes `CardTitle` and `CardDescription`.
    *   `CardTitle`: Optional. For displaying the main title within the `CardHeader`.
    *   `CardDescription`: Optional. For displaying additional descriptive text within the `CardHeader`.
    *   `CardContent`: The main content area of the card.
    *   `CardFooter`: Optional. Container for actions or supplementary information at the bottom of the card.
*   **Props (for `Card` and its sub-components):**
    *   `className`: (Optional) Additional CSS classes to apply for custom styling.
    *   `...rest`: Any other valid HTML div attributes (for `Card`, `CardHeader`, `CardContent`, `CardFooter`) or heading/paragraph attributes (for `CardTitle`, `CardDescription`).
*   **Do's:**
    *   Use `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter` to structure the card logically and maintain consistency.
    *   Keep the content within a card focused on a single topic or entity.
    *   Ensure cards have appropriate padding and spacing for readability (often handled by default styles).
*   **Don'ts:**
    *   Don't overuse cards to the point where the UI becomes cluttered. Sometimes simpler grouping or layout is better.
    *   Avoid nesting cards deeply unless there is a very clear hierarchical relationship.
    *   Don't put too much interactive content or too many calls to action within a single card, which can be overwhelming.

---

| Component | Path | Props | Variants |
|-----------|------|-------|----------|
| websearch-config | components/websearch-config.tsx |  |  |
| version-history | components/version-history.tsx |  |  |
| tools-panel | components/tools-panel.tsx |  |  |
| tool-call | components/tool-call.tsx |  |  |
| theme-provider | components/theme-provider.tsx |  |  |
| tags-provider | components/tags-provider.tsx |  |  |
| tags-manager | components/tags-manager.tsx |  |  |
| tags-input | components/tags-input.tsx |  |  |
| tag-management | components/tag-management.tsx |  |  |
| search-filter | components/search-filter.tsx |  |  |
| prompt-version-history | components/prompt-version-history.tsx |  |  |
| prompt-testing-interface | components/prompt-testing-interface.tsx |  |  |
| prompt-tester | components/prompt-tester.tsx |  |  |
| prompt-tester-streaming | components/prompt-tester-streaming.tsx |  |  |
| prompt-test-interface | components/prompt-test-interface.tsx |  |  |
| prompt-selector | components/prompt-selector.tsx |  |  |
| prompt-preview | components/prompt-preview.tsx |  |  |
| prompt-list-skeleton | components/prompt-list-skeleton.tsx |  |  |
| prompt-list-item | components/prompt-list-item.tsx |  |  |
| prompt-filters | components/prompt-filters.tsx |  |  |
| prompt-detail | components/prompt-detail.tsx |  |  |
| prompt-card | components/prompt-card.tsx |  |  |
| prompt-card-skeleton | components/prompt-card-skeleton.tsx |  |  |
| prompt-analytics | components/prompt-analytics.tsx |  |  |
| prompt-actions | components/prompt-actions.tsx |  |  |
| panel-config | components/panel-config.tsx |  |  |
| onboarding-tour | components/onboarding-tour.tsx |  |  |
| message | components/message.tsx |  |  |
| legal-prompts-list | components/legal-prompts-list.tsx |  |  |
| keyboard-shortcuts | components/keyboard-shortcuts.tsx |  |  |
| import-prompts | components/import-prompts.tsx |  |  |
| functions-view | components/functions-view.tsx |  |  |
| file-upload | components/file-upload.tsx |  |  |
| file-search-setup | components/file-search-setup.tsx |  |  |
| favorites-provider | components/favorites-provider.tsx |  |  |
| export-prompts | components/export-prompts.tsx |  |  |
| error-boundary | components/error-boundary.tsx |  |  |
| enhanced-dashboard | components/enhanced-dashboard.tsx |  |  |
| edit-prompt-form | components/edit-prompt-form.tsx |  |  |
| delete-prompt-button | components/delete-prompt-button.tsx |  |  |
| date-range-picker | components/date-range-picker.tsx |  |  |
| dashboard | components/dashboard.tsx |  |  |
| dashboard-stats | components/dashboard-stats.tsx |  |  |
| create-prompt-form | components/create-prompt-form.tsx |  |  |
| country-selector | components/country-selector.tsx |  |  |
| command-menu | components/command-menu.tsx |  |  |
| collaborative-workspace | components/collaborative-workspace.tsx |  |  |
| chat | components/chat.tsx |  |  |
| category-select | components/category-select.tsx |  |  |
| category-manager | components/category-manager.tsx |  |  |
| bulk-actions | components/bulk-actions.tsx |  |  |
| assistant | components/assistant.tsx |  |  |
| annotations | components/annotations.tsx |  |  |
| ai-prompt-assistant | components/ai-prompt-assistant.tsx |  |  |
| advanced-search | components/advanced-search.tsx |  |  |
| typography | components/ui/typography.tsx |  |  |
| tooltip | components/ui/tooltip.tsx |  |  |
| toggle | components/ui/toggle.tsx |  |  |
| toggle-group | components/ui/toggle-group.tsx |  |  |
| toaster | components/ui/toaster.tsx |  |  |
| toast | components/ui/toast.tsx |  |  |
| textarea | components/ui/textarea.tsx |  |  |
| tabs | components/ui/tabs.tsx |  |  |
| table | components/ui/table.tsx |  |  |
| switch | components/ui/switch.tsx |  |  |
| sonner | components/ui/sonner.tsx |  |  |
| slider | components/ui/slider.tsx |  |  |
| skeleton | components/ui/skeleton.tsx |  |  |
| sidebar | components/ui/sidebar.tsx |  |  |
| sheet | components/ui/sheet.tsx |  |  |
| separator | components/ui/separator.tsx |  |  |
| select | components/ui/select.tsx |  |  |
| scroll-area | components/ui/scroll-area.tsx |  |  |
| resizable | components/ui/resizable.tsx |  |  |
| radio-group | components/ui/radio-group.tsx |  |  |
| progress | components/ui/progress.tsx |  |  |
| popover | components/ui/popover.tsx |  |  |
| pagination | components/ui/pagination.tsx |  |  |
| navigation-menu | components/ui/navigation-menu.tsx |  |  |
| motion | components/ui/motion.tsx |  |  |
| menubar | components/ui/menubar.tsx |  |  |
| label | components/ui/label.tsx |  |  |
| input | components/ui/input.tsx |  |  |
| input-otp | components/ui/input-otp.tsx |  |  |
| hover-card | components/ui/hover-card.tsx |  |  |
| form | components/ui/form.tsx |  |  |
| dropdown-menu | components/ui/dropdown-menu.tsx |  |  |
| drawer | components/ui/drawer.tsx |  |  |
| dialog | components/ui/dialog.tsx |  |  |
| context-menu | components/ui/context-menu.tsx |  |  |
| command | components/ui/command.tsx |  |  |
| combobox | components/ui/combobox.tsx |  |  |
| collapsible | components/ui/collapsible.tsx |  |  |
| checkbox | components/ui/checkbox.tsx |  |  |
| chart | components/ui/chart.tsx |  |  |
| carousel | components/ui/carousel.tsx |  |  |
| card | components/ui/card.tsx |  |  |
| calendar | components/ui/calendar.tsx |  |  |
| breadcrumb | components/ui/breadcrumb.tsx |  |  |
| badge | components/ui/badge.tsx |  |  |
| avatar | components/ui/avatar.tsx |  |  |
| aspect-ratio | components/ui/aspect-ratio.tsx |  |  |
| alert | components/ui/alert.tsx |  |  |
| alert-dialog | components/ui/alert-dialog.tsx |  |  |
| accordion | components/ui/accordion.tsx |  |  |
| Button | components/ui/Button.tsx |  |  |
| theme-toggle | components/theme/theme-toggle.tsx |  |  |
| section | components/layout/section.tsx |  |  |
| page-header | components/layout/page-header.tsx |  |  |
| page-container | components/layout/page-container.tsx |  |  |
| global-header | components/layout/global-header.tsx |  |  |
| global-footer | components/layout/global-footer.tsx |  |  |
| app-header | components/layout/app-header.tsx |  |  |
| Header | components/layout/Header.tsx |  |  |
| page | app/page.tsx |  |  |
| not-found | app/not-found.tsx |  |  |
| layout | app/layout.tsx |  |  |
| page | app/prompts/page.tsx |  |  |
| layout | app/prompts/layout.tsx |  |  |
| page | app/prompts/new/page.tsx |  |  |
| page | app/prompts/[id]/page.tsx |  |  |
| error | app/prompts/[id]/error.tsx |  |  |
| page | app/prompts/[id]/edit/page.tsx |  |  |
| page | app/chat/page.tsx |  |  |
| page | app/categories/page.tsx |  |  |
