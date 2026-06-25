import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Linkedin, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { AnimateIn } from "@/components/ui/AnimateIn";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact | Beacon Indica" },
      {
        name: "description",
        content:
          "Get in touch with Beacon Indica for partnerships, programs, or to join the team.",
      },
    ],
  }),
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{name?: string; email?: string; message?: string}>({});
  const subjects = [
    { label: "College / University Partnership", email: "partnerships@beaconindica.com" },
    { label: "Careers", email: "careers@beaconindica.com" },
    { label: "Genesis Programme", email: "enquiry@beaconindica.com" },
    { label: "Fellowship Programme", email: "enquiry@beaconindica.com" },
    { label: "Corporate Partnerships", email: "partnerships@beaconindica.com" },
  ];

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "College / University Partnership",
    message: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {name?: string; email?: string; message?: string} = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.includes('@')) newErrors.email = 'Valid email required';
    if (!form.message.trim()) newErrors.message = 'Message is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    const toEmail = subjects.find(s => s.label === form.subject)?.email || 'partnerships@beaconindica.com';
    try {
      await fetch('https://formspree.io/f/mjgzzzov', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          _replyto: form.email,
          _subject: `[Beacon Indica] ${form.subject} | from ${form.name}`,
          to: toEmail,
        }),
      });
    } catch {}
    setSubmitted(true);
  };

  const input =
    "w-full border border-outline-variant rounded-md px-4 py-3 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent";

  const details = [
    { icon: Mail, label: "partnerships@beaconindica.com", sub: "College & corporate partnerships" },
    { icon: Mail, label: "careers@beaconindica.com", sub: "Internships & team opportunities" },
    { icon: Mail, label: "enquiry@beaconindica.com", sub: "Genesis & Fellowship programme queries" },
  ];

  return (
    <section className="bg-surface py-20 md:py-28 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-16 items-start">
        <AnimateIn direction="right" duration={0.65}>
          <span className="font-mono-label text-accent">Get In Touch</span>
          <h1 className="text-[36px] md:text-[56px] font-extrabold tracking-[-0.03em] mt-4">
            Let's Talk
          </h1>
          <p className="text-lg text-on-surface-variant mt-6">
            Whether you are a college looking to partner, a student with a
            startup idea, or someone who wants to be part of what we are
            building, we want to hear from you.
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
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/beacon-indica/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Beacon Indica on LinkedIn"
                className="w-10 h-10 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-accent hover:border-accent transition"
              >
                <Linkedin className="w-4 h-4" />
              </a>

              {/* WhatsApp Community */}
              <a
                href="https://chat.whatsapp.com/DMRdGf9Hify256Jm57a6g8"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join Beacon Indica WhatsApp Community"
                className="w-10 h-10 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-accent hover:border-accent transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.552 4.116 1.523 5.845L0 24l6.337-1.497A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.804 9.804 0 01-5.031-1.384l-.361-.214-3.741.883.936-3.618-.235-.372A9.808 9.808 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.421 0 9.818 4.398 9.818 9.818 0 5.421-4.397 9.818-9.818 9.818z"/>
                </svg>
              </a>
            </div>
          </div>
        </AnimateIn>

        <AnimateIn direction="left" className="bg-surface-container-low rounded-xl p-8" duration={0.65}>
          {submitted ? (
            <div className="bg-accent-tint border border-accent rounded-lg p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-accent mx-auto mb-3" />
              <p className="font-semibold">Message received, we'll respond soon.</p>
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
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                <input
                  type="email"
                  className={input}
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                <select
                  aria-label="Subject"
                  className={input}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                >
                  {subjects.map((s) => (
                    <option key={s.label} value={s.label}>{s.label}</option>
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
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ willChange: "transform" }}
                  type="submit"
                  className="w-full bg-accent text-accent-foreground font-bold py-3.5 rounded-md cta-shadow cursor-pointer"
                >
                  Send Message
                </motion.button>
              </form>
            </>
          )}
        </AnimateIn>
      </div>
    </section>
  );
}