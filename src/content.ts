// Every fact here comes from the live portfolio (priyanshu14xdevs.in) or from Priyanshu directly.
// No testimonials.

import type { Content } from './types'
import radio from './data/radio.json'

const GH = 'https://github.com/priyanshu14077'
const LINKEDIN = 'https://www.linkedin.com/in/priyanshu-kumar-singh14/'
const BOOKING = 'https://cal.com/priyanshu-kumar-qvlmdx'
const EMAIL = 'kumarpriyanshu20012@gmail.com'
const SITE = 'https://www.priyanshu14xdevs.in'
const RESUME = 'https://drive.google.com/file/d/1EMIAtO5eOfdp8ZzkJEPnqk-2r9maRyXx/view?usp=sharing'

export const CONTENT: Content = {
  profile: {
    name: 'Priyanshu Kumar Singh',
    role: 'Forward deployed engineer',
    location: 'New Delhi, India',
    greeting: "Hey, I'm Priyanshu. I ship AI into production. Walk around, poke anything.",
    classicUrl: SITE,
    resumeUrl: RESUME,
  },

  availability: {
    open: true,
    modes: ['Remote', 'On-site', 'Relocation'],
    roles: ['Forward deployed engineering', 'Solutions engineering', 'AI platform engineering'],
    note: "Got a workflow that needs to be in production? Put me in the room with it. I'm in New Delhi and happy to work with teams anywhere.",
  },

  // Track lists fetched from the YouTube playlists by the classic site's fetch-radio script.
  stations: radio.stations,

  panels: {
    about: {
      title: 'whoami',
      icon: '>',
      subtitle: 'Forward deployed engineer, full-stack before that',
      sections: [
        {
          type: 'text',
          body: "I work where the problem lives. I embed with the team that has it, turn their workflow into a spec, and take the AI all the way to production. I started as a full-stack engineer, and Proploy is where the forward deployed work began.",
        },
        {
          type: 'timeline',
          title: 'The route',
          items: [
            {
              when: 'Apr – Jun 2025',
              what: 'Emtech Solutions · Full-stack engineer',
              note: 'Sole engineer. Landing page, proposal generation and job listings, all run from an admin panel.',
            },
            {
              when: 'Jun 2025 – Jan 2026',
              what: 'Dunne · Full-stack engineer, sole engineer',
              note: 'Moved a Shopify jewellery store to a Next.js marketplace with a configurator.',
            },
            {
              when: 'Oct 2025 – now',
              what: 'Proploy · Forward Deployed Engineer',
              note: 'The switch. From building to spec, to owning the outcome with the people who use it.',
            },
          ],
        },
        {
          type: 'stats',
          items: [
            { value: '3', label: 'client deployments' },
            { value: '5 & 6', label: 'team sizes led' },
            { value: 'B.Tech', label: 'Automation & Robotics, GGSIPU 2026' },
          ],
        },
      ],
    },

    method: {
      title: 'How I work',
      icon: '◎',
      subtitle: 'Spin the wheel: four steps, every engagement',
      sections: [
        {
          type: 'steps',
          items: [
            {
              name: 'Discover',
              tagline: 'Learn the work before writing the code.',
              points: [
                'Shadow the team and map the workflow end to end',
                'Collect constraints: data access, compliance, the existing stack',
                'Pick the one bottleneck worth automating first',
              ],
            },
            {
              name: 'Scope',
              tagline: 'Turn the pain into a spec everyone signs.',
              points: [
                "Write the job to be done in the team's own words",
                'Agree the success metric before building anything',
                'Set guardrails up front, such as citing every source',
              ],
            },
            {
              name: 'Build',
              tagline: "A working AI system on the team's real data.",
              points: [
                "Retrieval over the team's documents and records",
                'An LLM for reasoning, with answers traced back to sources',
                'Weekly demos to the people who will use it',
              ],
            },
            {
              name: 'Ship',
              tagline: 'Own it in production, then measure it.',
              points: [
                'Containerised services on auto-scaling cloud infrastructure',
                'Monitoring, cost tracking and on-call ownership',
                'A hand-over the team can run without me',
              ],
            },
          ],
        },
      ],
    },

    impact: {
      title: 'Impact',
      icon: '▲',
      subtitle: 'Numbers measured in production',
      sections: [
        {
          type: 'stats',
          items: [
            { value: '3d → 20s', label: 'catalog ingestion per product, Proploy' },
            { value: '<50ms', label: 'catalog search latency, Proploy' },
            { value: '−90%', label: 'Cloud Run spend, $562 → ~$56 a month, Proploy' },
            { value: '1,000+', label: 'shoppers tracked, Dunne' },
            { value: '99.99%', label: 'uptime over two months, Dunne' },
            { value: '−85%', label: 'image load, 3s+ to <200ms, Dunne' },
          ],
        },
      ],
    },

    proploy: {
      title: 'Proploy',
      icon: '◆',
      subtitle: 'Forward Deployed Engineer · Oct 2025 – now',
      sections: [
        {
          type: 'video',
          src: '/media/proploy-launch.mp4',
          poster: '/media/proploy-launch-poster.jpg',
          caption: 'Proploy in 30 seconds: from shortlisting software to an implementation brief and a buyer workspace.',
        },
        {
          type: 'text',
          title: 'The problem',
          body: 'Buying business software took about three days of vendor pages, review sites and forum threads. Generic chatbots made it worse, recommending products that did not fit or did not exist. Proploy shortlists real products from a curated catalog, explains the fit, writes an implementation brief and hands the buyer to a vetted expert.',
        },
        {
          type: 'text',
          title: 'My role',
          body: 'I joined in October 2025, one of three engineers on a team of five, and I review nearly every PR. I owned the agent service, the retrieval layer it depends on, the stream from agent to browser, and the Cloud Run deploy of the Python services.',
        },
        {
          type: 'list',
          title: 'Architecture',
          items: [
            'Next.js as a backend-for-frontend. The browser never holds an API token.',
            'A FastAPI gateway that owns all catalog search and proxies the stream.',
            'A FastAPI agent service running a Claude tool loop on the native Anthropic SDK.',
            'Postgres with pgvector, hybrid full-text plus vector search, fed by an offline ingestion pipeline.',
          ],
        },
        {
          type: 'text',
          title: 'Unknown is not no',
          body: 'The catalog decides facts and the model decides judgement. Missing evidence shows as unknown, never as no, so the model cannot invent a certification. A matrix full of confident no cells is a hallucination with better formatting.',
        },
        {
          type: 'text',
          title: 'Streaming through three services',
          body: 'Agent turns take tens of seconds, so answers stream live from the agent, through the gateway and Next.js, to the browser. The gateway saves each turn, recovers partial replies and drops duplicate completions. Split timeouts and a warm Cloud Run kept streams from stalling.',
        },
        {
          type: 'stats',
          title: 'Results',
          items: [
            { value: '3d → 20s', label: 'catalog ingestion per product' },
            { value: '<50ms', label: 'catalog search' },
            { value: '−90%', label: 'Cloud Run spend, $562 → ~$56 a month' },
            { value: '~1,900', label: 'automated tests' },
          ],
        },
        { type: 'image', src: '/media/proploy.jpg', alt: 'The Proploy AI workspace', caption: 'proploy.io' },
        { type: 'tags', items: ['Anthropic SDK', 'FastAPI', 'Next.js', 'Postgres + pgvector', 'Cloud Run'] },
        {
          type: 'links',
          items: [
            { label: 'Visit proploy.io', href: 'https://proploy.io' },
            { label: 'Read the full case study', href: `${SITE}/work/proploy` },
            { label: 'Hybrid search in Postgres', href: `${SITE}/blog/hybrid-search-in-postgres`, note: 'the retrieval write-up' },
            {
              label: 'Streaming across three services',
              href: `${SITE}/blog/streaming-ai-agent-responses-across-three-services`,
              note: 'the streaming write-up',
            },
          ],
        },
      ],
    },

    dunne: {
      title: 'Dunne',
      icon: '◇',
      subtitle: 'Full-stack engineer, sole engineer · Jun 2025 – Jan 2026',
      sections: [
        { type: 'image', src: '/media/dunne.jpg', alt: 'The Dunne jewellery store', caption: 'dunne.co.in' },
        {
          type: 'text',
          body: 'Dunne ran its jewellery store on Shopify. As the only engineer, I replaced it with a Next.js marketplace web app, plus a configurator where customers design their own piece. Images were taking 3s+ to load, so I rebuilt the delivery path on Nginx and AWS CloudFront.',
        },
        {
          type: 'stats',
          items: [
            { value: '1,000+', label: 'shoppers tracked' },
            { value: '99.99%', label: 'uptime over two months' },
            { value: '<200ms', label: 'image load, from 3s+' },
          ],
        },
        { type: 'tags', items: ['Next.js', 'Nginx', 'AWS CloudFront', 'S3'] },
        { type: 'links', items: [{ label: 'Visit dunne.co.in', href: 'https://dunne.co.in' }] },
      ],
    },

    emtech: {
      title: 'Emtech Solutions',
      icon: '▣',
      subtitle: 'Full-stack engineer, sole owner · Apr – Jun 2025',
      sections: [
        { type: 'image', src: '/media/emtech.jpg', alt: 'The Emtech Solutions landing page', caption: 'MEPF engineering' },
        {
          type: 'text',
          body: 'An MEPF engineering firm needed to show its work and turn visitors into leads. I built a landing page with proposal generation and job listings, both managed through an admin panel. I owned it alone, from UI/UX design to production.',
        },
        {
          type: 'stats',
          items: [
            { value: '72+', label: 'projects showcased' },
            { value: '12', label: 'sectors covered' },
            { value: '1', label: 'engineer, design to deploy' },
          ],
        },
        { type: 'tags', items: ['Next.js', 'Tailwind CSS', 'UI/UX design'] },
        { type: 'links', items: [{ label: 'Visit the site', href: 'https://emtec-landing-page.vercel.app' }] },
      ],
    },

    tether: {
      title: 'Tether',
      icon: '⚯',
      subtitle: 'Partner outreach automation · solo build, live',
      sections: [
        {
          type: 'text',
          body: 'Every SaaS product has a ring of small implementation agencies. Finding a founder at each one you can actually email is slow, manual work. Tether does it from the official partner directories.',
        },
        {
          type: 'list',
          items: [
            'Reads SaaS partner directories into one store, counting a firm listed by five vendors once',
            'Keeps firms under 100 people and ships only addresses that pass every check',
            'A capped intro, day-3 and day-10 sequence that stops the moment someone replies',
          ],
        },
        {
          type: 'stats',
          items: [
            { value: '23', label: 'partner directories read' },
            { value: '14,008', label: 'partner firms found' },
            { value: '4,897', label: 'addresses that pass every check' },
          ],
        },
        {
          type: 'gallery',
          items: [
            { src: '/media/tether.jpg', alt: 'Tether landing page' },
            {
              src: '/media/tether-app.jpg',
              alt: "Tether's pipeline view: a HubSpot partner directory linked to five agencies and their founders",
            },
            {
              src: '/media/tether-how.jpg',
              alt: "Tether's how-it-works steps beside a terminal dry run of the send command",
            },
          ],
        },
        { type: 'tags', items: ['Python', 'Resend', 'React Flow'] },
        { type: 'links', items: [{ label: 'Visit the live site', href: 'https://site-two-pi-85.vercel.app/' }] },
      ],
    },

    riverline: {
      title: 'Riverline voice agent',
      icon: '◉',
      subtitle: 'Real-time voice AI · solo build',
      sections: [
        { type: 'image', src: '/media/riverline.jpg', alt: 'Illustration of a real-time voice agent pipeline', caption: 'Illustration' },
        {
          type: 'text',
          body: 'Collection calls need an agent that can listen, talk and be interrupted, in Hindi or English. Speech streams through STT, an LLM and TTS over WebSockets. A state machine steers the call, not the prompt.',
        },
        {
          type: 'stats',
          items: [
            { value: '~1.5s', label: 'measured response time, 1.2s target' },
            { value: '2', label: 'languages: Hindi, English' },
            { value: 'Live', label: 'barge-in mid-sentence' },
          ],
        },
        { type: 'tags', items: ['TypeScript', 'Node.js', 'Python', 'XState'] },
        { type: 'links', items: [{ label: 'View on GitHub', href: `${GH}/voice-agent-orchestrator` }] },
      ],
    },

    bidwright: {
      title: 'Bidwright',
      icon: '▤',
      subtitle: 'AI document extraction · solo build',
      sections: [
        { type: 'image', src: '/media/bidwright.jpg', alt: 'Illustration of RFP documents turned into a cited brief', caption: 'Illustration' },
        {
          type: 'text',
          body: 'Pricing a bid means reading every document in an RFP pack by hand. Bidwright reads the whole pack, cites each extracted value to a line on a page, and flags where documents disagree.',
        },
        {
          type: 'stats',
          items: [
            { value: 'Cited', label: 'every extracted value' },
            { value: 'RLS', label: 'isolation per workspace' },
            { value: '4', label: 'invite-only roles' },
          ],
        },
        { type: 'tags', items: ['Python', 'FastAPI', 'React', 'PostgreSQL'] },
        { type: 'links', items: [{ label: 'View on GitHub', href: `${GH}/Bidwright` }] },
      ],
    },

    skills: {
      title: 'The rack',
      icon: '≡',
      subtitle: 'My toolbelt, one shelf per layer',
      sections: [
        {
          type: 'tags',
          title: 'AI / LLM',
          items: ['Anthropic SDK (Claude)', 'Agentic workflows', 'RAG pipelines', 'LangChain', 'LangGraph', 'Amazon Bedrock', 'Qdrant', 'Groq'],
        },
        {
          type: 'tags',
          title: 'Backend & distributed',
          items: ['FastAPI', 'Node.js', 'NestJS', 'Event-driven (Pub/Sub)', 'SSE streaming', 'Redis caching', 'JWT auth'],
        },
        {
          type: 'tags',
          title: 'Cloud & DevOps',
          items: ['GCP Cloud Run', 'GCP Pub/Sub', 'AWS EC2, S3 and Lambda', 'CloudFront', 'Docker', 'Kubernetes', 'Nginx', 'CI/CD'],
        },
        { type: 'tags', title: 'Data', items: ['PostgreSQL', 'Supabase', 'Redis', 'MongoDB', 'Prisma', 'SQLAlchemy'] },
        { type: 'tags', title: 'Frontend', items: ['React', 'Next.js', 'React Native', 'Tailwind CSS'] },
        { type: 'tags', title: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'Go', 'SQL'] },
        {
          type: 'links',
          title: 'More builds',
          items: [
            { label: 'Flowforge', href: `${GH}/Flowforge`, note: 'drag-and-drop AI workflows' },
            { label: 'Solana prediction market', href: `${GH}/anchor`, note: 'Anchor program in Rust' },
            { label: 'CEX', href: `${GH}/CEX`, note: 'simulated exchange, FIFO P/L' },
          ],
        },
      ],
    },

    github: {
      title: 'GitHub',
      icon: '⌥',
      subtitle: '@priyanshu14077',
      sections: [
        { type: 'contributions', total: '2,100+' },
        {
          type: 'text',
          body: 'Most of my independent builds live here. Prototypes go up with the code, so you can read how they work.',
        },
        {
          type: 'links',
          items: [
            { label: 'github.com/priyanshu14077', href: GH },
            { label: 'Riverline voice agent', href: `${GH}/voice-agent-orchestrator` },
            { label: 'Bidwright', href: `${GH}/Bidwright` },
            { label: 'Flowforge', href: `${GH}/Flowforge` },
          ],
        },
      ],
    },

    writing: {
      title: 'Field notes',
      icon: '✎',
      subtitle: 'What I learned building it',
      sections: [
        {
          type: 'posts',
          items: [
            {
              title: 'Streaming AI agent responses across three services',
              href: `${SITE}/blog/streaming-ai-agent-responses-across-three-services`,
              date: '2026-10-13',
              tags: ['ai', 'distributed-systems', 'system-design'],
            },
            {
              title: 'Designing an AI outbound voice agent',
              href: `${SITE}/blog/designing-an-ai-outbound-voice-agent`,
              date: '2026-10-13',
              tags: ['system-design', 'ai', 'distributed-systems'],
            },
            {
              title: 'Hybrid search in Postgres, and the RRF mistake',
              href: `${SITE}/blog/hybrid-search-in-postgres`,
              date: '2026-10-08',
              tags: ['ai', 'databases', 'system-design'],
            },
            {
              title: 'Designing a URL shortener',
              href: `${SITE}/blog/designing-a-url-shortener`,
              date: '2026-10-06',
              tags: ['system-design', 'distributed-systems', 'databases'],
            },
          ],
        },
        {
          type: 'links',
          title: 'Case study',
          items: [{ label: 'Proploy: an AI procurement platform', href: `${SITE}/work/proploy` }],
        },
      ],
    },

    now: {
      title: '/now',
      icon: '◐',
      subtitle: 'What has my attention this month',
      sections: [
        {
          type: 'list',
          items: [
            'Working on Masthead, a hosted blog and content studio grown out of my Blog Studio.',
            'Just built Doodle Militia, a Mini Militia-style multiplayer game.',
            'Learning how LLM systems are built: agent loops, retrieval, evals, and the latency and cost around them.',
            'Writing System Design 101, a series that started with the URL shortener.',
            'Practising data structures and algorithms with the LeetCode 75 study plan.',
          ],
        },
        {
          type: 'links',
          items: [
            { label: 'System Design 101, part 1', href: `${SITE}/blog/designing-a-url-shortener` },
            { label: 'LeetCode 75', href: 'https://leetcode.com/studyplan/leetcode-75/' },
          ],
        },
      ],
    },

    music: {
      title: 'Radio',
      icon: '♪',
      subtitle: 'Six stations, tune with the dial',
      sections: [
        {
          type: 'text',
          body: "Jazz, hip hop, and a lot of Led Zeppelin and '70s and '80s rock. Each station is one of my playlists. You join mid-broadcast, like real radio.",
        },
        { type: 'radio' },
      ],
    },

    sports: {
      title: 'Off the court',
      icon: '◍',
      subtitle: 'Badminton, cricket, basketball',
      sections: [
        {
          type: 'text',
          body: "I play badminton, cricket and basketball, and I follow badminton closely. In the NBA I'm a big Luka Dončić fan. Back home, the cat runs the place.",
        },
        { type: 'tags', items: ['Badminton', 'Cricket', 'Basketball', 'Luka Dončić', 'Cat person'] },
      ],
    },

    location: {
      title: 'New Delhi',
      icon: '◷',
      subtitle: 'Where I am, and what time it is here',
      sections: [
        { type: 'clock', tz: 'Asia/Kolkata', label: 'New Delhi, India' },
        {
          type: 'text',
          body: "I'm based in New Delhi and work with teams anywhere. Remote, on-site, or I'll relocate for the right role.",
        },
      ],
    },

    resume: {
      title: 'Resume',
      icon: '▦',
      subtitle: 'The paper version',
      sections: [
        {
          type: 'text',
          body: "One page, everything that matters. LinkedIn has the full history, and the classic site has every project.",
        },
        {
          type: 'links',
          items: [
            { label: 'Resume (PDF)', href: RESUME, note: 'Google Drive' },
            { label: 'LinkedIn', href: LINKEDIN },
            { label: 'The classic site', href: SITE },
          ],
        },
      ],
    },

    contact: {
      title: 'Say hello',
      icon: '✉',
      subtitle: 'Bring me your hardest workflow',
      sections: [
        { type: 'status' },
        {
          type: 'links',
          items: [
            { label: 'Email', href: `mailto:${EMAIL}`, note: EMAIL },
            { label: 'Book a call', href: BOOKING, note: 'cal.com' },
            { label: 'GitHub', href: GH },
            { label: 'LinkedIn', href: LINKEDIN },
          ],
        },
      ],
    },
  },
}
