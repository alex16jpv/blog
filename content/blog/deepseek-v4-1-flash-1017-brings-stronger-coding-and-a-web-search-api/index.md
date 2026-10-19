---
title: DeepSeek V4.1-Flash-1017 Brings Stronger Coding and a Web Search API
date: "2026-10-19T18:04:43.000Z"
description: "DeepSeek shipped V4.1-Flash-1017, an open-weight checkpoint with better agentic coding scores, plus public Search and Fetch APIs at $0.75 per 1,000 calls."
---

## What Happened?

On October 17, 2026, DeepSeek released **DeepSeek-V4.1-Flash-1017**, a new post-training checkpoint of the V4.1-Flash model it first shipped in September. The weights are published on Hugging Face and ModelScope, and the model is already serving traffic on DeepSeek's website, app and API.

The checkpoint arrived with a second launch that may matter even more to developers: DeepSeek opened its in-house web search engine to the public through two new endpoints, a **Search API** and a **Fetch API**. Until now that engine only powered DeepSeek's own products.

DeepSeek describes the update as a "Pareto improvement": higher benchmark scores, faster task completion and shorter outputs, all at once. In practice that means you get better results and pay for fewer tokens.

### Why It Matters

Two trends meet in this release.

- **Open-weight models keep closing the gap on agentic coding.** On DeepSeek's own numbers, an open model with only about 16B active parameters per generated token now scores in the same range as top proprietary models on several software engineering benchmarks.
- **Agents need tools, not just tokens.** A coding or research agent is only as good as the context it can pull in. Shipping a cheap, model-agnostic search and fetch layer next to the model gives developers a building block that used to require a third-party search provider.

For teams that run agents at scale, the cost side is the headline. The model is cheap per token, it writes shorter answers, and the tool calls it relies on are now priced per request.

### Technical Details

**The model.** V4.1-Flash is a Mixture-of-Experts model built on what DeepSeek calls a **Causal Encoder-Decoder (CED)** design. According to DeepSeek and coverage of the September launch:

- **Size**: about **552B total parameters**, with roughly **8B active per token during prefill** and **16B during decoding**.
- **Layout**: 40 Transformer layers, split into 20 causal encoder layers that process the input and 20 decoder layers that generate output.
- **Context**: up to **1M tokens**, with text and image input and text output.
- **Memory**: an FP4 KV cache and compressed attention cut KV cache memory to about a quarter of the previous V4-Flash, which makes long contexts cheaper to serve.

The 1017 checkpoint keeps that architecture. What changed is post-training: DeepSeek used reinforcement learning with self-feedback on end-to-end projects, such as building games or 3D scenes from scratch, to improve long-horizon development work.

**The benchmarks.** These are DeepSeek's self-reported figures, so treat them as a starting point rather than a final verdict:

- **DeepSWE v1.1**: **77.0**, up from 74.2 for the September V4.1-Flash. DeepSeek's table lists Claude Opus 5 at 74.0 and GPT 5.6-Sol at 73.0.
- **Terminal-Bench 4.0**: 42.3, up from 31.2, though Claude Opus 5 still leads at 51.8.
- **Agents' Last Exam**: 35.4, up from 31.8.

The checkpoint improves on its predecessor across every benchmark DeepSeek reported, but proprietary frontier models still lead on several of them, including Terminal-Bench, ProgramBench, NL2Repo and Humanity's Last Exam. In short, it is very strong for its cost, not best at everything.

**The Search and Fetch APIs.** Both are simple REST endpoints on `api.deepseek.com`:

- `POST /v1/tools/search` returns ranked web results for a query. You can ask for 1 to 50 results, optionally include page content, and use operators such as `site:`, `-site:`, `lang:`, `after:` and `before:`. Each result includes a **rerank score (0–3)** and an **authority tier (0–4)**, plus a short `snippet` for UIs and a longer `summary` written for models.
- `POST /v1/tools/fetch` takes a URL and returns the page as **Markdown**, which is the format most agents want anyway.

A minimal search request looks like this:

```bash
curl https://api.deepseek.com/v1/tools/search \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "vector database benchmarks site:github.com after:2026", "count": 5}'
```

### What It Means for Developers

- **Cheap agent backends**: the model is served as `deepseek-flash` through OpenAI- and Anthropic-compatible endpoints. DeepSeek lists peak prices of **$0.30 per million input tokens** (cache miss) and **$1.20 per million output tokens**, with off-peak rates at half price. Several third-party hosts list the snapshot for less.
- **Predictable tool pricing**: Search and Fetch each cost **$0.75 per 1,000 successful requests**. Failed calls, timeouts and empty results are not billed, and the result count doesn't change the price.
- **A free trial window**: server-side Search and Fetch calls made through DeepSeek Harness, Claude Code or Codex are free until **November 1, 2026 (00:00 Beijing time)**. That's a good time to benchmark them against your current search provider.
- **Self-hosting is possible, but heavy**: running a 552B MoE model yourself still means a multi-GPU server. Check the model card for the exact license and hardware notes before you plan a deployment.
- **Validate on your own tasks**: the benchmark gains are self-reported. Run the checkpoint against your own repository or eval suite before switching production traffic.

One practical point: the Search and Fetch APIs are **model-agnostic**. Nothing stops you from wiring them into an agent that runs on a different model, which makes them interesting even if you never use DeepSeek's LLM.

### Conclusion

DeepSeek-V4.1-Flash-1017 is an incremental checkpoint on paper, but it shows how fast the open-weight tier is moving: better agentic coding scores, shorter outputs and a lower bill, all in a model you can download. The bigger long-term story may be the Search and Fetch APIs, which give developers a cheap, agent-friendly way to ground models in live web data. If you build coding or research agents, the free window until November 1 is a low-risk chance to try both.

### Sources

- [DeepSeek: DeepSeek-V4.1-Flash-1017 release notes](https://api-docs.deepseek.com/news/news261017/)
- [DeepSeek API docs: Search and Fetch guide](https://api-docs.deepseek.com/guides/search)
- [MarkTechPost: DeepSeek releases V4.1-Flash-1017, scores 77.0 on DeepSWE, opens Search API](https://www.marktechpost.com/2026/10/17/deepseek-just-released-v4-1-flash-1017-scores-77-0-on-deepswe-opens-search-api/)
- [TechBriefly: DeepSeek updates V4.1-Flash to speed up tasks, opens search API](https://techbriefly.com/2026/10/19/deepseek-v4-1-flash-1017-faster-tasks-search-api/)
- [iThome: DeepSeek V4.1-Flash launch and architecture](https://www.ithome.com.tw/news/178871)
