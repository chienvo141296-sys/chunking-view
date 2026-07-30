// Initial Seed Data for Dev & Life Odyssey Blog

const INITIAL_POSTS = [
  {
    id: 'post-1',
    title: 'Building Scalable Event-Driven Architectures: Lessons Learned',
    category: 'Engineering Path',
    growthStage: 'Evergreen', // 'Seedling', 'Budding', 'Evergreen'
    excerpt: 'Deep dive into message queues, event sourcing patterns, idempotency guarantees, and distributed system resilience.',
    content: `# Building Scalable Event-Driven Architectures: Lessons Learned

As software systems grow from monolithic applications to microservices, traditional synchronous HTTP calls often become brittle bottlenecks. Over the past months of building distributed backends, I’ve pivoted towards **Event-Driven Architecture (EDA)**.

## Why Event-Driven Architecture?

1. **Decoupling**: Publishers don't need to know who consumes events.
2. **Asynchronous Resilience**: Spikes in traffic are buffered by distributed queues (e.g., Apache Kafka or RabbitMQ).
3. **Temporal Independence**: Services process messages at their own pace without failing downstream callers.

---

## Key Patterns Implemented

### 1. The Transactional Outbox Pattern
To prevent lost events when database operations succeed but message publication fails, we save events inside a local \`outbox\` table as part of the same database transaction:

\`\`\`sql
BEGIN TRANSACTION;

INSERT INTO orders (id, user_id, total_amount, status)
VALUES ('ord_98234', 'usr_102', 149.99, 'CREATED');

INSERT INTO outbox (id, aggregate_type, event_type, payload, created_at)
VALUES ('evt_001', 'Order', 'OrderCreated', '{"orderId":"ord_98234","amount":149.99}', NOW());

COMMIT;
\`\`\`

A CDC (Change Data Capture) process or background daemon then safely reads the outbox and dispatches events to the message broker with **at-least-once delivery guarantees**.

---

### 2. Ensuring Idempotency
Because network failures can cause event retries, every consumer MUST be idempotent. See also my reflections in [[On Purpose, Engineering Craftsmanship & Staying Curious in Life]].

\`\`\`typescript
interface SystemEvent<T> {
  eventId: string;
  timestamp: string;
  eventType: string;
  data: T;
}

async function handleOrderCreated(event: SystemEvent<OrderPayload>): Promise<void> {
  const exists = await redis.set(\`processed_evt:\${event.eventId}\`, '1', 'NX', 'EX', 86400);
  if (!exists) {
    console.log(\`Duplicate event \${event.eventId} ignored.\`);
    return;
  }

  // Execute business logic safely
  await processPayment(event.data);
}
\`\`\`

## Key Takeaway for Engineers
Always design for failure. Retries will happen, networks will partition, and services will crash. **Idempotent consumers and transactional outboxes are non-negotiable foundations for reliable distributed systems.**
`,
    tags: ['Architecture', 'System Design', 'Backend', 'EventDriven', 'Kafka'],
    cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    date: '2026-07-28',
    readTime: '6 min read',
    bookmarked: true
  },
  {
    id: 'post-2',
    title: 'The Art of First Principles Thinking & Continuous Mental Models',
    category: 'Personal Learning',
    growthStage: 'Budding',
    excerpt: 'Deconstructing complex concepts down to fundamental truths, avoiding blind analogies, and building sustainable learning habits.',
    content: `# The Art of First Principles Thinking & Continuous Mental Models

One of the most transformative mental shifts in my learning process has been moving away from *reasoning by analogy* to **reasoning from first principles**.

> "First principles is a physics way of looking at the world. You boil things down to the most fundamental truths and say, 'What are we sure is true?' and then reason up from there." — Elon Musk

## Reasoning by Analogy vs. First Principles

| Approach | Method | Risk |
| :--- | :--- | :--- |
| **Analogy** | Copying what others do with slight tweaks | Trapped by existing assumptions and blind spots |
| **First Principles** | Deconstructing to basic axioms and rebuilding | Harder initially, but yields breakthrough insights |

---

## My 3-Step Framework for Learning New Tech Stack

1. **Strip Away Abstractions**: Don't just learn a framework's API; understand the underlying protocol (HTTP, TCP, OS Memory Allocation).
2. **Build a Toy Version**: Build a 50-line mini engine (e.g., a simple custom Virtual DOM or a mini Router) to grasp core concepts.
3. **Teach or Write**: Document findings in this blog. Explaining a topic highlights hidden gaps in knowledge immediately.

---

## Daily Learning Journal Rule
* **30 Minutes Daily**: Dedicate 30 uninterrupted minutes to reading technical papers or books every single day.
* **Compound Interest**: 30 mins/day = 182 hours per year of deep focused learning.
`,
    tags: ['MentalModels', 'LearningStrategy', 'Philosophy', 'Productivity'],
    cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    date: '2026-07-25',
    readTime: '4 min read',
    bookmarked: false
  },
  {
    id: 'post-3',
    title: 'On Purpose, Engineering Craftsmanship & Staying Curious in Life',
    category: 'View of Life',
    growthStage: 'Evergreen',
    excerpt: 'Reflections on career longevity, finding meaning in problem solving, balancing ambition with peace, and cultivating curiosity.',
    content: `# On Purpose, Engineering Craftsmanship & Staying Curious in Life

As software engineers, it's easy to get lost in the endless treadmill of new frameworks, build tools, and performance metrics. But stepping back to ask *why we build* brings clarity and joy back into the craft.

## 1. Craftsmanship Over Quick Hype
True craftsmanship isn't about writing code as fast as possible. It's about:
* **Clarity of Thought**: Clean, self-explanatory code reflects clear thinking.
* **Empathy for Others**: Writing code that your teammates (and your future self) will read effortlessly.
* **Pride in Detail**: Caring about edge cases, security, accessibility, and user experience.

---

## 2. Navigating the Engineering Career Ladder
A great senior engineer isn't just someone who knows syntax details; they are a multiplier for their team. Related reading: [[Building Scalable Event-Driven Architectures: Lessons Learned]].

> "A senior engineer solves complex problems simply. A staff engineer makes complex problems disappear altogether."

## 3. Life Principles I Live By
* **Bias for Curiosity**: Treat unexpected bugs or challenges not as annoyances, but as invitations to learn how things work underneath.
* **Work-Life Synergy**: Great code comes from a well-rested, curious mind. Make time for nature, books, family, and physical health.
* **Build in Public**: Share your process, your mistakes, and your learning curve. Perfection is boring; growth is inspiring.
`,
    tags: ['Mindset', 'Career', 'LifePhilosophy', 'Craftsmanship'],
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    date: '2026-07-20',
    readTime: '5 min read',
    bookmarked: true
  }
];

