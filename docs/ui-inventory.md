# UI Inventory

This file is auto-generated. Run `npm run generate:ui-inventory` (or `pnpm run generate:ui-inventory`) to update.

**Manual Enhancements & Usage Guidelines**

Below are short usage tips for every component found in `components/ui/`. These examples assume the component is imported directly from that folder.

### Button (`components/ui/Button.tsx`)
- **Purpose:** Trigger actions or submit forms.
- **Example:**
```tsx
<Button variant="default">Save</Button>
```

### Accordion (`components/ui/accordion.tsx`)
- **Purpose:** Expandable sections for dense content.
- **Example:**
```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="a">
    <AccordionTrigger>Open</AccordionTrigger>
    <AccordionContent>Details here</AccordionContent>
  </AccordionItem>
</Accordion>
```

### Alert Dialog (`components/ui/alert-dialog.tsx`)
- **Purpose:** Confirm destructive or high‑impact actions.
- **Example:**
```tsx
<AlertDialog>
  <AlertDialogTrigger>Delete</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
    <AlertDialogAction>Yes</AlertDialogAction>
  </AlertDialogContent>
</AlertDialog>
```

### Alert (`components/ui/alert.tsx`)
- **Purpose:** Display transient status messages.
- **Example:**
```tsx
<Alert variant="destructive">Failed to save</Alert>
```

### Aspect Ratio (`components/ui/aspect-ratio.tsx`)
- **Purpose:** Maintain consistent width/height ratios for media.
- **Example:**
```tsx
<AspectRatio ratio={16 / 9}>
  <img src="/hero.jpg" alt="" />
</AspectRatio>
```

### Avatar (`components/ui/avatar.tsx`)
- **Purpose:** Display user or entity images.
- **Example:**
```tsx
<Avatar>
  <AvatarImage src="/user.png" />
  <AvatarFallback>U</AvatarFallback>
</Avatar>
```

### Badge (`components/ui/badge.tsx`)
- **Purpose:** Small label for statuses or counts.
- **Example:**
```tsx
<Badge variant="secondary">New</Badge>
```

### Breadcrumb (`components/ui/breadcrumb.tsx`)
- **Purpose:** Show hierarchical navigation.
- **Example:**
```tsx
<Breadcrumb>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
</Breadcrumb>
```

### Calendar (`components/ui/calendar.tsx`)
- **Purpose:** Date picker control.
- **Example:**
```tsx
<Calendar mode="single" selected={date} onSelect={setDate} />
```

### Card (`components/ui/card.tsx`)
- **Purpose:** Container with optional header and footer.
- **Example:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Profile</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Carousel (`components/ui/carousel.tsx`)
- **Purpose:** Horizontal swipeable content.
- **Example:**
```tsx
<Carousel>
  <CarouselItem>Slide one</CarouselItem>
  <CarouselItem>Slide two</CarouselItem>
</Carousel>
```

### Chart (`components/ui/chart.tsx`)
- **Purpose:** Wrapper around Recharts primitives.
- **Example:**
```tsx
<Chart.LineChart data={data} />
```

### Checkbox (`components/ui/checkbox.tsx`)
- **Purpose:** Binary option selection.
- **Example:**
```tsx
<Checkbox checked={value} onCheckedChange={setValue} />
```

### Collapsible (`components/ui/collapsible.tsx`)
- **Purpose:** Toggle visibility of content without accordion semantics.
- **Example:**
```tsx
<Collapsible open={open} onOpenChange={setOpen}>
  <CollapsibleTrigger>Show</CollapsibleTrigger>
  <CollapsibleContent>Hidden text</CollapsibleContent>
</Collapsible>
```

### Combobox (`components/ui/combobox.tsx`)
- **Purpose:** Autocomplete input with selectable options.
- **Example:**
```tsx
<Combobox options={options} onSelect={setValue} />
```

### Command (`components/ui/command.tsx`)
- **Purpose:** Command palette style search and actions.
- **Example:**
```tsx
<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Type a command" />
</CommandDialog>
```

