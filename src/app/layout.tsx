// app/layout.tsx
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="overflow-x-hidden bg-neutral-950 text-neutral-200">
        <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-purple-600/10 blur-[100px]" />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
