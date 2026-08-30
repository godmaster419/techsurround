import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/Breadcrumb";
import SocialShare from "@/components/SocialShare";
import { db } from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const d = await db.mobileArrival.findUnique({ where: { slug } });
  if (!d) return {};
  return {
    title: d.seoTitle || `${d.brand} ${d.name} — Specifications & Price`,
    description: d.seoDescription || d.shortDescription || `Full specifications, price, and details for ${d.brand} ${d.name}.`,
    alternates: { canonical: `/new-mobile-arrivals/${slug}` },
    openGraph: { images: d.ogImage || d.primaryImage ? [{ url: (d.ogImage || d.primaryImage)! }] : [] },
  };
}

function SpecRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <tr className="border-b border-border-light">
      <td className="py-2.5 pr-4 text-sm font-medium text-muted whitespace-nowrap w-[160px]">{label}</td>
      <td className="py-2.5 text-sm text-foreground">{value}</td>
    </tr>
  );
}

function SpecSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-foreground mb-3 pb-2 border-b border-border">{title}</h2>
      <table className="w-full"><tbody>{children}</tbody></table>
    </div>
  );
}

export default async function MobileDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const device = await db.mobileArrival.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" } } },
  });

  if (!device) notFound();

  const pageUrl = `${siteUrl}/new-mobile-arrivals/${slug}`;

  return (
    <section className="py-8 md:py-12">
      <Container>
        <Breadcrumb items={[
          { name: "Home", href: "/" },
          { name: "New Mobile Arrivals", href: "/new-mobile-arrivals" },
          { name: `${device.brand} ${device.name}` },
        ]} />

        {/* Header */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Gallery */}
          <div>
            <div className="aspect-square bg-surface rounded-[var(--radius-lg)] flex items-center justify-center p-8 border border-border">
              {device.primaryImage ? (
                <img src={device.primaryImage} alt={`${device.brand} ${device.name}`} className="max-h-full object-contain" />
              ) : (
                <svg className="w-24 h-24 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            {device.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {device.images.map((img) => (
                  <div key={img.id} className="w-20 h-20 shrink-0 bg-surface rounded-[var(--radius)] border border-border flex items-center justify-center p-2">
                    <img src={img.url} alt={img.alt || ""} className="max-h-full object-contain" loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Key info */}
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">{device.brand}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
              {device.name}
            </h1>
            {device.model && <p className="text-sm text-muted mt-1">Model: {device.model}</p>}
            {device.shortDescription && (
              <p className="mt-3 text-muted">{device.shortDescription}</p>
            )}

            {/* Key specs badges */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              {device.displaySize && (
                <div className="p-3 bg-surface rounded-[var(--radius)] border border-border-light">
                  <p className="text-xs text-muted">Display</p>
                  <p className="text-sm font-semibold text-foreground">{device.displaySize}</p>
                </div>
              )}
              {device.chipset && (
                <div className="p-3 bg-surface rounded-[var(--radius)] border border-border-light">
                  <p className="text-xs text-muted">Chipset</p>
                  <p className="text-sm font-semibold text-foreground">{device.chipset}</p>
                </div>
              )}
              {device.ram && (
                <div className="p-3 bg-surface rounded-[var(--radius)] border border-border-light">
                  <p className="text-xs text-muted">RAM</p>
                  <p className="text-sm font-semibold text-foreground">{device.ram}</p>
                </div>
              )}
              {device.batteryCapacity && (
                <div className="p-3 bg-surface rounded-[var(--radius)] border border-border-light">
                  <p className="text-xs text-muted">Battery</p>
                  <p className="text-sm font-semibold text-foreground">{device.batteryCapacity}</p>
                </div>
              )}
              {device.mainCamera && (
                <div className="p-3 bg-surface rounded-[var(--radius)] border border-border-light">
                  <p className="text-xs text-muted">Camera</p>
                  <p className="text-sm font-semibold text-foreground">{device.mainCamera}</p>
                </div>
              )}
              {device.price && (
                <div className="p-3 bg-primary/5 rounded-[var(--radius)] border border-primary/20">
                  <p className="text-xs text-primary">Price</p>
                  <p className="text-sm font-bold text-primary">{device.currency || "$"}{device.price}</p>
                </div>
              )}
            </div>

            {device.officialWebsite && (
              <a href={device.officialWebsite} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                Official Website ↗
              </a>
            )}

            <div className="mt-5">
              <SocialShare url={pageUrl} title={`${device.brand} ${device.name}`} />
            </div>
          </div>
        </div>

        {/* Full description */}
        {device.fullDescription && (
          <div className="mb-10 prose max-w-none" dangerouslySetInnerHTML={{ __html: device.fullDescription }} />
        )}

        {/* Full Specifications */}
        <h2 className="text-xl font-extrabold text-foreground mb-6">Full Specifications</h2>

        <SpecSection title="Display">
          <SpecRow label="Size" value={device.displaySize} />
          <SpecRow label="Type" value={device.displayType} />
          <SpecRow label="Resolution" value={device.displayResolution} />
          <SpecRow label="Refresh Rate" value={device.displayRefreshRate} />
          <SpecRow label="HDR" value={device.displayHDR} />
          <SpecRow label="Protection" value={device.displayProtection} />
        </SpecSection>

        <SpecSection title="Performance">
          <SpecRow label="Chipset" value={device.chipset} />
          <SpecRow label="CPU" value={device.cpu} />
          <SpecRow label="GPU" value={device.gpu} />
          <SpecRow label="RAM" value={device.ram} />
          <SpecRow label="Storage" value={device.storage} />
          <SpecRow label="Variants" value={device.storageVariants} />
          <SpecRow label="Expandable" value={device.expandableStorage} />
        </SpecSection>

        <SpecSection title="Camera">
          <SpecRow label="Rear Camera" value={device.rearCamera} />
          <SpecRow label="Main" value={device.mainCamera} />
          <SpecRow label="Ultra Wide" value={device.ultraWide} />
          <SpecRow label="Telephoto" value={device.telephoto} />
          <SpecRow label="Front Camera" value={device.frontCamera} />
          <SpecRow label="Video" value={device.videoRecording} />
        </SpecSection>

        <SpecSection title="Battery & Charging">
          <SpecRow label="Capacity" value={device.batteryCapacity} />
          <SpecRow label="Charging" value={device.chargingSpeed} />
          <SpecRow label="Wireless" value={device.wirelessCharging} />
          <SpecRow label="Reverse" value={device.reverseCharging} />
        </SpecSection>

        <SpecSection title="Connectivity">
          <SpecRow label="5G" value={device.fiveG} />
          <SpecRow label="4G" value={device.fourG} />
          <SpecRow label="Wi-Fi" value={device.wifi} />
          <SpecRow label="Bluetooth" value={device.bluetooth} />
          <SpecRow label="NFC" value={device.nfc} />
          <SpecRow label="USB" value={device.usb} />
          <SpecRow label="GPS" value={device.gps} />
        </SpecSection>

        <SpecSection title="SIM & Software">
          <SpecRow label="SIM Type" value={device.simType} />
          <SpecRow label="Number of SIMs" value={device.numberOfSims} />
          <SpecRow label="eSIM" value={device.esim} />
          <SpecRow label="OS" value={device.os} />
          <SpecRow label="UI" value={device.ui} />
          <SpecRow label="Version" value={device.osVersion} />
        </SpecSection>

        <SpecSection title="Design">
          <SpecRow label="Dimensions" value={device.dimensions} />
          <SpecRow label="Weight" value={device.weight} />
          <SpecRow label="Build" value={device.buildMaterial} />
          <SpecRow label="Colors" value={device.colors} />
          <SpecRow label="IP Rating" value={device.waterDustResistance} />
        </SpecSection>

        <SpecSection title="Security & Audio">
          <SpecRow label="Fingerprint" value={device.fingerprint} />
          <SpecRow label="Face Unlock" value={device.faceUnlock} />
          <SpecRow label="Speakers" value={device.speakers} />
          <SpecRow label="3.5mm Jack" value={device.headphoneJack} />
          <SpecRow label="Audio" value={device.audioFeatures} />
        </SpecSection>

        <SpecSection title="Other">
          <SpecRow label="Sensors" value={device.sensors} />
          <SpecRow label="AI Features" value={device.aiFeatures} />
          <SpecRow label="Special" value={device.specialFeatures} />
          <SpecRow label="Accessories" value={device.accessories} />
        </SpecSection>
      </Container>
    </section>
  );
}
