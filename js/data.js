// Seed Data for Chunking Blog

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
];

const INITIAL_POSTS = [
  {
    "id": "post-1785465074696",
    "title": "Tesyt",
    "category": "Personal Learning",
    "excerpt": "Ggtt",
    "content": "Ggtt",
    "tags": [],
    "cover": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    "date": "2026-07-31",
    "readTime": "1 min read",
    "bookmarked": false
  },
  {
    "id": "post-1785464854577",
    "title": "Test",
    "category": "Personal Learning",
    "excerpt": "Test",
    "content": "Test ",
    "tags": [],
    "cover": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    "date": "2026-07-31",
    "readTime": "1 min read",
    "bookmarked": false
  },
  {
    "id": "post-1",
    "title": "Building Scalable Event-Driven Architectures: Lessons Learned",
    "category": "Engineering Path",
    "growthStage": "Evergreen",
    "excerpt": "Deep dive into message queues, event sourcing patterns, idempotency guarantees, and distributed system resilience.",
    "content": "# Building Scalable Event-Driven Architectures: Lessons Learned\n\nAs software systems grow from monolithic applications to microservices, traditional synchronous HTTP calls often become brittle bottlenecks. Over the past months of building distributed backends, I’ve pivoted towards **Event-Driven Architecture (EDA)**.\n\n## Why Event-Driven Architecture?\n\n1. **Decoupling**: Publishers don't need to know who consumes events.\n2. **Asynchronous Resilience**: Spikes in traffic are buffered by distributed queues (e.g., Apache Kafka or RabbitMQ).\n3. **Temporal Independence**: Services process messages at their own pace without failing downstream callers.\n\n---\n\n## Key Patterns Implemented\n\n### 1. The Transactional Outbox Pattern\nTo prevent lost events when database operations succeed but message publication fails, we save events inside a local `outbox` table as part of the same database transaction:\n\n```sql\nBEGIN TRANSACTION;\n\nINSERT INTO orders (id, user_id, total_amount, status)\nVALUES ('ord_98234', 'usr_102', 149.99, 'CREATED');\n\nINSERT INTO outbox (id, aggregate_type, event_type, payload, created_at)\nVALUES ('evt_001', 'Order', 'OrderCreated', '{\"orderId\":\"ord_98234\",\"amount\":149.99}', NOW());\n\nCOMMIT;\n```\n\nA CDC (Change Data Capture) process or background daemon then safely reads the outbox and dispatches events to the message broker with **at-least-once delivery guarantees**.\n\n---\n\n### 2. Ensuring Idempotency\nBecause network failures can cause event retries, every consumer MUST be idempotent. See also my reflections in [[On Purpose, Engineering Craftsmanship & Staying Curious in Life]].\n\n```typescript\ninterface SystemEvent<T> {\n  eventId: string;\n  timestamp: string;\n  eventType: string;\n  data: T;\n}\n\nasync function handleOrderCreated(event: SystemEvent<OrderPayload>): Promise<void> {\n  const exists = await redis.set(`processed_evt:${event.eventId}`, '1', 'NX', 'EX', 86400);\n  if (!exists) {\n    console.log(`Duplicate event ${event.eventId} ignored.`);\n    return;\n  }\n\n  // Execute business logic safely\n  await processPayment(event.data);\n}\n```\n\n## Key Takeaway for Engineers\nAlways design for failure. Retries will happen, networks will partition, and services will crash. **Idempotent consumers and transactional outboxes are non-negotiable foundations for reliable distributed systems.**\n",
    "tags": [
      "Architecture",
      "System Design",
      "Backend",
      "EventDriven",
      "Kafka"
    ],
    "cover": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    "date": "2026-07-28",
    "readTime": "6 min read",
    "bookmarked": true
  },
  {
    "id": "post-2",
    "title": "The Art of First Principles Thinking & Continuous Mental Models",
    "category": "Personal Learning",
    "growthStage": "Budding",
    "excerpt": "Deconstructing complex concepts down to fundamental truths, avoiding blind analogies, and building sustainable learning habits.",
    "content": "# The Art of First Principles Thinking & Continuous Mental Models\n\nOne of the most transformative mental shifts in my learning process has been moving away from *reasoning by analogy* to **reasoning from first principles**.\n\n> \"First principles is a physics way of looking at the world. You boil things down to the most fundamental truths and say, 'What are we sure is true?' and then reason up from there.\" — Elon Musk\n\n## Reasoning by Analogy vs. First Principles\n\n| Approach | Method | Risk |\n| :--- | :--- | :--- |\n| **Analogy** | Copying what others do with slight tweaks | Trapped by existing assumptions and blind spots |\n| **First Principles** | Deconstructing to basic axioms and rebuilding | Harder initially, but yields breakthrough insights |\n\n---\n\n## My 3-Step Framework for Learning New Tech Stack\n\n1. **Strip Away Abstractions**: Don't just learn a framework's API; understand the underlying protocol (HTTP, TCP, OS Memory Allocation).\n2. **Build a Toy Version**: Build a 50-line mini engine (e.g., a simple custom Virtual DOM or a mini Router) to grasp core concepts.\n3. **Teach or Write**: Document findings in this blog. Explaining a topic highlights hidden gaps in knowledge immediately.\n\n---\n\n## Daily Learning Journal Rule\n* **30 Minutes Daily**: Dedicate 30 uninterrupted minutes to reading technical papers or books every single day.\n* **Compound Interest**: 30 mins/day = 182 hours per year of deep focused learning.\n",
    "tags": [
      "MentalModels",
      "LearningStrategy",
      "Philosophy",
      "Productivity"
    ],
    "cover": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
    "date": "2026-07-25",
    "readTime": "4 min read",
    "bookmarked": false
  },
  {
    "id": "post-3",
    "title": "On Purpose, Engineering Craftsmanship & Staying Curious in Life",
    "category": "View of Life",
    "growthStage": "Evergreen",
    "excerpt": "Reflections on career longevity, finding meaning in problem solving, balancing ambition with peace, and cultivating curiosity.",
    "content": "# On Purpose, Engineering Craftsmanship & Staying Curious in Life\n\nAs software engineers, it's easy to get lost in the endless treadmill of new frameworks, build tools, and performance metrics. But stepping back to ask *why we build* brings clarity and joy back into the craft.\n\n## 1. Craftsmanship Over Quick Hype\nTrue craftsmanship isn't about writing code as fast as possible. It's about:\n* **Clarity of Thought**: Clean, self-explanatory code reflects clear thinking.\n* **Empathy for Others**: Writing code that your teammates (and your future self) will read effortlessly.\n* **Pride in Detail**: Caring about edge cases, security, accessibility, and user experience.\n\n---\n\n## 2. Navigating the Engineering Career Ladder\nA great senior engineer isn't just someone who knows syntax details; they are a multiplier for their team. Related reading: [[Building Scalable Event-Driven Architectures: Lessons Learned]].\n\n> \"A senior engineer solves complex problems simply. A staff engineer makes complex problems disappear altogether.\"\n\n## 3. Life Principles I Live By\n* **Bias for Curiosity**: Treat unexpected bugs or challenges not as annoyances, but as invitations to learn how things work underneath.\n* **Work-Life Synergy**: Great code comes from a well-rested, curious mind. Make time for nature, books, family, and physical health.\n* **Build in Public**: Share your process, your mistakes, and your learning curve. Perfection is boring; growth is inspiring.\n",
    "tags": [
      "Mindset",
      "Career",
      "LifePhilosophy",
      "Craftsmanship"
    ],
    "cover": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    "date": "2026-07-20",
    "readTime": "5 min read",
    "bookmarked": true
  }
];

const INITIAL_ROADMAP = [];
