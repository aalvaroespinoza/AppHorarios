# Data Model

The data model for LifeOS extends beyond simple schedules to encompass a broader view of a person's life.

## Core Entities (Proposed)

### `UserContext`
Represents the current state of the user (e.g., location, current activity, device state).

### `Routine`
A recurring set of activities.
- `id`: string
- `name`: string
- `triggers`: Event[]

### `Event`
A time-bound occurrence (e.g., a university class, a meeting).
- `startTime`: Date
- `endTime`: Date
- `location`: string

### `TransitRequirement`
A derived entity based on an `Event` that requires moving from point A to point B.
- `origin`: string
- `destination`: string
- `targetArrivalTime`: Date
