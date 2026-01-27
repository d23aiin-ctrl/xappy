# Mobirizer - Next.js Website

Modern Next.js 14 application for Mobirizer AI Development Studio website.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: CSS (UX4G framework + custom styles)
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

### Development Server

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
mobirizer-nextjs/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with global styles
│   ├── page.tsx            # Home page
│   ├── company/            # Company page
│   ├── contact/            # Contact page with form
│   ├── products/           # Products listing and detail pages
│   ├── solutions/          # Solutions page
│   ├── sitemap.ts          # Dynamic sitemap generation
│   └── robots.ts           # Robots.txt generation
├── components/             # React components
│   ├── layout/             # Layout components (Header, Footer, etc.)
│   └── ui/                 # UI components (StatCard, etc.)
├── hooks/                  # Custom React hooks
│   ├── useBackToTop.ts     # Back to top button logic
│   ├── useMobileNav.ts     # Mobile navigation state
│   └── useCounterAnimation.ts # Animated counter
├── lib/                    # Utility functions and configs
│   └── metadata.ts         # SEO metadata helpers
├── public/                 # Static assets
│   └── assets/             # Images, favicon, etc.
├── styles/                 # Global CSS
│   └── styles.css          # Main stylesheet
└── tests/                  # Test files
```

## Features

- **Server-Side Rendering**: All pages are server-rendered for optimal SEO
- **Dynamic Metadata**: Each page has proper meta tags for SEO
- **Responsive Design**: Mobile-first responsive layouts
- **Accessibility**: Skip links, ARIA labels, and semantic HTML
- **Performance**: Optimized with Next.js automatic code splitting
- **Counter Animations**: Numbers animate when scrolled into view
- **Back to Top**: Smooth scroll back to top button
- **Mobile Navigation**: Slide-out mobile menu

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Main landing page with hero, services, and CTA |
| Company | `/company` | About us, team, values, and timeline |
| Contact | `/contact` | Contact form and FAQ |
| Products | `/products` | Product portfolio listing |
| Solutions | `/solutions` | AI solutions and capabilities |
| D23.ai | `/products/d23-ai` | WhatsApp AI assistant product |
| WhatsApp Commerce | `/products/whatsapp-commerce` | E-commerce solution |
| RoboGuru | `/products/roboguru` | AI education platform |
| OHGRT | `/products/ohgrt` | AI voice generation |
| Xappy | `/products/xappy` | Healthcare platform |
| JanSeva | `/products/janseva` | Citizen engagement |

## External Dependencies

The website uses these external resources (loaded via CDN):

- **UX4G Framework**: Indian government design framework CSS/JS
- **Google Fonts**: Rubik font family
- **Remixicon**: Icon library
- **Unsplash**: Stock images (via hotlink)

## Environment Variables

No environment variables required for basic setup. For production, consider:

```env
NEXT_PUBLIC_SITE_URL=https://mobirizer.com
```

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Run linting: `npm run lint`
5. Submit a pull request

## License

Copyright 2025 Mobirizer Services Pvt. Ltd. All Rights Reserved.
