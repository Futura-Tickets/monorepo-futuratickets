import RootProvider from "@/components/RootProvider";

// STYLES
import "./globals.scss";

export default function RootLayout({ children }: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <head>
        <title>Futura Tickets</title>
      </head>
      <body>
        <RootProvider>{children}</RootProvider>  
      </body>
    </html>
  );
}
