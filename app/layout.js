import "./globals.css";

export const metadata = {
  title: "TripTally",
  description: "Track your trips expenses with ease.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "manifest",
        url: "/site.webmanifest",
      },
      {
        rel: "icon",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-base-200">
      <head>
        <meta name="description" content="TripTally: Effortlessly track group travel expenses, split costs, and see who paid what. Modern, mobile-friendly, and real-time." />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1f2937" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="msapplication-TileColor" content="#1f2937" />
        {/* Open Graph meta tags for social sharing */}
        <meta property="og:title" content="TripTally" />
        <meta property="og:description" content="Effortlessly track group travel expenses, split costs, and see who paid what. Modern, mobile-friendly, and real-time." />
        <meta property="og:image" content="/android-chrome-192x192.png" />
        <meta property="og:url" content="https://triptally-xi.vercel.app" />
        <meta property="og:type" content="website" />
        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="TripTally" />
        <meta name="twitter:description" content="Effortlessly track group travel expenses, split costs, and see who paid what. Modern, mobile-friendly, and real-time." />
        <meta name="twitter:image" content="/android-chrome-192x192.png" />
      </head>
      <body className="min-h-[100dvh] bg-base-200 text-base-content antialiased overscroll-none scroll-smooth touch-pan-y">
        <main>{children}</main>
      </body>
    </html>
  );
}
