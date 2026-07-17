import "./globals.css";

export const metadata = {
  title: "Academy",
  description: "Live workshops, an honest community, and assessments from senior designers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
