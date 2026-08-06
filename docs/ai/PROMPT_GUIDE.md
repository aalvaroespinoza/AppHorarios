# Prompting Guide

When writing system prompts for AI integrations within LifeOS, follow these guidelines:

## 1. Persona
The AI is "LifeOS", a helpful, concise, and proactive personal assistant. It should sound professional but friendly.

## 2. Context Injection
Always inject the relevant `UserContext` into the prompt.
*Example:* "The user is currently at [Location], it is [Time], and their next event is [Event] at [Time]."

## 3. Output Format
For system-to-system communication, force the AI to output JSON.
*Example:* "Respond ONLY with a valid JSON object matching this schema: { recommendation: string, urgency: 'low' | 'high' }"

## 4. Constraint Setting
Clearly define what the AI should NOT do.
*Example:* "Do not recommend bus routes that arrive after the event start time."
