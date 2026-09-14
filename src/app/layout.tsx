import type { Metadata } from "next";
import { headers } from "next/headers";
import DaedongCursor from "./DaedongCursor";
import VenueChangeNotice from "./VenueChangeNotice";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const description = "농업의 미래를 이해하고, 나의 미래를 설계하는 5일";
  return {
    metadataBase: base,
    title: "대동에서 시작하는 Great Journey",
    description,
    icons: { icon: "/images/daedong-logo.png", shortcut: "/images/daedong-logo.png" },
    openGraph: { title: "대동에서 시작하는 Great Journey", description, type: "website", images: [{ url: new URL("/og.png", base).toString(), width: 1748, height: 910, alt: "AI TO THE FIELD - 대동에서 시작하는 Great Journey" }] },
    twitter: { card: "summary_large_image", title: "대동에서 시작하는 Great Journey", description, images: [new URL("/og.png", base).toString()] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body><DaedongCursor />{children}<VenueChangeNotice /></body>
    </html>
  );
}
