---
name: ui-design
description: Apply Brad Frost's Atomic Design methodology to construct, audit, and maintain modular UI component systems and design systems. Use when organizing component hierarchies, conducting UI inventories, structuring templates vs pages, or establishing design system workflows. When that UI work hits a code seam (module interface, testability, where implementation lives), also use the deep-module lane in this skill.
---

# UI design

Two lanes in one skill. Start in **Atomic design** for UI systems. Enter **Deep modules** only when that UI work hits a code seam.

Source for lane 1: Brad Frost, _Atomic Design_ (https://atomicdesign.bradfrost.com). Lane 2 is the deep-module vocabulary (interface, seam, adapter, leverage).

## When to use

Load this skill for component hierarchies, UI inventories, templates vs pages, and design-system workflow.

Stay in **Atomic design** for naming stages, inventories, pattern libraries, and governance.

Enter **Deep modules** when the same work needs an interface vs implementation, a seam location, testability through that interface, or AI-navigable module shape. Do not enter the module lane for a pure visual inventory with no code seam.

The lanes are not a mash-up. Atomic stages stay Atomic. Module terms stay module terms. Do not substitute "component" for **Module**, or "atom" for a TypeScript interface.

### Lane pick

| Work                                                                                         | Lane                                                |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Hierarchy, inventory, templates vs pages, pattern library, governance                        | Atomic design                                       |
| Where a UI piece's interface lives, what callers must know, adapters, tests across that seam | Deep modules                                        |
| Both (e.g. an organism that is also a deep module)                                           | Atomic design first, then Deep modules for the seam |

---

# Lane: Atomic design

A methodology and mental model for designing and engineering user interfaces as deliberate, hierarchical systems. It treats interfaces as both a cohesive whole and a collection of parts simultaneously.

## The core idea

Stop thinking in pages. Think in systems.

A page is a convenient fiction. What actually determines the effort on a project is the functionality and components inside those pages, not their count. A 30,000-page university site might have three content types and two layouts. A "simple" homepage might take months if it contains dynamic forms, carousels, and third-party integrations.

Atomic design gives you a mental model for building UI systems deliberately: break interfaces into their smallest meaningful parts, then compose those parts into larger structures. You work at all levels simultaneously, not sequentially.

```
[ Atoms ] ──> [ Molecules ] ──> [ Organisms ] ──> [ Templates ] ──> [ Pages ]
 (Tags/Tokens)    (Simple UI)      (Sections)       (Layout/Slots)   (Real Content/Edge Cases)
```

## The five stages

### 1. Atoms

The smallest functional UI elements and design tokens that cannot be broken down further without losing meaning.

- **Examples**: `Button`, `Input`, `Label`, `Icon`, `Badge`, `Heading`, `Spinner`, color swatches, typography styles, spacing tokens.
- **Role**: They do nothing useful alone, but they define the raw vocabulary of the interface and capture base styles at a glance.
- **Rules**:
  - Keep atoms context-agnostic. They do not know about domain entities (e.g. an atom is `Badge`, not `OrderStatusBadge`).
  - Rely on design tokens (CSS variables, design tokens) for colors, spacing, borders, and typography.
  - Handle low-level states (hover, focus, active, disabled).

### 2. Molecules

Simple groups of atoms bonded together into a single, focused functional unit.

- **Examples**: `SearchInput` (Label + Input + SearchButton), `FormField` (Label + Input + ErrorMessage), `UserAvatar` (AvatarImage + OnlineIndicatorBadge + UserName), `PaginationItem`, `MediaBlock` (Image + Headline + Teaser text).
- **Role**: The combination has a purpose the individual atoms lack.
- **Rules**:
  - Follow the Single Responsibility Principle: do one simple job well.
  - Build for reuse across different organisms and contexts.
  - Accept pure props and emit events; avoid fetching data or coupling to global state.

### 3. Organisms

Relatively complex, standalone interface components formed from groups of molecules, atoms, or other organisms.

- **Examples**: `SiteHeader` (Logo atom + NavigationList molecule + SearchInput molecule + ProfileMenu molecule), `ProductCardGrid`, `PricingTable`, `CommentThread`, `FilterSidebar`.
- **Role**: Organisms form distinct, recognizable sections of an interface, and they start to feel like recognizable pieces of a real product.
- **Rules**:
  - Organisms form distinct, recognizable sections of an interface.
  - Can manage local layout and composite state (e.g. active tab in a tabbed panel).
  - May accept structured domain objects or slot in child molecules.

### 4. Templates

Page-level layouts that place organisms, molecules, and atoms into a structure.

- **Examples**: `DashboardLayout`, `ArticleTemplate`, `CheckoutTemplate`, `SettingsTemplate`.
- **Role**: Templates are content-agnostic: they show the skeleton, not the flesh. Image dimensions, character limits, column counts. The template answers "what is the structure?" without yet answering "what is the content?".
- **Rules**:
  - Focus on layout, grid, and content structure, not real production data.
  - Define slots/zones where components live and establish responsive container rules.
  - Set content constraints (e.g. maximum column width, image aspect ratios, fallback slots).

### 5. Pages

Specific, rendered instances of templates populated with real or representative content.

- **Examples**: "Checkout Page with 3 items in cart and coupon applied", "Article Page with missing hero image and 120-character headline (German translation)", "Dashboard with empty activity feed", "Admin view with elevated control buttons".
- **Role**: Pages are where you test whether the system actually works. Pages validate the system.
- **Rules**:
  - Stress-test template resilience with production edge cases:
    - Long strings, extreme text lengths, and line wraps.
    - Missing or broken assets (no avatar, failed image load).
    - Empty states, error boundaries, and loading skeletons.
    - Localization and right-to-left (RTL) text.
  - Use pages as the feedback loop: if something breaks on a page, determine whether to adjust an atom, molecule, organism, or template, rather than hacking a one-off fix on the page.

## Not a linear process

The five stages are a mental model, not a checklist. Do not read them as "first atoms, then molecules, then organisms." Real work moves in all directions. You zoom into a button to fix a broken state and zoom back out to see how that change ripples through a header, a template, and a page. The goal is to hold both levels of abstraction at once, the way a painter steps back to assess the whole composition and steps forward to add a precise stroke.

## Decision matrix: where does it belong?

| Question                                                                            | If Yes               | If No    |
| :---------------------------------------------------------------------------------- | :------------------- | :------- |
| Can it be broken down into smaller functional UI elements?                          | Molecule or Organism | **Atom** |
| Does it do exactly one simple task and have minimal structural layout?              | **Molecule**         | Organism |
| Does it form a complete, standalone section or feature block?                       | **Organism**         | Template |
| Does it define content placement, layout skeleton, and page grid without real data? | **Template**         | Page     |
| Is it a rendered view with actual content, testing real edge cases?                 | **Page**             | Template |

## Why it matters beyond vocabulary

### Consistency at scale

Reusing components means users see the same patterns in the same states everywhere. This is not aesthetics; it is trust. Inconsistent UIs shift cognitive burden onto users and signal that something might go wrong.

### Speed after setup

The upfront investment in building the system pays back on every subsequent feature. Patterns already exist. You reach for them rather than reinvent them. Late in a project, creating a new template mostly means stitching together components that already work.

### Testing in isolation

A pattern library lets you pull any component out of the page and examine it alone. Browser bugs, performance issues, and accessibility failures are easier to pin down when the component is not buried in a full page layout.

### Shared vocabulary

When a designer calls something a "utility toolbar" and a developer calls it a "floating action area," you have a coordination problem. Atomic design forces the team to name patterns, and named patterns become the shared language that reduces meetings and misunderstandings.

## Interface inventories

Before building a new system or refactoring a legacy codebase, do an interface audit. Screenshot every unique UI component: buttons, headings, forms, navigation, icons, alerts, colors, animation. Pull the whole team in: designers, developers, content people, product owners.

The document you produce does two things:

1. **Exposes inconsistency**: It shows everyone the inconsistency hiding in plain sight (e.g. 14 button styles, 8 gray shades), which builds the organizational will to fix it.
2. **Raw material**: It becomes the raw material for your pattern library. You are not designing from a blank slate; you are rationalizing what already exists.

### Categories to capture

- Global elements (headers, footers)
- Navigation (menus, tabs, breadcrumbs, pagination)
- Typography (headings, body sizes, inline text, lists)
- Buttons (primary, secondary, danger, ghost, icon-only)
- Form controls (inputs, checkboxes, selects, date pickers, validation states)
- Blocks and cards
- Lists and tables
- Feedback and messaging (toasts, alerts, banners, modals, dialogs)
- Media containers and image types
- Animation and transitions
- Colors and depth/shadows

## The atomic workflow

### Establish direction without full comps

Before any high-fidelity work:

- **20-second gut test.** Show stakeholders 20-30 sites for 20 seconds each. Score them 1-10. Discuss the extremes and contentious scores to surface aesthetic values fast without building anything.
- **Style tiles.** Color, type, texture, and general atmosphere on one page. Not a layout, not a comp. Fast to produce, easy to revise, good for surfacing taste differences early.
- **Element collages.** Apply the emerging aesthetic to actual interface fragments: a card, a button group, a hero strip. More concrete than a style tile, less constrained than a full comp.

Start UX with lo-fi sketches that answer: "What content is on this page, and in what order?" A bulleted list or a blocked-out wireframe is enough. Do not spec every pixel before development has started.

### Front-end as prep work

Developers should write code from day one, before design direction is locked. Set up shell templates, stub out markup for patterns you know will exist (header, footer, forms, search). This code creates a foundation for collaboration and removes the handoff moment where design throws a static comp over the wall and disappears.

### Design in the browser sooner

Static comps cannot capture responsiveness, interaction, performance, or browser quirks. They are hypotheses. Get design into the browser quickly so the team can validate those hypotheses against the real medium. Then keep iterating there. "Deciding in the browser" (Dan Mall) is more honest than "designing in the browser."

Full comps still have a role: they paint a complete picture that sells a direction to stakeholders and communicates overall aesthetic intent. The trick is timing them after exploratory work, not before, and treating them as conversation starters rather than specifications.

### Build and refine iteratively

As patterns become solid, every template that includes them becomes more solid automatically. The nesting doll structure means a fix to a button propagates everywhere that button is used. Fidelity builds up like subtractive sculpture, not like a factory line.

## Pattern libraries & technical architecture

A pattern library is the living container for the design system. Not a static PDF, not an archived design file. A running, browseable, testable hub of every UI component.

### Workshop vs storefront

- **The Workshop**: The development environment where components are engineered and tested in isolation (Storybook, Pattern Lab, Vite component playgrounds).
- **The Storefront**: The published documentation portal explaining when and how to use each component, design guidelines, and code examples.

### What an effective pattern library includes

- Pattern descriptions and usage guidelines (dos and don'ts).
- Rendered live examples of every component.
- The underlying HTML, CSS, and JavaScript.
- Fluid viewport and container query testing tools.
- Dynamic state variations:
  - Default / Empty
  - Hover / Focus / Active
  - Loading / Skeleton
  - Disabled / Read-only
  - Error / Warning / Success
  - Extremes (maximum string length, zero items, overflow)
- Pattern lineage: what smaller patterns compose this one, and where is it used across the product.

### Dynamic data & worst-case testing

Hardcode as little as possible. Use templating and data files to swap in realistic content, especially worst-case content: a name that wraps to three lines, a title with 340 characters, a cart with 87 items, a dashboard showing a first-time user state. Designing only for best-case scenarios creates fragile systems.

### The holy grail

The ideal state is a pattern library and production environment that share the same source of truth. Change a pattern once, see it update everywhere, in the library and in the live app. If technical barriers prevent a shared code pipeline right away, start smaller: share CSS bundles, design tokens, and document patterns clearly, reducing the gap over time.

## Maintaining the system

The biggest failure mode for design systems is not bad architecture; it is neglect.

### Design system first, not page first

Every change to a live product should trigger a question: does this change belong in the system? A one-off fix on a product page is often a missed opportunity to improve a pattern everywhere. This "friendly friction" is a feature. It forces considered decisions and prevents slow erosion.

### Make it official

A design system that lives as a side project will eventually die as one. It needs:

- A named owner or team.
- Allocated time and budget.
- A governance plan: who approves changes, who retires patterns, how are bugs filed, how are updates deployed.
- A product roadmap, not just a backlog.

### Team models

- **Centralized**: A dedicated team owns, builds, and maintains the design system for product teams. High consistency, risk of bottleneck.
- **Federated**: Cross-functional team members from multiple product teams collectively contribute and govern the system. High adoption, requires discipline.
- **Hybrid**: A lean core team coordinates architectural integrity and releases while product squads contribute components and bugfixes.

### Makers and users

Some people build and maintain the system (makers). Some people use it to build products (users). Both groups matter, and they need to talk regularly. Makers see the full ecosystem. Users see the sharp edges in specific applications.

### Communicating change

Post a changelog. Maintain a roadmap. Send updates to wherever your team already congregates (chat channels, PR notifications, release notes). If users do not know the system changed, they will not adopt the change.

### Naming patterns for longevity

Name patterns by structure, not by context or content. "Card" beats "product card." "Carousel" beats "homepage carousel." Context-agnostic names make patterns reusable across new applications you have not built yet. When auditing names, blur out the content of each component and ask: what is the structure?

### Make it public

A public style guide is more accountable than an internal one. It also recruits people who care about systems thinking.

## Pattern lifecycle checklist

Before adding or modifying any pattern, run through:

1. **Does it already exist?** Check if an existing atom/molecule can be extended with a variant prop.
2. **Is it genuinely reusable?** If it only appears in one specific domain flow, keep it in the feature repo before promoting to the shared design system.
3. **Is it accessible?** Screen reader labels, keyboard navigation, contrast ratios, ARIA attributes.
4. **Is it responsive?** Test across fluid viewport widths, container queries, and varied device sizes.
5. **Is it documented?** Include props table, edge case examples, and usage rules.

## Technology independence

Atomic design is not about CSS methodology, JavaScript architecture, or any specific framework. It applies to any user interface: web apps, native mobile apps, desktop software, or embedded displays. The five stages are a mental model for thinking about interfaces as systems of parts, regardless of what technology renders them.

Using a framework like Bootstrap is not the same thing. Frameworks provide someone else's system. Atomic design helps you build your own.

---

# Lane: Deep modules

Design **deep modules**: a lot of behaviour behind a small interface, placed at a clean seam, testable through that interface. Use this language and these principles wherever the UI work is being designed or restructured as code. The aim is leverage for callers, locality for maintainers, and testability for everyone.

Enter this lane from UI work when you are choosing a seam, shrinking an interface, placing an adapter, or making a component testable through that interface. Standalone backend-module design without UI is outside this skill's trigger; do not stretch the description to fire for that alone.

## Glossary

Use these terms exactly: don't substitute "component," "service," "API," or "boundary." Consistent language is the whole point.

**Module**: anything with an interface and an implementation. Deliberately scale-agnostic: a function, class, package, or tier-spanning slice. _Avoid_: unit, component, service.

**Interface**: everything a caller must know to use the module correctly: the type signature, but also invariants, ordering constraints, error modes, required configuration, and performance characteristics. _Avoid_: API, signature (too narrow, they refer only to the type-level surface).

**Implementation**: what's inside a module, its body of code. Distinct from **Adapter**: a thing can be a small adapter with a large implementation (a Postgres repo) or a large adapter with a small implementation (an in-memory fake). Reach for "adapter" when the seam is the topic; "implementation" otherwise.

**Depth**: leverage at the interface. The amount of behaviour a caller (or test) can exercise per unit of interface they have to learn. A module is **deep** when a large amount of behaviour sits behind a small interface, **shallow** when the interface is nearly as complex as the implementation.

**Seam** (Michael Feathers): a place where you can alter behaviour without editing in that place; the location at which a module's interface lives. Where to put the seam is its own design decision, distinct from what goes behind it. _Avoid_: boundary (overloaded with DDD's bounded context).

**Adapter**: a concrete thing that satisfies an interface at a seam. Describes role (what slot it fills), not substance (what's inside).

**Leverage**: what callers get from depth. More capability per unit of interface they learn. One implementation pays back across N call sites and M tests.

**Locality**: what maintainers get from depth. Change, bugs, knowledge, and verification concentrate in one place rather than spreading across callers. Fix once, fixed everywhere.

## Deep vs shallow

**Deep module** = small interface + lots of implementation:

```
+---------------------+
|   Small Interface   |  <- Few methods, simple params
+---------------------+
|                     |
|  Deep Implementation|  <- Complex logic hidden
|                     |
+---------------------+
```

**Shallow module** = large interface + little implementation (avoid):

```
+---------------------------------+
|       Large Interface           |  <- Many methods, complex params
+---------------------------------+
|  Thin Implementation            |  <- Just passes through
+---------------------------------+
```

When designing an interface, ask:

- Can I reduce the number of methods?
- Can I simplify the parameters?
- Can I hide more complexity inside?

## Principles

- **Depth is a property of the interface, not the implementation.** A deep module can be internally composed of small, mockable, swappable parts; they just aren't part of the interface. A module can have **internal seams** (private to its implementation, used by its own tests) as well as the **external seam** at its interface.
- **The deletion test.** Imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.
- **The interface is the test surface.** Callers and tests cross the same seam. If you want to test past the interface, the module is probably the wrong shape.
- **One adapter means a hypothetical seam. Two adapters means a real one.** Don't introduce a seam unless something actually varies across it.

## Designing for testability

Good interfaces make testing natural:

1. **Accept dependencies, don't create them.**

   ```typescript
   // Testable
   function processOrder(order, paymentGateway) {}

   // Hard to test
   function processOrder(order) {
     const gateway = new StripeGateway();
   }
   ```

2. **Return results, don't produce side effects.**

   ```typescript
   // Testable
   function calculateDiscount(cart): Discount {}

   // Hard to test
   function applyDiscount(cart): void {
     cart.total -= discount;
   }
   ```

3. **Small surface area.** Fewer methods = fewer tests needed. Fewer params = simpler test setup.

## Relationships

- A **Module** has exactly one **Interface** (the surface it presents to callers and tests).
- **Depth** is a property of a **Module**, measured against its **Interface**.
- A **Seam** is where a **Module**'s **Interface** lives.
- An **Adapter** sits at a **Seam** and satisfies the **Interface**.
- **Depth** produces **Leverage** for callers and **Locality** for maintainers.

## Rejected framings

- **Depth as ratio of implementation-lines to interface-lines** (Ousterhout): rewards padding the implementation. We use depth-as-leverage instead.
- **"Interface" as the TypeScript `interface` keyword or a class's public methods**: too narrow: interface here includes every fact a caller must know.
- **"Boundary"**: overloaded with DDD's bounded context. Say **seam** or **interface**.
