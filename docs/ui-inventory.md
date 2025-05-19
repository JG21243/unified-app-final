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

**Example: Dialog Component (`components/ui/dialog.tsx`)**

*   **Description:** A modal window that appears on top of the main content, requiring user interaction before they can return to the underlying page. Used for focused tasks, alerts, or presenting critical information.
*   **When to Use:**
    *   Confirming critical actions (e.g., "Are you sure you want to delete?").
    *   Displaying forms for creating or editing items where a focused, separate UI is beneficial.
    *   Showing additional details or information without navigating away from the current page.
    *   Alerting users to important system messages or errors that require acknowledgment.
*   **Key Sub-Components:**
    *   `Dialog`: The root component that manages the dialog\'s state.
    *   `DialogTrigger`: A component (often a Button) that, when clicked, opens the dialog.
    *   `DialogPortal`: Internally used to port the dialog to a different part of the DOM (usually `document.body`).
    *   `DialogOverlay`: The semi-transparent background that covers the main content when the dialog is open.
    *   `DialogContent`: The main container for the dialog\'s content. This is what the user sees as the "modal window."
    *   `DialogHeader`: Optional. Container for the dialog\'s header, often includes `DialogTitle` and `DialogDescription`.
    *   `DialogTitle`: Optional. For displaying the main title within the `DialogHeader`.
    *   `DialogDescription`: Optional. For displaying additional descriptive text or context within the `DialogHeader`.
    *   `DialogFooter`: Optional. Container for action buttons (e.g., "Save", "Cancel", "Confirm") at the bottom of the dialog.
    *   `DialogClose`: A component (often a Button or an icon) that, when clicked, closes the dialog.
*   **Props (General):**
    *   `open` (on `Dialog`): (Optional) Boolean to control the dialog\'s visibility programmatically.
    *   `onOpenChange` (on `Dialog`): (Optional) Callback function when the dialog\'s open state changes.
    *   `className` (on various sub-components): (Optional) Additional CSS classes for custom styling.
*   **Do\'s:**
    *   Always provide a clear way to close the dialog (e.g., a close button with an "X" icon, a "Cancel" button in the footer). The `DialogContent` includes a default "X" close button.
    *   Use a `DialogTitle` to clearly indicate the purpose of the dialog.
    *   Keep dialog content concise and focused on a single task or piece of information.
    *   Ensure dialogs are accessible (e.g., keyboard focus is managed correctly, ARIA attributes are used – Radix UI handles much of this automatically).
*   **Don'ts:**
    *   Don't create dialogs that are too large or take up too much screen space. They should be focused and to the point.
    *   Avoid putting too many steps or complex workflows within a single dialog.

---

**Example: Select Component (`components/ui/select.tsx`)**

*   **Description:** A control that allows users to choose one option from a predefined list. It displays the current selection and a dropdown list of other options.
*   **When to Use:**
    *   When users need to pick a single option from a list of 5 or more items.
    *   For settings, filters, or form inputs where the available options are finite and known.
    *   When space is limited and a full list (e.g., radio buttons) would be too cluttered.
*   **Key Sub-Components:**
    *   `Select`: The root component that manages the select\'s state.
    *   `SelectGroup`: Optional. Used to group related `SelectItem` components with a `SelectLabel`.
    *   `SelectValue`: Displays the currently selected value in the `SelectTrigger`. Can have a `placeholder` prop.
    *   `SelectTrigger`: The clickable element that opens/closes the dropdown list of options.
    *   `SelectContent`: The container for the list of options that appears when the select is open.
    *   `SelectLabel`: Optional. A label for a `SelectGroup` of items.
    *   `SelectItem`: Represents an individual option in the dropdown list. Requires a `value` prop.
    *   `SelectSeparator`: Optional. A visual separator between groups of items or individual items.
    *   `SelectScrollUpButton`, `SelectScrollDownButton`: Optional. Buttons for scrolling within the `SelectContent` if there are many items.
