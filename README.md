# TripTally

TripTally is a modern web app for tracking group travel expenses. Easily add trips, travellers, and expenses, and see who paid what. Designed for mobile, tablet, and desktop with a beautiful, responsive UI.

## Features
- Create and manage trips with custom names, currencies, and date ranges
- Add travellers and assign expenses to them
- Real-time updates for all users (no refresh needed)
- Responsive, mobile-friendly design
- Modern toast notifications and confirmation modals
- Confetti animation on trip creation for delightful UX
- **Accessible and SEO/PWA-friendly:**
  - WCAG-compliant color contrast and keyboard navigation
  - Semantic HTML, ARIA labels, and accessible modals/dialogs
  - All error messages are shown to users in a clear, friendly way
  - Meta tags, manifest, and icons for SEO and installability
  - App can be installed as a PWA on mobile/desktop
- **Authentication:**
  - Magic link sign-in (email, no password required)
  - Google sign-in (one-click, fast)
  - Secure session persists until logout
  - Log out from any device
- **User Info:**
  - Shows logged-in user's email (magic link) or first name (Google) in the header
- **Modern UI:**
  - Consistent branding, color, and iconography
  - Works great on all screen sizes
- **Easy to use for non-coders:**
  - Code is commented throughout to help you understand and modify it
  - README and code comments explain all major features and flows

## Tech Stack
- Next.js (React framework)
- Tailwind CSS + DaisyUI (styling)
- Supabase (database, authentication, and real-time)
- canvas-confetti (celebration animation)

## Design Consistency
TripTally uses a strict design system for:
- **Spacing & Padding:** All cards, modals, and forms use consistent padding (e.g., p-4, p-5, p-6) and margin for visual balance.
- **Border Radius:** All cards, modals, and buttons use rounded-lg or rounded-xl for a modern, friendly look.
- **Font Size & Hierarchy:** Headings, labels, and body text use a clear hierarchy for readability. Amounts and totals are prominent but not overpowering.
- **Whitespace:** Generous whitespace is used to group related controls and separate unrelated ones, improving clarity and touch targets.
- **Color & Shadows:** Uses DaisyUI/Tailwind color tokens for backgrounds, text, and shadows. Shadows are soft and used for separation, not floating effects.
- **Accessibility:** All spacing, color, and font choices are made with accessibility in mind.

## Code Commenting & Structure
- All main files and components are commented to explain what each part does.
- Comments are kept up to date and clarify the purpose and logic of each function or section.
- If you want to change something, read the comments to understand what it does first.
- If you get stuck, you can always ask for help or open an issue.

## Setup Instructions
1. **Clone the repository:**
   ```
   git clone <your-repo-url>
   cd triptally
   ```
2. **Install dependencies:**
   ```
   npm install
   ```
3. **Configure Supabase:**
   - Create a project at [supabase.com](https://supabase.com/)
   - Copy your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to a `.env.local` file:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
     ```
   - Ensure your `trips` table has `start_date` and `end_date` columns (type: `date`)
   - Enable Google sign-in in Supabase and Google Cloud Console if you want it
4. **Run the app locally:**
   ```
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

## Accessibility, SEO & PWA
- Uses semantic HTML and ARIA labels for screen readers
- High color contrast and keyboard navigation support
- All modals/dialogs are accessible (role, aria-modal, Escape to close)
- All error messages are visible and accessible (role="alert")
- Meta tags, manifest, and icons for SEO and PWA
- App is installable as a PWA (add to home screen on mobile/desktop)

## Inviting Testers & Production Readiness
- You can share your deployed app link with friends or team members for testing
- All authentication and error flows are production-ready
- If you add new features, follow the same accessibility and error handling patterns

## Contributing
Pull requests are welcome! Please open an issue first to discuss major changes.

## License
MIT
