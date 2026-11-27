# Prompts

## M1

```
I'm machine-<a>. Using the Jira MCP tools:
1. Find To Do issues in our project labelled machine-<a>. Pick the lowest wave whose blockers are all Done. If none are unblocked, tell me what I'm waiting on and stop.
2. Transition it to In Progress and show me its key, summary and spec.
3. git switch main && git pull, then git switch -c <KEY>-<spec>.
4. Read that spec's requirements.md, design.md and tasks.md. In 3 lines, tell me what you'll build and which folders you'll touch. Don't implement anything yet.
```