*   **Props (General):**
    *   `value` (on `Select`): (Optional) The controlled value of the selected item.
    *   `onValueChange` (on `Select`): (Optional) Callback function when the selected value changes.
    *   `defaultValue` (on `Select`): (Optional) The initial value for uncontrolled state.
    *   `disabled` (on `SelectTrigger` or `SelectItem`): Boolean. Disables the select or a specific item.
    *   `placeholder` (on `SelectValue`): Text to display when no value is selected.
    *   `className` (on various sub-components): (Optional) Additional CSS classes for custom styling.
    *   `position` (on `SelectContent`): (Optional, default: `popper`) Controls how the content is positioned relative to the trigger.
*   **Do\'s:**
    *   Always provide a `SelectLabel` (either visually or for screen readers via `aria-label` on `SelectTrigger`) to describe the purpose of the select input.
    *   Ensure `SelectItem` components have meaningful text content and a unique `value` prop.
    *   Use `SelectGroup` and `SelectSeparator` to organize long lists of options for better scannability.
    *   Consider setting a default selected option if it makes sense for the context.
*   **Don\'ts:**
    *   Don\'t use a select for fewer than 3-4 options; radio buttons or toggle buttons might be more appropriate.
    *   Avoid overly long text in `SelectItem` components; keep them concise.
    *   Don\'t use a select if users need to input custom text (use an `<input>` with datalist or a combobox pattern instead).

---

**Example: Textarea Component (`components/ui/textarea.tsx`)**

*   **Description:** A form control for multi-line text input.
*   **When to Use:**
    *   For capturing longer pieces of text, such as comments, descriptions, messages, or code snippets.
    *   When users need to input more than a single line of text.
*   **Props:**
    *   `className`: (Optional) Additional CSS classes to apply for custom styling.
    *   `placeholder`: (Optional) Text displayed in the textarea when it is empty.
    *   `disabled`: (Optional) Boolean. If true, the textarea is disabled and cannot be interacted with.
    *   `value`: (Optional) The current value of the textarea (for controlled components).
    *   `onChange`: (Optional) Function called when the textarea value changes.
    *   `rows`: (Optional) Number. Specifies the visible height of the textarea in lines. The default styling sets `min-h-5xl` and `resize-none`.
    *   `cols`: (Optional) Number. Specifies the visible width of the textarea in characters.
    *   `...rest`: Any other valid HTML textarea attributes (e.g., `maxLength`, `minLength`, `required`, `id`, `name`, `readOnly`).
*   **Do\'s:**
    *   Always use a corresponding `<label>` component for accessibility, associating it with the textarea using `htmlFor` and `id` attributes.
    *   Provide a reasonable default size (e.g., using `rows` or CSS height) that accommodates typical input length.
    *   Consider if resizing should be enabled (default is `resize-none` in this component, which is often good for consistency, but can be overridden via `className`).
*   **Don'ts:**
    *   Don't use a `<textarea>` for single-line input; use `<input type="text">` instead.
    *   Avoid making the default size too small if users frequently input large amounts of text.

---

| Component | Path | Props | Variants |
| --- | --- | --- | --- |
| Button | components/ui/Button.tsx | `variant`, `size`, `asChild`, `...rest` | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` |
| Input | components/ui/input.tsx | `type`, `className`, `placeholder`, `disabled`, `value`, `onChange`, `...rest` | N/A |
| Card | components/ui/card.tsx | `className`, `...rest` | N/A |
| Dialog | components/ui/dialog.tsx | `open`, `onOpenChange`, `className` | N/A |
| Select | components/ui/select.tsx | `value`, `onValueChange`, `defaultValue`, `disabled`, `placeholder`, `className`, `position` | N/A |
| Textarea | components/ui/textarea.tsx | `className`, `placeholder`, `disabled`, `value`, `onChange`, `rows`, `cols`, `...rest` | N/A |
