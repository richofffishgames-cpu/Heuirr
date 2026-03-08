## 2026-03-08 - [Efficient Rate Limiting Cleanup]
**Learning:** Middleware that performs $O(N)$ operations (like iterating over a global store) on every request can become a major bottleneck as the number of unique clients grows.
**Action:** Use probabilistic cleanup for global stores combined with targeted cleanup for the specific key being accessed to maintain constant time performance on the hot path.