### Context Menu (`components/ui/context-menu.tsx`)
- **Purpose:** Right‑click menus for additional actions.
- **Example:**
```tsx
<ContextMenu>
  <ContextMenuTrigger>Right click me</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Copy</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

### Dialog (`components/ui/dialog.tsx`)
- **Purpose:** Modal dialog windows.
- **Example:**
```tsx
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>Content</DialogContent>
</Dialog>
```

### Drawer (`components/ui/drawer.tsx`)
- **Purpose:** Slide‑in panel from screen edge.
- **Example:**
```tsx
<Drawer open={open} onOpenChange={setOpen}>
  <DrawerContent>Panel</DrawerContent>
</Drawer>
```

### Dropdown Menu (`components/ui/dropdown-menu.tsx`)
- **Purpose:** Triggered menu of related actions.
- **Example:**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger>Options</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Share</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Form (`components/ui/form.tsx`)
- **Purpose:** Helpers for React Hook Form wiring.
- **Example:**
```tsx
<Form {...methods}>
  <Input name="email" />
</Form>
```

### Hover Card (`components/ui/hover-card.tsx`)
- **Purpose:** Popover that appears on hover.
- **Example:**
```tsx
<HoverCard>
  <HoverCardTrigger>@user</HoverCardTrigger>
  <HoverCardContent>User info</HoverCardContent>
</HoverCard>
```

### Input (`components/ui/input.tsx`)
- **Purpose:** Styled text field.
- **Example:**
```tsx
<Input placeholder="Search" />
```

### Input OTP (`components/ui/input-otp.tsx`)
- **Purpose:** Multi‑cell input for one‑time passwords.
- **Example:**
```tsx
<InputOTP value={code} onChange={setCode} />
```

### Label (`components/ui/label.tsx`)
- **Purpose:** Accessible form labels.
- **Example:**
```tsx
<Label htmlFor="name">Name</Label>
```

### Menubar (`components/ui/menubar.tsx`)
- **Purpose:** Horizontal application menu.
- **Example:**
```tsx
<Menubar>
  <MenubarMenu label="File" />
</Menubar>
```

### Motion (`components/ui/motion.tsx`)
- **Purpose:** Predefined Framer Motion variants.
- **Example:**
```tsx
<motion.div variants={fadeIn} />
```

### Navigation Menu (`components/ui/navigation-menu.tsx`)
- **Purpose:** Responsive navigation bar.
- **Example:**
```tsx
<NavigationMenu>
  <NavigationMenuItem>Home</NavigationMenuItem>
</NavigationMenu>
```

### Pagination (`components/ui/pagination.tsx`)
- **Purpose:** Page navigation controls.
- **Example:**
```tsx
<Pagination totalPages={10} currentPage={page} onPageChange={setPage} />
```

### Popover (`components/ui/popover.tsx`)
- **Purpose:** Small overlay triggered by another element.
- **Example:**
```tsx
<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>More info</PopoverContent>
</Popover>
```

### Progress (`components/ui/progress.tsx`)
- **Purpose:** Display task completion.
- **Example:**
```tsx
<Progress value={50} />
```

### Radio Group (`components/ui/radio-group.tsx`)
- **Purpose:** Select a single option from many.
- **Example:**
```tsx
<RadioGroup value={val} onValueChange={setVal}>
  <RadioGroupItem value="a" />
  <RadioGroupItem value="b" />
</RadioGroup>
```

### Resizable (`components/ui/resizable.tsx`)
- **Purpose:** Drag to resize adjacent panels.
- **Example:**
```tsx
<Resizable direction="horizontal">
  <ResizablePanel>Left</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel>Right</ResizablePanel>
