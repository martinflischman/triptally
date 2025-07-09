# TripTally

TripTally is a modern web app for tracking group travel expenses. Easily add trips, travellers, and expenses, and see who paid what. Designed for mobile, tablet, and desktop with a beautiful, responsive UI.

## Features
- Create and manage trips with custom names, currencies, and date ranges
- Add travellers and assign expenses to them
- Real-time updates and instant UI feedback
- Responsive, mobile-friendly design
- Modern toast notifications and confirmation modals
- Confetti animation on trip creation for delightful UX
- Accessible and SEO-friendly (WCAG and best practices)

## Tech Stack
- Next.js (React framework)
- Tailwind CSS + DaisyUI (styling)
- Supabase (database and real-time)
- canvas-confetti (celebration animation)

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
4. **Run the app locally:**
   ```
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

## Accessibility & SEO
- Uses semantic HTML and ARIA labels for screen readers
- High color contrast and keyboard navigation support
- Meta tags and headings for SEO best practices

## Contributing
Pull requests are welcome! Please open an issue first to discuss major changes.

## License
MIT
