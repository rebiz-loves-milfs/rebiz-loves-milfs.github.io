---
title: "Testing"
titleTinted: "Mermaid Diagrams"
description: "A quick test post verifying that Mermaid flowcharts, sequence diagrams, and pie charts render correctly in posts."
published: 2026-05-20
category: "Meta"
tags: ["meta", "dev"]
readTime: "1 min"
gradient: "linear-gradient(135deg, oklch(0.85 0.08 260), oklch(0.78 0.10 300))"
glyph: "◈"
---

## Flowchart

```mermaid
flowchart LR
  A[Write post] --> B[Push to main]
  B --> C[GitHub Actions]
  C --> D{Build OK?}
  D -- Yes --> E[Live on rebiz.is-a.dev]
  D -- No --> F[Fix errors]
  F --> B
```

## Sequence diagram

```mermaid
sequenceDiagram
  participant You
  participant Blog
  participant Reader

  You->>Blog: Push new post
  Blog->>Reader: RSS feed updates
  Reader->>Blog: Visits post
  Blog-->>Reader: Renders content
  Reader->>Blog: Leaves comment
```

## Pie chart

```mermaid
pie title How I spend my time
  "Writing" : 30
  "Rewatching Spice and Wolf" : 25
  "Last.fm rabbit holes" : 20
  "Building things no one asked for" : 15
  "Sleep" : 10
```
