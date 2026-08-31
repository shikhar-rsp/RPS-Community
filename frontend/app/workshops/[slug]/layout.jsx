import { bySlug } from '@/lib/community/workshops';

/* SEO / LinkedIn sharing. The vanilla build patched the <head> from JS; here
   it's generateMetadata() on the server, with the banner as the OG image. */
export async function generateMetadata({ params }) {
  const w = bySlug(params.slug);
  if (!w) return { title: 'Workshop — RPS Cohorts' };
  return {
    title: `${w.title} — RPS Cohorts`,
    description: w.summary,
    openGraph: {
      title: `${w.title} — RPS Cohorts`,
      description: w.summary,
      type: 'article',
      images: w.bannerUrl ? [w.bannerUrl] : undefined,
    },
  };
}

export default function WorkshopLayout({ children }) {
  return children;
}
