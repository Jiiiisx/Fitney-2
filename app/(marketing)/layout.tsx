import Navbar from "./Navbar";

// This is the layout for the marketing pages.
// It includes the Navbar and then renders the page content.
// It does NOT include <html> or <body> tags, as those are in the root layout.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
