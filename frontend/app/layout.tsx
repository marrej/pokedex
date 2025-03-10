import type { Metadata } from "next";
import "./globals.scss";
import { ApolloWrapper } from "./ApolloWrapper";

export const metadata: Metadata = {
  title: "Pokedex",
  description: "Gotta catch them all",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
