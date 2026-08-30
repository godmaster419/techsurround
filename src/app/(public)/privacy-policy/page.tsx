import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "TechSurround Privacy Policy — how we collect, use, and protect your information.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <section className="py-8 md:py-12">
      <Container narrow>
        <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "Privacy Policy" }]} />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-6">Privacy Policy</h1>
        <div className="prose max-w-none">
          <p><em>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</em></p>
          <h2>Information We Collect</h2>
          <p>TechSurround collects information you provide directly, such as when you subscribe to our newsletter, submit a contact form, or interact with our tools. We may also collect basic analytics data such as page views and device type to improve our services.</p>
          <h2>How We Use Your Information</h2>
          <p>We use collected information to deliver our content, respond to inquiries, send newsletters (if subscribed), and improve our platform. We do not sell your personal information to third parties.</p>
          <h2>Cookies</h2>
          <p>We use essential cookies for site functionality (such as theme preference) and may use analytics cookies to understand usage patterns. You can control cookie settings through your browser.</p>
          <h2>Third-Party Services</h2>
          <p>We may use third-party analytics services (such as Google Analytics) and content delivery networks. These services have their own privacy policies governing the use of your information.</p>
          <h2>Data Security</h2>
          <p>We implement appropriate security measures to protect your information. However, no method of electronic transmission or storage is 100% secure.</p>
          <h2>Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data by contacting us through our <a href="/contact-us">Contact Page</a>.</p>
          <h2>Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. Updates will be posted on this page with a revised date.</p>
          <h2>Contact</h2>
          <p>For privacy-related questions, please contact us at <a href="/contact-us">our contact page</a>.</p>
        </div>
      </Container>
    </section>
  );
}
