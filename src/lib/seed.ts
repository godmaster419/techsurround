import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Technology", slug: "technology", description: "Latest technology news, trends, and innovations shaping the digital world.", order: 1 },
  { name: "Cyber Crime", slug: "cyber-crime", description: "Coverage of cyber crimes, data breaches, hacking incidents, and digital fraud.", order: 2 },
  { name: "Cyber Security", slug: "cyber-security", description: "Cyber security news, threat analysis, vulnerability reports, and protection strategies.", order: 3 },
  { name: "New Mobile Arrivals", slug: "new-mobile-arrivals", description: "Latest smartphones and mobile device launches, specifications, and pricing.", order: 4 },
  { name: "New Tech Arrivals", slug: "new-tech-arrivals", description: "New technology product launches, gadget releases, and hardware announcements.", order: 5 },
  { name: "Trending Apps", slug: "trending-apps", description: "Trending applications, popular app updates, and emerging digital tools.", order: 6 },
  { name: "AI", slug: "ai", description: "Artificial intelligence news, machine learning developments, and AI innovations.", order: 7 },
  { name: "Gadgets", slug: "gadgets", description: "Gadget reviews, tech accessory news, and consumer electronics coverage.", order: 8 },
  { name: "Mobile & Apps", slug: "mobile-apps", description: "Mobile technology, app reviews, smartphone tips, and mobile ecosystem coverage.", order: 9 },
  { name: "Software", slug: "software", description: "Software news, application updates, SaaS platforms, and development tools.", order: 10 },
  { name: "Tools", slug: "tools", description: "Free browser-based technology tools — image resizer, PDF maker, and more.", order: 11 },
];