const INITIAL_ROADMAP = [
  {
    id: 'rm-1',
    date: 'Q3 2026',
    title: 'Advanced System Architecture & Event Sourcing',
    category: 'Engineering',
    status: 'In Progress',
    description: 'Mastering distributed transaction patterns (Saga, Outbox), Kafka cluster tuning, and CQRS implementations.'
  },
  {
    id: 'rm-2',
    date: 'Q2 2026',
    title: 'Deep Dive into AI Agents & LLM Tool Use Integration',
    category: 'Learning',
    status: 'Completed',
    description: 'Explored multi-agent systems, context window optimizations, tool calling protocols, and local embedding vector databases.'
  },
  {
    id: 'rm-3',
    date: 'Q1 2026',
    title: 'Full-Stack Performance Optimization & Edge Computing',
    category: 'Engineering',
    status: 'Completed',
    description: 'Achieved sub-100ms LCP on enterprise web applications with Server-Driven UI and SSR edge caching.'
  },
  {
    id: 'rm-4',
    date: '2025',
    title: 'Foundations of Systems Engineering & Cloud DevOps',
    category: 'Career Milestone',
    status: 'Completed',
    description: 'Built CI/CD pipelines, Terraform infra-as-code setups, Docker container orchestration, and microservice APIs.'
  }
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
];

const TEMPLATES = {
  debug: `# 🐛 Debug Log & Bug Fix: [Short Problem Name]

## Problem Symptom & Error Log
Describe what broke or paste the error traceback here...

## Initial Diagnostic Hypotheses
1. Hypothesis 1...
2. Hypothesis 2...

## Root Cause Discovery
What was actually happening under the hood...

## The Fix & Prevention
\`\`\`ts
// Corrected implementation
\`\`\`
- [ ] Added regression test
`,
  engineering: `# [Architecture/Tech Name] Notes

## Overview & Problem Statement
Describe the problem this technology or architectural pattern solves...

## Key Architecture & Components
\`\`\`
[ Client ] ---> [ API Gateway ] ---> [ Service A ]
                                 ---> [ Service B ]
\`\`\`

## Code Implementation
\`\`\`ts
// Code snippet here
\`\`\`

## Benchmarks & Lessons Learned
* Point 1...
* Point 2...
`,
  learning: `# Learning Notes: [Book / Concept Name]

## Core Takeaways
1. **Takeaway 1**: Summary...
2. **Takeaway 2**: Summary...

## Key Quotes & Highlights
> "Insert insightful quote here."

## How I Will Apply This
- [ ] Action item 1
- [ ] Action item 2
`,
  life: `# Reflections on [Topic / Milestone]

## Current Context & Thoughts
What prompted this reflection...

## Perspective Shift
How my view has evolved over time...

## Guiding Principles Moving Forward
* Principle 1...
* Principle 2...
`
};
