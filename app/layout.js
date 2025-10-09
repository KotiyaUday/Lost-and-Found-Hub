import "./globals.css";

export const metadata = {
  title: "Lost & Found Hub",
  description: "Lost & Found Hub is my hackathon project.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
