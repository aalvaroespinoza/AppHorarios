# Memory and Context

For LifeOS to be truly smart and proactive, it needs a concept of "Memory".

## Short-Term Context
Data relevant to the current session or day:
- Current location.
- Today's agenda.
- Active transit recommendations.
- Weather conditions.

## Long-Term Memory
Historical data and user preferences used by the AI to make better decisions:
- Preferred bus lines or operators.
- Average walking speed to the bus stop.
- Frequency of attending optional classes.

## Implementation (Pending Decision)
- **Vector Database:** For semantic search over past journal entries or tasks.
- **Local Storage / IndexedDB:** For caching context offline.
