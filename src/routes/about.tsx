import { createFileRoute } from "@tanstack/react-router";
import collectionImg from "@/assets/collection-concrete.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Virtue" },
      { name: "description", content: "Modern staples engineered for the contemporary wardrobe." },
      { property: "og:title", content: "About — Virtue" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="px-6 md:px-10 max-w-4xl mx-auto">
        <span className="eyebrow text-muted-foreground">About</span>
        <h1 className="font-display text-6xl md:text-7xl uppercase tracking-tighter mt-4 mb-10">
          A New Wardrobe<br />Standard
        </h1>
        <div className="space-y-6 text-base leading-relaxed text-foreground/80 max-w-2xl">
          <p>
            Virtue was founded on a simple premise: modern wardrobes deserve modern
            staples. We design garments that prioritize fit, fabric, and longevity over
            seasonal noise.
          </p>
          <p>
            Each piece is engineered with technical fabrics, considered proportions, and
            architectural silhouettes. Made for the contemporary urban landscape.
          </p>
        </div>
      </div>
      <img
        src={collectionImg}
        alt="Two models in an urban plaza"
        loading="lazy"
        className="w-full aspect-[16/9] object-cover mt-16"
      />
    </div>
  );
}