</Resizable>
```

### Scroll Area (`components/ui/scroll-area.tsx`)
- **Purpose:** Custom scrollbars for overflowing content.
- **Example:**
```tsx
<ScrollArea className="h-48">{items}</ScrollArea>
```

### Select (`components/ui/select.tsx`)
- **Purpose:** Choose one option from a list.
- **Example:**
```tsx
<Select defaultValue="1" onValueChange={setValue}>
  <SelectTrigger />
  <SelectContent>
    <SelectItem value="1">One</SelectItem>
  </SelectContent>
</Select>
```

### Separator (`components/ui/separator.tsx`)
- **Purpose:** Visual divider between items.
- **Example:**
```tsx
<Separator />
```

### Sheet (`components/ui/sheet.tsx`)
- **Purpose:** Drawer built with Radix `Dialog`.
- **Example:**
```tsx
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent>Side content</SheetContent>
</Sheet>
```

### Sidebar (`components/ui/sidebar.tsx`)
- **Purpose:** Responsive navigation + search sidebar.
- **Example:**
```tsx
<Sidebar items={links} />
```

### Skeleton (`components/ui/skeleton.tsx`)
- **Purpose:** Placeholder loading blocks.
- **Example:**
```tsx
<Skeleton className="h-4 w-32" />
```

### Slider (`components/ui/slider.tsx`)
- **Purpose:** Choose numeric values in a range.
- **Example:**
```tsx
<Slider min={0} max={100} value={val} onValueChange={setVal} />
```

### Sonner (`components/ui/sonner.tsx`)
- **Purpose:** Theme‑aware toast provider.
- **Example:**
```tsx
<Toaster />
```

### Switch (`components/ui/switch.tsx`)
- **Purpose:** Toggle boolean settings.
- **Example:**
```tsx
<Switch checked={on} onCheckedChange={setOn} />
```

### Table (`components/ui/table.tsx`)
- **Purpose:** Semantic table elements with consistent styles.
- **Example:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
    </TableRow>
  </TableHeader>
</Table>
```

### Tabs (`components/ui/tabs.tsx`)
- **Purpose:** Show one section at a time.
- **Example:**
```tsx
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
  </TabsList>
  <TabsContent value="account">...</TabsContent>
</Tabs>
```

### Textarea (`components/ui/textarea.tsx`)
- **Purpose:** Multi‑line text input.
- **Example:**
```tsx
<Textarea rows={5} placeholder="Comment" />
```

### Toast (`components/ui/toast.tsx`)
- **Purpose:** Low‑level toast primitives.
- **Example:**
```tsx
<Toast open={open} onOpenChange={setOpen}>Saved!</Toast>
```

### Toaster (`components/ui/toaster.tsx`)
- **Purpose:** Convenience wrapper around `useToast`.
- **Example:**
```tsx
<Toaster />
```

### Toggle Group (`components/ui/toggle-group.tsx`)
- **Purpose:** Choose one or many toggle options.
- **Example:**
```tsx
<ToggleGroup type="multiple" value={vals} onValueChange={setVals}>
  <ToggleGroupItem value="a" />
</ToggleGroup>
```

### Toggle (`components/ui/toggle.tsx`)
- **Purpose:** Pressable on/off button.
- **Example:**
```tsx
<Toggle pressed={active} onPressedChange={setActive} />
```

### Tooltip (`components/ui/tooltip.tsx`)
- **Purpose:** Informational hover labels.
- **Example:**
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button>?</button>
    </TooltipTrigger>
    <TooltipContent>Help text</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Typography (`components/ui/typography.tsx`)
- **Purpose:** Styled text elements like `h1` and `p`.
- **Example:**
```tsx
<Typography.h1>Title</Typography.h1>
```


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
| prompt-picker | components/prompt-picker.tsx |  |  |
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
| chat-prompt-selector | components/chat-prompt-selector.tsx |  |  |
| category-select | components/category-select.tsx |  |  |
| category-manager | components/category-manager.tsx |  |  |
| category-manager-skeleton | components/category-manager-skeleton.tsx |  |  |
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
| ChatPageClient | app/chat/ChatPageClient.tsx | initialPrompt |  |
| page | app/categories/page.tsx |  |  |
