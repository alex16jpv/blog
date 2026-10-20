---
title: MiniMax M3.1 Flash Cuts Agent Costs With a Faster, Cheaper Model
date: "2026-10-20T13:58:08.000Z"
description: "MiniMax launched M3.1 Flash, a 1M-context agentic model at $0.15/$0.60 per million tokens that it says runs agent tasks 70% cheaper and about 3x faster."
---

## What Happened?

On October 19, 2026, Chinese AI lab MiniMax released **MiniMax M3.1 Flash**, a faster and cheaper update to the M3 model it launched in June. The model is live today on the MiniMax API (as `MiniMax-M3.1-Flash`), in the M Plan subscription and in the MiniMax Code desktop app. MiniMax says the weights will follow later.

The launch also solved a small community mystery. For several weeks an anonymous model called **"Space Bunny"** had been available on OpenRouter, and testers suspected it came from MiniMax after probing its tokenizer. MiniMax has now confirmed that Space Bunny was an early build of M3.1 Flash, and says it processed **more than 200 trillion tokens** before its identity was revealed. That is a lot of real-world traffic for a model that, officially, did not exist yet.

### Why It Matters

Agents are expensive in a way that chat is not. A single coding or browsing task can fan out into dozens of model calls, each one re-reading a long context. That makes **price per task**, not price per token, the number that decides whether an agent is viable in production.

M3.1 Flash is built around that idea:

- **70% lower cost** on agentic tasks compared with its predecessor, according to MiniMax.
- **Close to 3x faster inference**, with output speeds above 200 tokens per second in everyday use and a median of 170+ tokens per second.
- **Flat, low pricing** with no long-context surcharge.

It also lands two days after DeepSeek shipped V4.1-Flash-1017. The "Flash" tier of Chinese models is quickly becoming a price war fought on agent workloads, and developers are the main beneficiaries.

### Technical Details

Here is what we know so far. Note that MiniMax has not published a technical report for the Flash variant yet, so some details come from the developer guide and early coverage.

- **Architecture:** a mixture-of-experts (MoE) model with about **428B total parameters**, essentially the same size as M3 (reported at roughly 23B active). The speed-up comes from more aggressive sparsity at inference time rather than a smaller model.
- **Context window:** up to **1 million tokens**.
- **Inputs:** text, images and video; output is text.
- **Reasoning is always on.** You pick one of five effort levels (Low, Medium, High, Xhigh, Max), but you cannot disable thinking entirely. Reportedly, reasoning now comes back in a separate `reasoning_content` field, so integrations that parsed inline `<think>` tags from M3 may need an update.
- **API compatibility:** reported to support both Anthropic-compatible and OpenAI-compatible endpoints, which makes it easy to try in existing agent frameworks.

**Pricing (per 1M tokens):**

| Type | Price |
| --- | --- |
| Input | $0.15 |
| Cached input | $0.015 |
| Output | $0.60 |

For comparison, that is half of M3's standard rate of $0.30 / $1.20.

### Benchmarks

All numbers below are reported by MiniMax and have not been independently verified:

- **OSWorld V2** (computer use): 61.7, which MiniMax says is the best score among Chinese models.
- **DeepSWE v1.1** (software engineering): 73.7%, slightly behind DeepSeek's 77.0 for V4.1-Flash-1017.
- **BankerToolBench** (banking workflows): 76.2.
- **CyberGym** (reproducing real software vulnerabilities): 82%.
- **Agents' Last Exam:** 29.6.

The picture is strong but not uniform. Early coverage notes that top frontier models still lead clearly on harder terminal and repository-scale coding benchmarks. Flash looks optimized for **high-volume agent work at low cost**, not for topping every leaderboard.

### What It Means for Developers

- **Re-run your cost math.** If you run agents that make many calls per task (browsing, tool use, test-and-fix loops), a $0.15 input price with $0.015 cache reads can change which tasks are worth automating.
- **Watch the always-on reasoning.** Even at the Low effort level, every call pays a reasoning "tax" in tokens and latency. For simple classification or extraction calls, a non-reasoning model may still be cheaper and faster.
- **Benchmark on your own tasks.** Vendor numbers depend heavily on the evaluation harness. Use the drop-in API compatibility to A/B test it against your current model on real workloads before switching.
- **Keep an eye on the weights.** MiniMax says open weights are coming, but the license has not been announced. Check it before planning a self-hosted deployment, and expect serious hardware requirements for a 428B-parameter model.
- **Stealth testing is now normal.** Space Bunny shows that labs increasingly test unreleased models anonymously on routing platforms. If you route traffic through such services, be aware of which models your data is going to.

### Conclusion

MiniMax M3.1 Flash is not a new frontier model, and it does not try to be. It is a bet that the next phase of AI adoption is decided by how cheaply and quickly agents can finish tasks. With a 1M-token context, multimodal input, drop-in API compatibility and pricing at $0.15 / $0.60 per million tokens, it gives developers one more serious option for agent workloads. The real test will come when the weights and license arrive and independent benchmarks confirm, or challenge, MiniMax's numbers.

### Sources

- [MiniMax: MiniMax M3.1 Flash: Redefining Agent Performance and Cost](https://www.minimax.io/blog/minimax-m31f)
- [SiliconANGLE: MiniMax launches M3.1 Flash model, says it cuts AI agent costs by 70%](https://siliconangle.com/2026/10/19/minimax-launches-m3-1-flash-model-says-it-cuts-ai-agent-costs-by-70/)
- [MarkTechPost: MiniMax just launched M3.1 Flash, a 428B MoE agentic model at $0.15/M input](https://www.marktechpost.com/2026/10/19/minimax-m3-1-flash-release/)
- [Unite.AI: MiniMax launches M3.1 Flash, revealing Space Bunny stealth model](https://www.unite.ai/minimax-launches-m3-1-flash-revealing-space-bunny-stealth-model/)
