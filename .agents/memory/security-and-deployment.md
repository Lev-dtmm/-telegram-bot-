---
name: Bot security and deployment
description: Durable constraints for this Telegram bot's privacy and always-on hosting.
---

The Telegram bot must use an always-on process deployment rather than a sleeping/stateless web deployment. User-facing privacy copy must distinguish in-memory app context from Telegram/OpenAI processing; never promise absolute confidentiality. Safety screening must happen before any AI call.

**Why:** A Telegram polling process stops when its host sleeps, and external AI providers necessarily process messages sent for generation.

**How to apply:** Preserve the VM/always-on run command when moving hosting providers, keep rate limits and pre-AI safety checks enabled, and review privacy wording whenever storage or providers change.
