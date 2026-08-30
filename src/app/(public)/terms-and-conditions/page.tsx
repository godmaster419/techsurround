import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = { title: "Terms & Conditions", description: "TechSurround Terms and Conditions of use.", alternates: { canonical: "/terms-and-conditions" } };

export default function TermsPage() {
  return (
    <section className="py-8 md:py-12">
      <Container narrow>
        <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "Terms & Conditions" }]} />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-6">Terms &amp; Conditions</h1>
        <div className="prose max-w-none">
          <p><em>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</em></p>
          <h2>Acceptance of Terms</h2>
          <p>By accessing and using TechSurround, you accept and agree to be bound by these terms and conditions. If you do not agree, please do not use our website.</p>
          <h2>Content</h2>
          <p>All content on TechSurround is provided for informational purposes only. While we strive for accuracy, we make no warranties regarding completeness or reliability. Content should not be considered professional advice.</p>
          <h2>Intellectual Property</h2>
          <p>All content, including text, graphics, logos, and software, is the property of TechSurround and is protected by copyright laws. You may not reproduce, distribute, or create derivative works without permission.</p>
          <h2>User Conduct</h2>
          <p>You agree not to use TechSurround for any unlawful purpose, attempt to gain unauthorized access, or interfere with the website&apos;s operation.</p>
          <h2>Third-Party Links</h2>
          <p>Our website may contain links to third-party websites. We are not responsible for the content or practices of external sites.</p>
          <h2>Tools</h2>
          <p>Browser-based tools provided on TechSurround are offered as-is for convenience. We do not guarantee specific results and are not liable for any data processed through these tools.</p>
          <h2>Limitation of Liability</h2>
          <p>TechSurround shall not be liable for any damages arising from the use of our website or reliance on our content.</p>
          <h2>Changes</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of TechSurround constitutes acceptance of revised terms.</p>
        </div>
      </Container>
    </section>
  );
}
