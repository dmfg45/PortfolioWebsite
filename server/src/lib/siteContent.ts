export const SITE_CONTENT_KEYS = [
  "heroEyebrow",
  "heroHeading",
  "heroSubheading",
  "aboutHeading",
  "aboutSubheading",
] as const;

export type SiteContentKey = (typeof SITE_CONTENT_KEYS)[number];

export const DEFAULT_SITE_CONTENT: Record<SiteContentKey, string> = {
  heroEyebrow: "Software Engineer & Creator",
  heroHeading: "Hi, I'm André Graça",
  heroSubheading:
    "I design and build modern web applications, and share my work in photography and video along the way.",
  aboutHeading: "What I do",
  aboutSubheading: "A mix of engineering and creative work, always focused on shipping something real.",
};
