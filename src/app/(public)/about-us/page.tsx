import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about TechSurround — your trusted source for technology news, reviews, and insights.",
  alternates: { canonical: "/about-us" },
};

export default function AboutPage() {
  return (
    <section className="py-8 md:py-12">
      <Container narrow>
        <Breadcrumb items={[{ name: "Home", href: "/" }, { name: "About Us" }]} />

        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-6">
          About TechSurround
        </h1>

        <div className="prose max-w-none">
          <h2>Who We Are</h2>
          <p>
            TechSurround is a professional technology publication dedicated to delivering accurate, 
            timely, and insightful coverage of the technology landscape. We cover everything from 
            breaking tech news and cyber security developments to new mobile arrivals, trending apps, 
            AI advancements, and practical technology tools.
          </p>

          <h2>Our Mission</h2>
          <p>
            Our mission is to make technology accessible and understandable for everyone. We believe 
            that technology news should be explained simply, without unnecessary jargon, while 
            maintaining the depth and accuracy that informed readers expect.
          </p>

          <h2>What We Cover</h2>
          <ul>
            <li><strong>Technology News</strong> — Breaking stories, trends, and analysis</li>
            <li><strong>Cyber Security</strong> — Threats, vulnerabilities, and protection</li>
            <li><strong>Cyber Crime</strong> — Data breaches, hacking, and digital fraud</li>
            <li><strong>New Mobile Arrivals</strong> — Smartphone launches and specifications</li>
            <li><strong>AI</strong> — Artificial intelligence developments and innovations</li>
            <li><strong>Gadgets</strong> — Reviews and coverage of consumer electronics</li>
            <li><strong>Trending Apps</strong> — Popular and emerging applications</li>
            <li><strong>Technology Tools</strong> — Free browser-based utilities</li>
          </ul>

          <h2>Editorial Approach</h2>
          <p>
            Every piece of content published on TechSurround goes through a careful editorial process. 
            We prioritize accuracy over speed, clarity over complexity, and reader value over clickbait. 
            Our team verifies facts, cross-references sources, and ensures that every article meets 
            our quality standards.
          </p>

          <h2>Contact Us</h2>
          <p>
            We value your feedback and are always open to hearing from our readers. Whether you have 
            a news tip, a correction, or a suggestion, please don&apos;t hesitate to reach out through 
            our <a href="/contact-us">Contact Page</a>.
          </p>
        </div>
      </Container>
    </section>
  );
}
