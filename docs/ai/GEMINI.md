# Gemini Integration

LifeOS utilizes Google's Gemini models for advanced reasoning and natural language processing.

## Use Cases
- **Schedule Optimization:** "Given my classes today and the current bus schedule, what is the most optimal time to leave considering I want to study in the library for an hour?"
- **Contextual Notifications:** Generating human-friendly notifications (e.g., "It's raining today. Take the 14:00 bus instead of 14:30 so you don't have to rush in the rain.").
- **Data Parsing:** Extracting structured event data from unstructured text (e.g., reading a syllabus to automatically populate class blocks).

## Implementation Guidelines
- Interactions with Gemini should be abstracted behind an API route to secure API keys.
- Always provide clear, structured system prompts (see `PROMPT_GUIDE.md`).
