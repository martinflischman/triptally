import "./globals.css";

export const metadata = {
  title: "TripTally",
  description: "Track your trips expenses with ease.",
  viewport: "width=device-width, initial-scale=1.0",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-base-200" data-theme="">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta
          name="theme-color"
          content="#1f2937"
          media="(prefers-color-scheme: dark)"
        />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
                
                // Update theme color based on current theme
                const themeColor = theme === 'dark' ? '#1f2937' : '#ffffff';
                document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColor);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-[100dvh] bg-base-200 text-base-content antialiased overscroll-none scroll-smooth touch-pan-y">
        {children}
      </body>
    </html>
  );
}
