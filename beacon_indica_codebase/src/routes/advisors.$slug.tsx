import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { advisors } from "@/data/advisors";

export const Route = createFileRoute("/advisors/$slug")({
  component: AdvisorProfilePage,
  head: ({ params }) => {
    const advisor = advisors.find((a) => a.slug === params.slug);
    return {
      meta: [
        { title: advisor ? `${advisor.name} | Advisory Board | Beacon Indica` : "Advisor | Beacon Indica" },
        { name: "description", content: advisor?.shortBio ?? "" },
      ],
    };
  },
  loader: ({ params }) => {
    const advisor = advisors.find((a) => a.slug === params.slug);
    if (!advisor) throw notFound();
    return advisor;
  },
});

function AdvisorProfilePage() {
  useScrollAnimation();
  const advisor = Route.useLoaderData();

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-surface-container-low border-b border-outline-variant">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-3 flex items-center gap-2 text-sm text-on-surface-variant">
          <Link to="/about" className="hover:text-accent transition-colors">About</Link>
          <span>/</span>
          <span className="font-mono-label text-[11px]">Board of Advisors</span>
          <span>/</span>
          <span className="text-primary font-medium">{advisor.name}</span>
        </div>
      </div>

      {/* Main Profile Section */}
      <section className="bg-surface py-20 md:py-28 overflow-hidden">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-12 md:gap-16 items-start">

            {/* LEFT — Photo + Name + Title */}
            <div data-animate="slide-left" className="flex flex-col items-center md:items-start">
              
              {/* Photo */}
              <div className="w-full max-w-[320px] rounded-2xl overflow-hidden border border-outline-variant shadow-sm bg-surface-container flex items-center justify-center relative shrink-0">
                {advisor.photo ? (
                  <img
                    src={advisor.photo}
                    alt={advisor.name}
                    className="w-full aspect-[3/4] object-cover object-top"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-surface-container flex items-center justify-center">
                    <span className="text-6xl font-bold text-accent/30">
                      {advisor.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Name + Title under photo */}
              <div className="mt-6 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-primary">
                  {advisor.name}
                </h1>
                <p className="font-mono-label text-accent mt-1">{advisor.title}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-5 justify-center md:justify-start">
                {advisor.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono-label bg-accent/8 text-accent px-3 py-1.5 rounded-full border border-accent/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Back link */}
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 mt-8 text-sm text-on-surface-variant hover:text-accent transition-colors"
              >
                ← Back to Advisory Board
              </Link>
            </div>

            {/* RIGHT — Full Biography */}
            <div data-animate="slide-right">
              
              {/* Section label */}
              <span className="font-mono-label text-on-surface-variant/60">
                ▲ BOARD OF ADVISORS PROFILE
              </span>

              {/* Bio heading */}
              <h2 className="text-[28px] md:text-[36px] font-bold tracking-tight mt-3 mb-8">
                Detailed Biography
              </h2>

              {/* Bio paragraphs */}
              <div className="space-y-6">
                {advisor.fullBio.map((paragraph: string, i: number) => (
                  <p key={i} className="text-[16px] md:text-[17px] leading-relaxed text-on-surface-variant">
                    {paragraph}
                  </p>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="bg-surface-container-low border-t border-outline-variant py-16 overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span data-animate="fade-up" className="font-mono-label text-accent">
            — BEACON INDICA —
          </span>
          <h3 data-animate="fade-up" className="text-2xl font-bold mt-3 tracking-tight">
            Want to learn from advisors like {advisor.name.split(" ")[0]}?
          </h3>
          <p data-animate="fade-up" className="text-on-surface-variant mt-3">
            Apply to a Beacon Indica program and get direct access to our advisory network.
          </p>
          <div data-animate="fade-up" className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/programs"
              className="bg-accent text-accent-foreground font-bold px-7 py-3 rounded-md cta-shadow"
            >
              View Programs
            </Link>
            <Link
              to="/about"
              className="border border-outline-variant text-on-surface font-medium px-7 py-3 rounded-md hover:border-accent transition-colors"
            >
              ← Back to About
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
