---
name: Hope & Community Narrative
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#44474d'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#75777e'
  outline-variant: '#c5c6ce'
  surface-tint: '#4e5f7e'
  primary: '#031632'
  on-primary: '#ffffff'
  primary-container: '#1a2b48'
  on-primary-container: '#8293b5'
  inverse-primary: '#b6c7eb'
  secondary: '#964900'
  on-secondary: '#ffffff'
  secondary-container: '#ff8928'
  on-secondary-container: '#642f00'
  tertiary: '#340400'
  on-tertiary: '#ffffff'
  tertiary-container: '#561104'
  on-tertiary-container: '#db755f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#b6c7eb'
  on-primary-fixed: '#081b38'
  on-primary-fixed-variant: '#374765'
  secondary-fixed: '#ffdcc6'
  secondary-fixed-dim: '#ffb786'
  on-secondary-fixed: '#311300'
  on-secondary-fixed-variant: '#723600'
  tertiary-fixed: '#ffdad3'
  tertiary-fixed-dim: '#ffb4a4'
  on-tertiary-fixed: '#3e0500'
  on-tertiary-fixed-variant: '#7c2d1c'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Merriweather
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Merriweather
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

This design system is built to reflect the mission of supporting vulnerable children through a lens of warmth, stability, and grassroots sincerity. The brand personality is **nurturing, transparent, and dignified**, avoiding the sterile look of large international corporations in favor of a "human-first" approach that feels accessible to local communities and global donors alike.

The visual style follows a **Modern Humanitarian** aesthetic. It combines the clean structure of modern SaaS design with the soft, tactile warmth of editorial layouts. We utilize high-quality photography of people and community life, anchored by a rich, earthy color palette and generous whitespace to evoke a sense of peace and hope. Physical metaphors are used sparingly through soft shadows and organic shapes to remind the user of the real-world impact behind the digital interface.

## Colors

The palette is derived directly from the NGO's core identity, balancing authority with energy.

- **Primary (Deep Navy):** Represents stability, trust, and the institutional strength of the NGO. Used for primary branding, navigation, and deep-toned backgrounds.
- **Secondary (Sunset Orange):** Evokes the Tanzanian landscape and a sense of optimism. Used for high-priority calls to action, highlights, and active states.
- **Background (Cream/Off-White):** A soft, warm neutral that is much gentler on the eyes than pure white, providing a "paper-like" feel that supports the grassroots narrative.
- **Accent (Terracotta):** A supplementary tertiary tone (#A24936) used for secondary UI elements to add depth and earthiness.

Avoid using pure blacks; instead, use the Primary Navy at varying opacities for text and borders to maintain a harmonious, integrated look.

## Typography

The typography system uses a pairing of a modern sans-serif for structure and a warm serif for storytelling.

- **Headings & UI Labels:** We use **Plus Jakarta Sans**. Its friendly, open curves and modern proportions provide a professional and welcoming tone for titles and navigational elements.
- **Body & Long-form Text:** We use **Merriweather**. This serif font is highly legible and carries a "literary" weight that feels authoritative yet personal, perfect for sharing stories of the children and community progress.

**Hierarchy Rules:**
1. Use Display and Headline styles for impact and section starts.
2. Use Body-LG for introductory paragraphs and impact quotes.
3. Ensure line height for Body text remains generous (at least 1.6x) to facilitate easy reading for all ages.

## Layout & Spacing

The layout is designed to feel spacious and unhurried. We utilize a **fixed-width centered grid** for desktop to maintain focus on the content narrative, while transitioning to a flexible fluid model for mobile.

- **Desktop:** 12-column grid, 1200px max width, 24px gutters.
- **Tablet:** 8-column grid, 24px gutters, 32px side margins.
- **Mobile:** 4-column grid, 16px gutters, 16px side margins.

Spacing follows an 8px rhythm. For narrative sections (like child stories or mission statements), vertical padding should be increased to `stack-lg` to create a "breathing room" effect that elevates the content's importance.

## Elevation & Depth

To maintain a grassroots and heartfelt feel, elevation is achieved through **tonal layering** and **soft ambient shadows** rather than harsh borders or deep gradients.

- **Surface Levels:** The primary background is the cream `#FDFBF7`. Cards and containers use pure white `#FFFFFF` to subtly pop forward.
- **Shadows:** Use extremely soft, large-radius shadows with a hint of the Primary Navy tint (e.g., `rgba(26, 43, 72, 0.06)`). This avoids a "dirty" gray look and feels more integrated into the brand.
- **Interactivity:** Elements like buttons should have a slight "lift" on hover, increasing shadow spread rather than just changing color, to give a tactile, responsive feel.

## Shapes

The shape language is defined by **Rounded (0.5rem)** corners. This choice reflects the "Heart" and "Community" aspects of the logo, avoiding the coldness of sharp corners.

- **Buttons & Inputs:** Use the standard `rounded` (0.5rem) setting.
- **Featured Cards:** Use `rounded-lg` (1rem) to emphasize their role as containers for important stories.
- **Icon Backdrops:** Can use circular or pill-shaped containers to add a playful, friendly energy to the interface.

## Components

- **Buttons:**
    - **Primary:** Sunset Orange background with white text. High contrast for "Donate" or "Get Involved."
    - **Secondary:** Deep Navy outline with Navy text on a transparent or cream background.
- **Cards:**
    - White background, 1rem corner radius, soft Navy-tinted shadow.
    - Used for "Child Sponsorship" profiles or "News" updates.
- **Input Fields:**
    - Subtle navy-tinted borders (20% opacity). On focus, the border thickens and changes to Sunset Orange.
- **Chips/Tags:**
    - Used for categories like "Education," "Health," or "Urgent." These should use low-saturation versions of the brand colors with Navy text.
- **Progress Bars:**
    - Essential for fundraising goals. Use a thick track in soft cream and a filled state in Sunset Orange to indicate momentum and hope.
- **Donation Toggles:**
    - Large, easy-to-tap segments for pre-defined amounts ($10, $25, $50), using the Primary Navy for selected states to denote commitment and stability.