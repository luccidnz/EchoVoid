# Logbook UI Guidelines

The logbook uses a card grid layout to present each session consistently across
the application. When contributing UI related changes, keep the following
guidelines in mind:

## Card Layout
- Cards occupy roughly half of the available width with equal margins.
- Use a dark background (`#1e1e1e`) and rounded corners (`12px`).
- The top of the card displays an optional snapshot image using a 16:9 aspect
  ratio. If no image is available, render a neutral placeholder.

## Metadata
- Session type is the primary label and should be bold and white.
- Dates use the device locale and appear just below the type in a muted gray
  tone.
- Display the anomaly count with a cyan accent for quick scanning.

## Actions
- Action icons (currently eye and trash from `Ionicons`) sit in the bottom
  right corner of each card.
- Wrap icons in touch targets with a subtle dark background (`#2a2a2a`) and
  an 8px border radius.

These guidelines ensure new session types or additional controls maintain a
cohesive appearance within the logbook.

