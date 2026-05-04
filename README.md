# Sonoro

Sonoro is the intelligence layer for food in care. It is an AI orchestration platform that helps care homes improve resident wellbeing through better food — combining menu intelligence, a happiness algorithm, workforce training, and recruitment into a single product surface.

The platform is built on a proprietary knowledge graph (the MPW Academy), scored against the Marco Standard, and designed to meet CQC regulatory requirements by design. In seven parts, this brief sets out the opportunity, the platform architecture, the network, the trust model, the business case, and the mandate for the CTO who will build it.


## Local development

Serve the site with Python built-in HTTP server from the project root:

    python3 -m http.server 8000

Then open http://localhost:8000

Directory-based routing is used throughout. Each section is a folder with its own index.

No build step is required — the workflow deploys the repository root directly.
