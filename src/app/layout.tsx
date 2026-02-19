export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className="transition-colors duration-500 h-screen overflow-y-auto">{children}</body>
    </html>
  );
}
