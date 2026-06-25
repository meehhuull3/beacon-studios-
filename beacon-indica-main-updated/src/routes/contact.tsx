import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, CheckCircle2, Linkedin, Instagram, Twitter } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact | Beacon Indica" },
      {
        name: "description",
        content:
          "Get in touch with Beacon Indica — for partnerships, programs, or to join the team.",
      },
    ],
  }),
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "College Partnership",
    message: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email.includes('@') || !form.message) return;
    try {
      await fetch('https://formspree.io/f/mbdbaqjp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          _replyto: form.email,
        }),
      });
    } catch {}
    setSubmitted(true);
  };

  const input =
    "w-full border border-outline-variant rounded-md px-4 py-3 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent";

  const details = [
    { icon: Mail, label: "careers@beaconindica.com", sub: "For internships and team" },
    { icon: Mail, label: "admin@beaconindica.com", sub: "For partnerships and colleges" },
    { icon: MapPin, label: "New Delhi, India", sub: "Office" },
  ];

  return (
    <section className="bg-surface py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-16 items-start">
        <div>
          <span className="font-mono-label text-accent">Get In Touch</span>
          <h1 className="text-[36px] md:text-[56px] font-extrabold tracking-[-0.03em] mt-4">
            Let's Talk
          </h1>
          <p className="text-lg text-on-surface-variant mt-6">
            Whether you are a college looking to partner, a student with a
            startup idea, or someone who wants to be part of what we are
            building — we want to hear from you.
          </p>
          <div className="mt-10 space-y-6">
            {details.map((d) => (
              <div key={d.label} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0">
                  <d.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-semibold">{d.label}</div>
                  <div className="text-sm text-on-surface-variant">{d.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <div className="font-mono-label text-on-surface-variant mb-3">Follow us</div>
            <div className="flex gap-3">
              {[
                { Icon: Linkedin, label: "LinkedIn" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Twitter, label: "Twitter" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={`Beacon Indica on ${label}`}
                  className="w-10 h-10 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-accent hover:border-accent transition"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-8">
          {submitted ? (
            <div className="bg-accent-tint border border-accent rounded-lg p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-accent mx-auto mb-3" />
              <p className="font-semibold">Message received — we'll respond soon.</p>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold">Send a Message</h3>
              <form onSubmit={onSubmit} className="space-y-5 mt-6">
                <input
                  className={input}
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  className={input}
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <select
                  className={input}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                >
                  {[
                    "College Partnership",
                    "Genesis Program",
                    "Fellowship",
                    "Internship",
                    "General",
                  ].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <textarea
                  className={input}
                  rows={5}
                  placeholder="Your message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground font-bold py-3.5 rounded-md cta-shadow"
                >
                  Send Message
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}