---
title: DeepSeek Open-Sources DeepInfer, Its Production Inference Engine
date: "2026-10-21T14:10:00.000Z"
description: "DeepSeek released DeepInfer under Apache 2.0, the engine that serves V4.1-Flash in production, with support for Nvidia Blackwell and Huawei Ascend 950."
---

## What Happened?

On October 20, 2026, DeepSeek published **DeepInfer**, the inference framework that runs its own production services, as open source under the **Apache 2.0 license**. It is the software that turns DeepSeek-V4.1-Flash weights into fast, cheap API responses at very large scale.

Open-weight models are common now. What is rare is a lab publishing the **serving stack** behind its API. Most providers treat that layer as a trade secret, because that is where much of the cost advantage comes from. DeepSeek says it is sharing the code to help the community lower compute costs and energy use.

Earlier this week, this blog covered the [V4.1-Flash-1017 checkpoint](/deepseek-v4-1-flash-1017-brings-stronger-coding-and-a-web-search-api/). DeepInfer is the other half of that story: the engine that serves the model.

### Why It Matters

- **It shows how a frontier-scale MoE is actually served.** Papers describe ideas. A production codebase shows which ones survive real traffic, and how they fit together.
- **Huawei gets first-class support.** DeepInfer targets Nvidia's **SM100 (Blackwell)** GPUs and Huawei's **Ascend 950** NPUs side by side. A major open-source inference engine treating a Chinese accelerator as an equal backend is new, and it matters at a time when US export rules limit Chinese access to advanced Nvidia chips.
- **Reusable building blocks.** Even if you never run DeepSeek's model, the kernels and scheduling techniques can inform how you tune other engines.

### Technical Details

DeepInfer started life as a fork of **vLLM**, and the README still names vLLM as its foundation. DeepSeek has since rebuilt large parts of it around its own kernels and cluster design. Here is what the coverage agrees on:

**Hardware and models**

- **Nvidia SM100** (Blackwell data-center GPUs) and **Huawei Ascend 950**. Hopper and older Nvidia generations are **not** supported.
- Only one model for now: **DeepSeek-V4.1-Flash**, loading the 1017 checkpoint by default. DeepSeek says code for future models will land in the same repository.
- Two features that make outputs identical from run to run (described as batch-invariant inference and deterministic sampling) work **only on Nvidia** hardware.

**Kernels**

DeepInfer brings together libraries DeepSeek released separately over the past year and a half, including **FlashMLA** (attention), **DeepGEMM** (matrix multiplication) and **DeepEP** (expert-parallel communication for Mixture-of-Experts layers).

**Speculative decoding**

A draft component proposes **five tokens at a time**, and a confidence head predicts which of those the main model will accept. That cuts the number of tokens the main model has to verify by about **30%**, which DeepSeek says yields a **4–7% throughput gain** at its production load. One analysis notes that at low concurrency (below about 16 parallel sequences) the overhead can outweigh the benefit. That is a good reminder that speculative decoding is a tuning knob, not a free win.

**A prefill shortcut**

When cached state for the model's sliding-window attention is missing, DeepInfer recomputes only the **last 128 tokens** of the prompt through the decoder layers instead of the full sequence. DeepSeek says this nearly **halves prefill compute** in those cases.

**Scale**

DeepSeek reports that a single cluster serves about **155 trillion tokens per day**. Its reference setups use **4 SM100 GPUs for prefill and 64 for decode** for benchmarking, while the smallest *efficient* production deployment is described as **64 prefill GPUs plus 64 decode GPUs**. This is not a laptop project.

**Token-level API parity**

A companion repo, **deepseek-recipe** (Rust and Python), turns requests into token sequences with the same logic as DeepSeek's official API. Self-hosted deployments therefore format chat templates, tool calls and special tokens exactly like the hosted service.

### What Was Not Released

The release is generous, but not complete. DeepSeek held back:

- **KV cache management** (its production system relies on a large distributed storage cluster),
- **Prefill/decode disaggregation across machines**, which is left to operators even though most of the engine-side work is in place,
- **Load balancing** across data-parallel replicas.

DeepSeek says these pieces are tightly coupled to its internal infrastructure. In practice, DeepInfer gives you the **compute path**: the kernels, scheduling and model execution. You still have to build the orchestration around it.

### What It Means for Developers

- **If you self-host DeepSeek-V4.1-Flash on Blackwell or Ascend**, DeepInfer is now the reference implementation to benchmark against vLLM or SGLang on your own workload. No source has published a head-to-head comparison yet, so measure it yourself.
- **If you build inference infrastructure**, read the speculative decoding and prefill code. They are practical, production-tested ideas you can adapt.
- **If you are on Hopper or older GPUs**, this release is mostly study material for now.
- **If you only call APIs**, this still matters: open serving stacks put pressure on token prices across the industry.

### Conclusion

DeepInfer is less a turnkey server than an unusually honest look inside a production LLM engine. It combines DeepSeek's kernel libraries, speculative decoding and prefill tricks in one codebase, and it puts Huawei's Ascend next to Nvidia's Blackwell as a supported target. The missing cache and load-balancing layers mean most teams won't adopt it overnight. Still, for anyone who cares about how large MoE models are served cheaply, it is one of the most useful open-source drops of the year.

### Sources

- [DeepInfer repository on GitHub](https://github.com/deepseek-ai/DeepInfer)
- [DeepSeek announcement on X](https://x.com/deepseek_ai/status/2112476496283775135)
- [SiliconANGLE: DeepSeek open-sources DeepInfer, the inference framework behind its production services](https://siliconangle.com/2026/10/20/deepseek-open-sources-deepinfer-the-inference-framework-behind-its-production-services/)
- [The New Stack: DeepSeek open-sources the inference engine behind its API](https://thenewstack.io/deepseek-deepinfer-huawei-nvidia/)
- [The Decoder: DeepSeek open-sources the inference engine that powers its fastest and cheapest AI model](https://the-decoder.com/deepseek-open-sources-the-inference-engine-that-powers-its-fastest-and-cheapest-ai-model/)
- [OrcaRouter: DeepInfer explained](https://www.orcarouter.ai/blog/deepinfer-explained)
