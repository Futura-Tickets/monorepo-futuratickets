// COMPONENTS
import RootProvider from "@/components/RootProvider";
import { ErrorBoundary } from "@/components/error-boundary";

// STYLES
import "./globals.scss";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
    <head>
      <title>Futura Tickets</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta name="description" content="Futura Tickets Promoters Platform"/>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link rel="preconnect" href="https://fonts.gstatic.com"/>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet"/>
    </head>
    <body>
      <noscript>
        You need to enable JavaScript to run this app.
      </noscript>
      <ErrorBoundary>
        <RootProvider>{children}</RootProvider>
      </ErrorBoundary>
    </body>
  </html>
  );
}
