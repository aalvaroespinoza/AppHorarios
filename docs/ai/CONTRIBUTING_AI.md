# Contributing to AI Features

Adding AI capabilities to LifeOS requires careful consideration of performance, privacy, and cost.

## Workflow for New Prompts/Models
1. **Drafting:** Write the proposed prompt and expected inputs/outputs.
2. **Testing:** Test the prompt in the Gemini Studio or OpenAI Playground with edge cases (e.g., no buses available, conflicting events).
3. **Integration:** Implement the call via the central AI service utility to ensure proper error handling and fallback logic.

## Privacy Rules
- **NEVER** send sensitive personal identifiable information (PII) to external APIs unless absolutely required and explicitly consented by the user.
- Prefer smaller, local models (if implemented in the future) for highly sensitive data.
