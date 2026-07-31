// Seed Data for Chunking Blog

const PRESET_COVERS = [
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
];

const INITIAL_POSTS = [
  {
    "id": "post-1785488746125",
    "title": "Tết",
    "category": "Personal Learning",
    "excerpt": "Hhh",
    "content": "Hhh",
    "tags": [],
    "cover": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    "date": "2026-07-31",
    "readTime": "1 min read",
    "bookmarked": false
  },
  {
    "id": "post-1785488390367",
    "title": "Hi",
    "category": "Personal Learning",
    "excerpt": "Hi",
    "content": "Hi",
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
    "id": "post-1785467490821",
    "title": "Hu",
    "category": "Personal Learning",
    "excerpt": "Hi",
    "content": "Hi",
    "tags": [],
    "cover": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    "date": "2026-07-31",
    "readTime": "1 min read",
    "bookmarked": false
  },
  {
    "id": "post-1",
    "excerpt": "Deep dive into message queues, event sourcing patterns, idempotency guarantees, and distributed system resilience.",
    "readTime": "6 min read",
    "bookmarked": true,
    "category": "Engineering Path",
    "tags": [
      "Architecture",
      "SystemDesign",
      "Backend",
      "EventDriven"
    ],
    "date": "2026-07-28",
    "cover": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    "content": "# Building Scalable Event-Driven Architectures: Lessons Learned\n\nAs software systems grow from monolithic applications to microservices...",
    "title": "Building Scalable Event-Driven Architectures: Lessons Learned"
  },
  {
    "id": "post-2",
    "excerpt": "Testing real-time multi-device cloud synchronization across mobile and PC.",
    "readTime": "2 min read",
    "bookmarked": false,
    "category": "Personal Learning",
    "tags": [
      "Mobile",
      "Sync",
      "Realtime"
    ],
    "date": "2026-07-31",
    "cover": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
    "content": "# Test Post from Mobile Device Sync\n\nThis post was created on a mobile device and synced globally in real time!",
    "title": "Test Post from Mobile Device Sync"
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
