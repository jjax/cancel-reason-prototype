Result: SUCCESS

Date: 2026-09-24
Model: jev-1.13.0
Summary: 14/14 judged, model jev-1.13.0, 14420 tokens total, avg 261 ms/request

## docs index reachable

First 50 lines of https://docs.typesafe.ai/llms.txt (fetched 2026-09-24, for access confirmation only):

```
# TypeSafe AI

> How to use TypeSafe's System One API

- [Introduction](https://docs.typesafe.ai/introduction.md): Jev is TypeSafe's flagship model and the first System One model. Send state and typed questions; get structured answers your code can use directly.
- [Quick start](https://docs.typesafe.ai/introduction/quickstart.md): Prefer to just dive in? Here's everything you need to get started immediately.
- [Jev with coding agents](https://docs.typesafe.ai/introduction/coding-agents.md): What Jev is (and isn't) when you're using a coding agent.
- [Example use cases](https://docs.typesafe.ai/concepts/use-case-map.md): Explore TypeSafe use cases by industry and turn promising ideas into software workflows.
- [System One](https://docs.typesafe.ai/concepts/system-one.md): System One models make fast, structured decisions for software. Jev is TypeSafe's flagship model and the first System One model.
- [State](https://docs.typesafe.ai/concepts/state.md): What state is, how to structure it, and how to give a System One model the context it needs.
- [Primitives (Questions)](https://docs.typesafe.ai/primitives.md): The three TypeSafe question types (Choice, Score, Noul), the typed answers they return, how to choose between them, and how to ask several at once.
- [Choice](https://docs.typesafe.ai/primitives/choice.md): A Choice is a System One question type for selecting one option from a defined set. The answer includes the selected option, a probability for each option, and confidence.
- [Score](https://docs.typesafe.ai/primitives/score.md): A Score is a System One question type for rating content against ordered, descriptive levels. The answer includes a score, a probability for each level, and confidence.
- [Noul](https://docs.typesafe.ai/primitives/noul.md): A Noul question asks the TypeSafe model to evaluate a yes/no question and return the probability that the answer is yes.
- [Advanced: structure](https://docs.typesafe.ai/primitives/advanced.md): Instructions, Choice options, Score levels, and Noul criteria all accept JSON structure.
- [Confidence](https://docs.typesafe.ai/confidence.md): How TypeSafe reports certainty, how it differs from probability, and how to use it to control system behavior.
- [How to build with TypeSafe](https://docs.typesafe.ai/concepts/how-to-build-with-system-one.md): Design AI-powered software by keeping code in control and giving System One narrow, structured decisions.
- [AI primer](https://docs.typesafe.ai/introduction/machine-learning-primer.md): Why TypeSafe trains decision models with calibrated probabilities instead of optimizing for generated text.
- [Patterns](https://docs.typesafe.ai/patterns.md): Architectural patterns for building systems with TypeSafe.
- [Speculative fan-out](https://docs.typesafe.ai/patterns/fan-out.md): Send many questions in a single call, including speculative ones, and let your code decide what's relevant.
- [Confidence-gated routing](https://docs.typesafe.ai/patterns/confidence-routing.md): Use confidence as a second axis. The answer tells you what; confidence tells you whether to act.
- [Composite scoring](https://docs.typesafe.ai/patterns/composite-scoring.md): Break a complex judgment into atomic scores, combine with weights you control in code.
- [Intent routing](https://docs.typesafe.ai/patterns/intent-routing.md): Classify incoming requests and route each to the optimal handler: deterministic logic, a specialist LLM, or a human.
- [Cookbooks](https://docs.typesafe.ai/cookbooks.md): End-to-end recipes that show TypeSafe in real problems, from a few questions to full pipelines.
- [Self-consistency: nouls](https://docs.typesafe.ai/cookbooks/consistency_noul_cookbook.md): Route uncertain probabilities to human review while keeping the underlying noul values visible.
- [Self-consistency: choices](https://docs.typesafe.ai/cookbooks/consistency_choice_cookbook.md): Add an uncertain outcome to moderation decisions and compare label agreement with the share of automatic actions.
- [Parallel questions](https://docs.typesafe.ai/cookbooks/parallel_questions.md): Runs a 13-question regulatory briefing over the GDPR Wikipedia article, showing that batching every question into one TypeSafe call is 12.2x cheaper and 10.0x faster with no change in answers.
- [Re-ranking](https://docs.typesafe.ai/cookbooks/rerank_typesafe.md): Builds 30-passage BM25 shortlists for 40 CLERC legal queries, then uses one TypeSafe question per query-candidate pair to raise top-1 accuracy from 5% to 18% and top-10 accuracy from 38% to 62%.
- [Line-by-line search](https://docs.typesafe.ai/cookbooks/semantic_find.md): Build semantic search for GitHub's Terms of Service. In one request, score 218 line ids against a plain-language query with a Choice question, and use a Noul question to check whether the document contains an answer.
- [Structure recovery](https://docs.typesafe.ai/cookbooks/autoformat.md): Reconstructs Markdown from plain text that lost its formatting in two requests: one stitches hard-wrapped lines back together, one classifies every block (heading, list, code, callout).
- [Function calling](https://docs.typesafe.ai/cookbooks/function_calling.md): Turns natural-language trading requests into calls to ordinary typed functions by mapping function names and closed-set arguments to confidence-aware TypeSafe questions.
- [Skill suggestion](https://docs.typesafe.ai/cookbooks/skill_suggestion.md): Picks at most one skill for an agent turn out of the 182 in Nous Research's Hermes catalog, using two TypeSafe requests to rank and re-check the top candidates.
- [Knowledge graph entity alignment](https://docs.typesafe.ai/cookbooks/entity_alignment.md): Decides which of 450 candidate pairs from two beer catalogues describe the same product using one Score question plus three companion Nouls that surface which fields disagree.
- [Classifying RAG passages](https://docs.typesafe.ai/cookbooks/classifying_rag_passages.md): Score each retrieved passage with one TypeSafe request, then decide in code which ones reach the answering model.
- [Double-checking citations](https://docs.typesafe.ai/cookbooks/citation_check.md): Catch wrong or hallucinated citations by checking against the source document. One Choice question decides whether the quote's context supports the claim.
- [Guardrails for LLMs](https://docs.typesafe.ai/cookbooks/llm_guardrails.md): Screen every message going into and out of an LLM app with one TypeSafe request, thresholding hazard probabilities and severity to pass, review, block, or route.
- [SDE cascade](https://docs.typesafe.ai/cookbooks/sde_cascade.md): Uses a 2-stage structured-data-extraction cascade (mini → verify → reasoning) to get most of the quality of a big reasoning model at a fraction of the cost.
- [Date extraction](https://docs.typesafe.ai/cookbooks/date_extraction_cookbook.md): Extracts absolute and relative dates by asking TypeSafe for the parts named in a document, then resolving and validating them in code with confidence-based review.
- [Pre-parsed value extraction](https://docs.typesafe.ai/cookbooks/pre_parsed_value_extraction_cookbook.md): Uses regexes to find candidate emails, phone numbers, and amounts, then has TypeSafe select the requested span so code can normalize a verbatim value.
- [Hierarchical classification](https://docs.typesafe.ai/cookbooks/hierarchical_classification.md): Classifies documents through deep patent, retail product, biomedical, and source-code hierarchies using parallel beam search over TypeSafe Choice probabilities.
- [Autoresearch feature discovery](https://docs.typesafe.ai/cookbooks/autoresearch_feature_discovery.md): Runs an autoresearch loop that proposes TypeSafe questions, converts free text into numeric features, and uses model errors to improve a supervised CatBoost regressor.
- [Classification using confidence](https://docs.typesafe.ai/cookbooks/classification_using_confidence.md): Classify SEC annual reports into 75 industry groups with one Choice each, then read the answer's own confidence to decide whether to report that group or the broader division above it.
- [Demos](https://docs.typesafe.ai/demos.md): Interactive examples showing what's possible with TypeSafe.
- [Smart home assistant demo](https://docs.typesafe.ai/demos/smart-home.md): Demo code: a smart home assistant that uses TypeSafe to evaluate user requests.
- [Models](https://docs.typesafe.ai/models.md)
- [API reference](https://docs.typesafe.ai/api.md): Full HTTP API reference for the TypeSafe evaluation endpoint.
- [Agent skill](https://docs.typesafe.ai/agent-skill.md): Drop-in skill for Claude Code, Codex, and other agent environments.
- [Legal](https://docs.typesafe.ai/legal.md): Legal documents and policies for TypeSafe.
- [Jev 1.13 jaggedness](https://docs.typesafe.ai/model-jaggedness/jev-1.13.md): Jev isn't perfect. Here are some jagged edges we are aware of with jev-1.13. Many of these will be fixed in later versions.
- [Client SDKs](https://docs.typesafe.ai/sdk.md): Install a TypeSafe client SDK and use typed questions and answers in your application.
```