async function main() {
  console.log("🌱 Seeding database with comprehensive content...\n");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@techsurround.com" },
    update: {},
    create: {
      email: "admin@techsurround.com",
      password: hashedPassword,
      name: "Admin Editor",
      role: "admin",
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Create categories
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, order: cat.order },
      create: cat,
    });
  }
  console.log(`✅ ${CATEGORIES.length} categories created`);

  // Create default author
  const author = await prisma.author.upsert({
    where: { slug: "techsurround" },
    update: {},
    create: {
      name: "TechSurround Editorial",
      slug: "techsurround",
      bio: "Official TechSurround editorial team — delivering verified tech journalism, in-depth hardware analyses, and cyber security research.",
    },
  });
  console.log(`✅ Default author: ${author.name}`);

  // Create site settings
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "TechSurround",
      siteDescription: "Your trusted source for technology news, cyber security, mobile arrivals, trending apps, gadgets, AI, and technology tools.",
      defaultSeoTitle: "TechSurround — Technology, Explained Simply",
      defaultSeoDescription: "Your trusted source for technology news, cyber security, mobile arrivals, trending apps, gadgets, AI, and technology tools. Stay informed with TechSurround.",
      contactEmail: "contact@techsurround.com",
      footerText: "© TechSurround. All rights reserved.",
    },
  });

  // Seed initial Articles
  const techCat = await prisma.category.findUnique({ where: { slug: "technology" } });
  const secCat = await prisma.category.findUnique({ where: { slug: "cyber-security" } });
  const aiCat = await prisma.category.findUnique({ where: { slug: "ai" } });
  const gadCat = await prisma.category.findUnique({ where: { slug: "gadgets" } });

  const samplePosts = [
    {
      title: "Next-Generation Quantum Chips Achieve Milestone in Error Correction",
      slug: "quantum-chips-milestone-error-correction",
      excerpt: "Researchers achieve commercial-grade logical qubits, setting the stage for practical fault-tolerant quantum computing systems.",
      content: "<h2>A Breakthrough in Quantum Scaling</h2><p>Quantum computing has long been hindered by the extreme sensitivity of physical qubits to external thermal noise and environmental interference. In a major breakthrough published today, researchers have demonstrated a 10x reduction in logical error rates using real-time topological error correction codes.</p><h2>How Fault-Tolerant Architecture Works</h2><p>By entangling clusters of physical qubits into single protected logical qubits, the processor actively neutralizes phase-flip and bit-flip errors without collapsing the underlying superposition state.</p><blockquote>This moves quantum computing from speculative physics experiments into predictable systems engineering.</blockquote><h2>What This Means for Cryptography and AI</h2><p>With stable logical qubits, algorithms like Shor's and quantum-accelerated matrix multiplication become viable at scale, creating urgent imperatives for Post-Quantum Cryptography (PQC) transitions across global banking networks.</p>",
      featuredImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80",
      categoryId: techCat?.id,
      authorId: author.id,
      status: "published",
      publishedAt: new Date(),
      isFeatured: true,
      isTrending: true,
      readingTime: 4,
    },
    {
      title: "Zero-Day Vulnerability Discovered in Core Web Infrastructure Protocols",
      slug: "zero-day-vulnerability-core-web-protocols",
      excerpt: "Security teams urge immediate patching as critical remote code execution flaw affects edge routing gateways worldwide.",
      content: "<h2>Critical Vulnerability Advisory</h2><p>A high-severity flaw cataloged as CVE-2026-11894 has been uncovered in standard network telemetry handlers. The bug allows unauthenticated threat actors to execute arbitrary code with root privileges on unpatched border gateways.</p><h2>Mitigation and Immediate Patching Steps</h2><p>Network administrators should audit all edge ingress controllers immediately and apply vendor hotfixes or restrict external control plane interfaces to private VPN segments.</p>",
      featuredImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
      categoryId: secCat?.id,
      authorId: author.id,
      status: "published",
      publishedAt: new Date(Date.now() - 3600000 * 2),
      isFeatured: false,
      isTrending: true,
      readingTime: 3,
    },
    {
      title: "Multimodal AI Models Reach Real-Time Video Understanding Benchmarks",
      slug: "multimodal-ai-realtime-video-understanding",
      excerpt: "New neural architectures process 60 FPS video streams with spatial reasoning, enabling unprecedented autonomous navigation.",
      content: "<h2>Real-Time Video Reasoning</h2><p>Unlike previous generation frame-by-frame classifiers, native video models process spatio-temporal tokens holistically, allowing robots and automated cameras to anticipate trajectories and understand context in real time.</p>",
      featuredImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1200&auto=format&fit=crop&q=80",
      categoryId: aiCat?.id,
      authorId: author.id,
      status: "published",
      publishedAt: new Date(Date.now() - 3600000 * 5),
      isFeatured: false,
      isTrending: false,
      readingTime: 5,
    },
    {
      title: "Wearable Spatial Displays: The New Frontier of Personal Computing",
      slug: "wearable-spatial-displays-personal-computing",
      excerpt: "Micro-OLED optical engines bring 4K resolution per eye into ultra-lightweight frames suitable for all-day productivity.",
      content: "<h2>Display Miniaturization</h2><p>Silicon backplane micro-OLEDs have surpassed 4000 PPI, eliminating the screen-door effect entirely while consuming less than 2 watts of power.</p>",
      featuredImage: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=1200&auto=format&fit=crop&q=80",
      categoryId: gadCat?.id,
      authorId: author.id,
      status: "published",
      publishedAt: new Date(Date.now() - 3600000 * 8),
      isFeatured: false,
      isTrending: false,
      readingTime: 3,
    },
  ];

  for (const post of samplePosts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }
  console.log(`✅ Sample articles created`);

  // Seed sample Mobile Arrivals
  const sampleMobiles = [
    {
      brand: "Samsung",
      name: "Galaxy S25 Ultra",
      model: "SM-S938B",
      slug: "samsung-galaxy-s25-ultra",
      shortDescription: "Titanium build with Snapdragon 8 Elite, 200MP Quad Tele System, and Galaxy AI.",
      price: "1299",
      currency: "$",
      releaseDate: "February 2026",
      launchStatus: "Available",
      primaryImage: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80",
      displaySize: "6.8 inches",
      displayType: "Dynamic LTPO AMOLED 2X, 120Hz",
      displayResolution: "1440 x 3120 pixels",
      displayProtection: "Corning Gorilla Armor",
      chipset: "Qualcomm Snapdragon 8 Elite (3nm)",
      ram: "12GB / 16GB",
      storage: "256GB / 512GB / 1TB",
      mainCamera: "200 MP, f/1.7, OIS",
      ultraWide: "50 MP, 120˚",
      telephoto: "50 MP 5x periscope + 10 MP 3x",
      frontCamera: "12 MP, f/2.2",
      batteryCapacity: "5000 mAh",
      chargingSpeed: "45W wired, 15W wireless",
      waterDustResistance: "IP68 dust/water resistant",
    },
    {
      brand: "Apple",
      name: "iPhone 16 Pro Max",
      model: "A3297",
      slug: "apple-iphone-16-pro-max",
      shortDescription: "Grade 5 titanium design with A18 Pro chip, 48MP Fusion camera, and Camera Control.",
      price: "1199",
      currency: "$",
      releaseDate: "September 2025",
      launchStatus: "Available",
      primaryImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
      displaySize: "6.9 inches",
      displayType: "Super Retina XDR OLED, 120Hz ProMotion",
      displayResolution: "1320 x 2868 pixels",
      displayProtection: "Ceramic Shield (latest gen)",
      chipset: "Apple A18 Pro (3nm)",
      ram: "8GB",
      storage: "256GB / 512GB / 1TB",
      mainCamera: "48 MP Fusion, f/1.78, sensor-shift OIS",
      ultraWide: "48 MP, 120˚",
      telephoto: "12 MP 5x tetraprism optical zoom",
      frontCamera: "12 MP TrueDepth",
      batteryCapacity: "4685 mAh",
      chargingSpeed: "MagSafe wireless 25W",
      waterDustResistance: "IP68 (6m for 30 mins)",
    },
    {
      brand: "Google",
      name: "Pixel 9 Pro",
      model: "GEC77",
      slug: "google-pixel-9-pro",
      shortDescription: "Google Tensor G4 with Gemini Nano on-device AI and pro triple camera system.",
      price: "999",
      currency: "$",
      releaseDate: "August 2025",
      launchStatus: "Available",
      primaryImage: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
      displaySize: "6.3 inches",
      displayType: "Super Actua LTPO OLED, 120Hz",
      displayResolution: "1280 x 2856 pixels",
      chipset: "Google Tensor G4 (4nm)",
      ram: "16GB",
      storage: "128GB / 256GB / 512GB / 1TB",
      mainCamera: "50 MP, f/1.68, OIS",
      ultraWide: "48 MP Quad PD",
      telephoto: "48 MP 5x telephoto with 30x Super Res Zoom",
      batteryCapacity: "4700 mAh",
      waterDustResistance: "IP68",
    },
  ];

  for (const mobile of sampleMobiles) {
    await prisma.mobileArrival.upsert({
      where: { slug: mobile.slug },
      update: {},
      create: mobile,
    });
  }
  console.log(`✅ Sample mobile arrivals created`);

  // Seed sample Trending Apps
  const sampleApps = [
    {
      name: "Arc Browser",
      slug: "arc-browser",
      developer: "The Browser Company",
      category: "Productivity",
      platform: "macOS, Windows, iOS",
      shortDescription: "A next-generation web browser designed for focus, custom spaces, and AI-assisted browsing.",
      officialWebsite: "https://arc.net",
      isTrending: true,
      isFeatured: true,
    },
    {
      name: "Obsidian",
      slug: "obsidian",
      developer: "Dynalist Inc.",
      category: "Productivity",
      platform: "Android, iOS, macOS, Windows, Linux",
      shortDescription: "A private, flexible markdown-based knowledge base and graph-connected note-taking tool.",
      officialWebsite: "https://obsidian.md",
      isTrending: true,
      isFeatured: false,
    },
    {
      name: "Proton Pass",
      slug: "proton-pass",
      developer: "Proton AG",
      category: "Cyber Security",
      platform: "Android, iOS, Web, Desktop",
      shortDescription: "End-to-end encrypted password manager with email alias creation and two-factor authentication.",
      officialWebsite: "https://proton.me/pass",
      isTrending: true,
      isFeatured: false,
    },
  ];

  for (const app of sampleApps) {
    await prisma.trendingApp.upsert({
      where: { slug: app.slug },
      update: {},
      create: app,
    });
  }
  console.log(`✅ Sample trending apps created`);

  console.log("\n🎉 Full content seeding complete!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
