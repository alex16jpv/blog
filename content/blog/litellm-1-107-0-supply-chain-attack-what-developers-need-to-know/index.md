---
title: "LiteLLM 1.107.0 Supply Chain Attack: What Developers Need to Know"
date: "2026-10-22T14:07:00.000Z"
description: "A backdoored LiteLLM 1.107.0 hit PyPI and Docker on October 21, stealing cloud, CI and LLM API keys at Python startup. Here is how it worked and what to do."
---

## What Happened?

On **October 21, 2026**, attackers published a malicious **LiteLLM 1.107.0** to PyPI and to the project's official Docker images. LiteLLM is a popular open-source library and proxy that gives you one OpenAI-style API in front of dozens of LLM providers, so it often sits right next to a company's most valuable secrets: provider API keys, cloud credentials and database URLs.

According to the security firms that analyzed the release (Wiz, StepSecurity, SafeDep, Endor Labs), the wheels were uploaded around **11:39 UTC** and quarantined by PyPI roughly **two hours later** (13:20–13:23 UTC). The Docker images stayed up a bit longer, until somewhere between about 13:53 and 14:32 UTC depending on the source. During that window, the `latest`, `main-latest` and `main-stable` tags also pointed at the infected image.

The last known-good version is **1.106.2**. This is also the **second time this year** LiteLLM has been compromised on PyPI, after the 1.82.7/1.82.8 incident in March.

### How the Attacker Got In

This was not a typo-squatted package. The real project published the bad release through its real pipeline:

- BerriAI, the company behind LiteLLM, says the attacker used **stolen GitHub CLI OAuth tokens** belonging to three of its engineers. One account triggered the private release workflow and another approved it.
- The workflow was pointed at a **lookalike repository**, `Berri-AI/litellm` (note the hyphen), instead of the real `BerriAI/litellm`. That fork had ten extra commits on top of the clean code.
- The **`v1.107.0` git tag in the real repo is clean**. Only the built artifacts are poisoned. Anyone who audited the source on GitHub would have seen nothing wrong.

BerriAI says it has revoked all the tokens involved, trimmed its GitHub organization and removed trusted-publisher links while the investigation continues. A follow-up statement suggests the tokens may have leaked from the logs of an internet-exposed internal deployment, but the root cause is not confirmed yet.

### Technical Details: Code That Runs Before Your Code

The clever (and scary) part is **when** the malware runs. You did not need to `import litellm` at all. The wheels dropped three files into `site-packages`:

- **`cook.pth`** — a 12-byte file containing `import cook`. Python's `site` module executes import lines in `.pth` files at **every interpreter start**.
- **`cook.py`** — a compressed, base64-encoded credential stealer (internally called *privcollect*) that runs in a background thread.
- **`sitecustomize.py`** — another file Python loads automatically. On Linux and macOS it forks a detached process that wakes up **every hour**, reads a domain name from a file in an attacker-controlled GitHub repo, and downloads and `exec()`s new code from that domain.

So running `pip`, `pytest`, a Jupyter kernel, or the LiteLLM proxy itself in an affected environment was enough to trigger it.

**What it stole** is a long list. Highlights:

- SSH, GPG and TLS private keys
- AWS, Azure and GCP credential files, plus **instance metadata credentials** (IMDS) on cloud VMs and CI runners
- Kubernetes configs and service account tokens
- Git, npm, PyPI and other registry tokens, `.netrc`, `.git-credentials`
- Environment variables of **every readable process** via `/proc/<pid>/environ`
- Credentials for AI coding tools such as Claude Code, Cursor, Copilot, Gemini CLI and Codex
- Browser passwords and cookies

It also had a **LiteLLM-specific module**: if `DATABASE_URL` was set, it queried the proxy's credentials and model tables, dumping the upstream provider API keys stored there. Data was encrypted with AES-256 (key wrapped with RSA-4096) and sent via HTTP POST to `www.litellm.dev/healthcheck`, a domain registered a week before the attack.

Wiz reports that a few hours later the attacker began **testing stolen AWS credentials**, including calls to list Amazon Bedrock models. That pattern, often called **LLMjacking**, means using stolen keys to run models on someone else's bill.

### What It Means for Developers

If you use LiteLLM anywhere (laptops, CI, containers, production proxies), check now:

1. **Find exposure.** Search lockfiles and requirements for `litellm==1.107.0`. Look for `cook.pth`, `cook.py` or an unexpected `sitecustomize.py` in `site-packages`. Check which image digests your Kubernetes or Docker hosts pulled on October 21, especially if they track `latest`.
2. **Contain without running Python.** Inspect affected environments with tools that do not start the infected interpreter. Prefer rebuilding hosts and images from clean sources over cleaning them in place.
3. **Rotate everything the machine could read**: LLM provider keys (including those stored in the LiteLLM database), the proxy master and salt keys, cloud keys and instance roles, Kubernetes tokens, Git and registry tokens, SSH keys and `.env` secrets. Then review cloud audit logs from the install time onward.
4. **Hunt on the network** for traffic to `litellm.dev` and for requests to paths ending in `/codepy`.
5. **Pin `litellm==1.106.2`**, block 1.107.0 in your package proxy, and pin container images **by digest**, not by tag.

The broader lessons apply to any Python project:

- **`.pth` files and `sitecustomize.py` are code execution hooks.** Alert when a dependency ships them.
- **Reviewing source on GitHub is not enough.** Verify that published artifacts were built from the commit you reviewed, using provenance attestations where available.
- **Release credentials are crown jewels.** Long-lived CLI tokens on developer machines, and in logs, are an attractive target.
- **Floating tags like `latest` are a liability** in production.

### Conclusion

The LiteLLM 1.107.0 compromise lasted only about two hours on PyPI, but its design made those hours count: it ran on every Python start, targeted the exact secrets an LLM gateway holds, and kept an hourly backdoor for follow-up payloads. As AI gateways and agent tooling become core infrastructure, they become prime supply chain targets too. Pin your versions, watch for startup hooks, and if 1.107.0 touched your systems, assume the secrets are gone and rotate.

### Sources

- [Wiz: LiteLLM Compromised, Steals Credentials](https://www.wiz.io/blog/litellm-compromised-steals-credentials)
- [StepSecurity: litellm 1.107.0 Compromised on PyPI](https://www.stepsecurity.io/blog/litellm-1-107-0-compromised-pypi-backdoored-wheels-credential-stealer)
- [SafeDep: Compromised LiteLLM 1.107.0 on PyPI Installs a Credential Stealer and Backdoor](https://safedep.io/litellm-pypi-compromise-credential-stealer-backdoor/)
- [Endor Labs: LiteLLM 1.107.0 Compromised: Python Startup Hooks Steal Cloud, AI, and Proxy Credentials](https://www.endorlabs.com/learn/litellm-1-107-0-compromised-python-startup-hooks-steal-cloud-ai-and-proxy-credentials)
- [The Hacker News: LiteLLM Compromised in Supply Chain Attack](https://thehackernews.com/2026/10/litellm-compromised-in-supply-chain.html)
- [LiteLLM GitHub issue #47826](https://github.com/BerriAI/litellm/issues/47826)
