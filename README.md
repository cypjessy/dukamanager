# DukaManager Login Page

A premium, production-ready login page for DukaManager - a Next.js 14 shop management system built for Kenyan duka (small retail) shops.

## Tech Stack

- **Next.js 14** - App Router with Server Components
- **TypeScript** - Strict mode enabled
- **Tailwind CSS** - Custom Kenyan-inspired color palette
- **Framer Motion** - Purposeful, lightweight animations
- **Zod + React Hook Form** - Type-safe form validation

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint check
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the login page.

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles, CSS patterns, utilities
│   ├── layout.tsx           # Root layout with metadata, fonts
│   └── page.tsx             # Login page (Client Component)
├── components/
│   ├── ui/
│   │   ├── Button.tsx       # Gradient CTA with loading/success states
│   │   ├── FloatingInput.tsx # Animated floating label input
│   │   ├── Icons.tsx        # SVG icons + animated duka illustration
│   │   └── LanguageToggle.tsx # English/Swahili switcher
│   └── login/
│       ├── BrandSection.tsx  # Hero section with benefits + testimonials
│       ├── LoginCard.tsx     # Glassmorphism container
│       └── LoginForm.tsx     # Form with Zod validation
├── lib/
│   ├── animations.ts        # Framer Motion variant definitions
│   ├── translations.ts      # i18n English/Swahili strings
│   └── validations.ts       # Zod login schema
└── types/
    └── index.ts             # TypeScript type definitions
```

## Key Features

### Design
- Kenyan earth tone color palette (terracotta, savanna gold, forest green)
- Kanga/kitenge-inspired geometric background patterns (CSS only)
- Glassmorphism login card with backdrop blur
- Animated SVG duka shop illustration (no external images)
- Full English/Swahili bilingual support

### Responsive Layout
- **Mobile (320px-767px)**: Full-screen with centered login card
- **Tablet (768px-1023px)**: Split layout - brand storytelling + login
- **Desktop (1024px+)**: 60/40 split with immersive brand section

### Form
- Floating label inputs with phone/email and lock icons
- Real-time Zod validation with shake animation on errors
- Password visibility toggle
- "Ingia Dukani" gradient CTA with loading spinner and success pulse

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation support
- ARIA labels in both languages
- `prefers-reduced-motion` respected
- 44px minimum touch targets

### Performance
- CSS animations preferred over JS
- No external image dependencies
- Lightweight JS bundle (~89KB first load)
- Battery-conscious: no heavy mobile animations

## Custom Colors

| Name       | Hex       | Usage                |
|------------|-----------|----------------------|
| Terracotta | `#C75B39` | Primary / CTA        |
| Savanna    | `#D4A574` | Accents / warmth     |
| Forest     | `#2D5A3D` | Trust / success      |
| Sunset     | `#E85D04` | Highlights / energy  |
| Warm 50    | `#F5F5F0` | Background           |
| Warm 100   | `#E8E6E1` | Borders / muted text |

## Breakpoints

| Name | Size   | Device                  |
|------|--------|-------------------------|
| xs   | 320px  | Small feature phones    |
| sm   | 480px  | Large phones            |
| md   | 768px  | Tablets                 |
| lg   | 1024px | Small laptops           |
| xl   | 1280px | Desktops                |
| 2xl  | 1536px | Large screens           |

## Languages

Toggle between English and Swahili using the language button in the top-right corner. All UI strings, ARIA labels, and validation messages are translated.

## License

MIT
