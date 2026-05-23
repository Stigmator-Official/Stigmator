import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/layout/back-to-top";
import { NeedleCursor } from "@/components/effects/needle-cursor";
import { Spotlight } from "@/components/effects/spotlight";
import { CartProvider } from "@/lib/cart/cart-context";
import { ToastProvider } from "@/components/toast/toast-context";
import { QueryProvider } from "@/lib/query/provider";
import { AnalyticsProvider } from "@/lib/analytics/provider";
import { AuthProvider } from "@/lib/auth/provider";

export const metadata: Metadata = {
  title: "Stigmator - Tattoo Economy Revolution",
  description: "Where ink meets ownership. The platform connecting tattoo artists with apparel manufacturing.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#050805",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased custom-cursor">
        {/* Skip to content link for accessibility */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        
        <AuthProvider>
          <QueryProvider>
            <AnalyticsProvider>
              <ToastProvider>
                <CartProvider>
                  <Spotlight />
                  <NeedleCursor />
                  <Navbar />
                  <main id="main-content" tabIndex={-1} className="animate-page-enter">
                    {children}
                  </main>
                  <Footer />
                  <BackToTop />
                </CartProvider>
              </ToastProvider>
            </AnalyticsProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
