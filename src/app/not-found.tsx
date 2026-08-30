import Link from "next/link";
import Container from "@/components/ui/Container";

export default function NotFound() {
  return (
    <section className="py-20 text-center">
      <Container narrow>
        <div className="text-8xl font-extrabold text-primary/20 mb-4">404</div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">
          Page Not Found
        </h1>
        <p className="text-muted max-w-md mx-auto mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-[var(--radius)] hover:bg-primary-hover transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/search"
            className="px-5 py-2.5 bg-surface-elevated border border-border text-foreground text-sm font-medium rounded-[var(--radius)] hover:bg-surface-hover transition-colors"
          >
            Search
          </Link>
        </div>
      </Container>
    </section>
  );
}
