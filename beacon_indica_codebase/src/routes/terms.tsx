import { createFileRoute } from "@tanstack/react-router";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Beacon Indica" },
      { name: "description", content: "Terms and Conditions governing use of the Beacon Indica platform." },
    ],
  }),
});

function TermsPage() {
  useScrollAnimation();
  const sections = [
    { num: "1", title: "About Beacon Indica", content: `Beacon Indica is a startup ecosystem and founder enablement platform focused on helping students, early-stage founders, creators, innovators, and startup teams build scalable ventures through programs, mentorship, communities, venture studios, fellowships, partnerships, workshops, startup support initiatives, and ecosystem collaborations.\n\nThe platform may include: Venture Studio Programs, Startup Fellowships, Accelerator Programs, Founder Communities, Startup Resources, Mentorship Sessions, Workshops & Events, Internship Opportunities, Innovation Partnerships, Startup Support Services, Investor Connect Initiatives, and Online & Offline Community Activities.` },
    { num: "2", title: "Eligibility", content: `By using the platform, you confirm that you are at least 18 years of age, or accessing the platform under the supervision of a parent, guardian, institution, or authorized representative. You have the legal authority to enter into binding agreements. All information provided by you is accurate, complete, and up to date. You will use the platform only for lawful purposes.\n\nBeacon Indica reserves the right to deny access, suspend participation, or terminate accounts if false information, misuse, or violations are identified.` },
    { num: "3", title: "Acceptance of Programs & Applications", content: `Submitting an application to any Beacon Indica program, fellowship, internship, event, or initiative does not guarantee selection, funding, onboarding, mentorship, partnership, or participation.\n\nBeacon Indica reserves the sole right to accept or reject applications, modify selection criteria, cancel or pause programs, remove participants, limit seats or access, and change timelines or structures. Selection decisions made by Beacon Indica shall be final and binding.` },
    { num: "4", title: "User Accounts & Responsibilities", content: `Certain features may require account registration or submission of personal details. You agree that your login credentials are confidential, you are responsible for all activities under your account, you will not impersonate another individual or organization, you will not misuse the platform or attempt unauthorized access, and you will not upload malicious software, spam, or harmful material.\n\nBeacon Indica may suspend or terminate accounts involved in suspicious, fraudulent, abusive, unethical, or illegal activities.` },
    { num: "5", title: "Intellectual Property Rights", content: `All platform content including logos, brand assets, visuals, designs, website content, graphics, program structures, documents, videos, resources, community materials, frameworks, proprietary systems, and written content are the intellectual property of Beacon Indica unless otherwise stated.\n\nUsers may not reproduce content commercially, copy or redistribute proprietary material, reverse engineer systems, use branding without permission, or claim ownership over platform assets. Unauthorized use may result in legal action.` },
    { num: "6", title: "Startup Ideas & Confidentiality", content: `Participants may share startup ideas, business concepts, presentations, pitch decks, prototypes, documents, or strategic information during applications, mentorship, events, or collaborations.\n\nWhile Beacon Indica aims to maintain professional standards, the platform does not guarantee absolute confidentiality unless a separate written agreement or NDA is executed. Users are advised to share information responsibly and protect sensitive IP independently.` },
    { num: "7", title: "Payments, Fees & Funding", content: `Certain services, programs, workshops, or initiatives may include fees, deposits, subscriptions, or paid participation models. By making payments, you agree that payments may be non-refundable unless explicitly stated otherwise, processing charges may apply, and pricing may change without prior notice.\n\nIn case of fellowships, grants, incentives, or startup support — funding decisions remain discretionary, funding is not guaranteed, and disbursement may depend on milestones, documentation, compliance, or verification.` },
    { num: "8", title: "Internship & Opportunity Disclaimer", content: `The platform may feature internships, startup opportunities, community roles, collaborations, or ecosystem openings. Beacon Indica does not guarantee placement, employment, PPOs, compensation, investor funding, startup success, revenue generation, business growth, media coverage, or partnerships. Any outcomes depend on multiple external factors beyond platform control.` },
    { num: "9", title: "Community Guidelines", content: `Users participating in communities, groups, workshops, events, or ecosystem activities must maintain professional and respectful conduct.\n\nStrictly prohibited: harassment or abuse, hate speech, discrimination, spam or self-promotion abuse, fraudulent behavior, misleading claims, unauthorized solicitation, sharing illegal or harmful content, violating intellectual property rights, and disruptive conduct during events or sessions.\n\nBeacon Indica reserves the right to remove users, revoke access, or permanently ban individuals violating community standards.` },
    { num: "10", title: "Third-Party Services & Links", content: `The platform may contain links to third-party websites, tools, communities, software, payment providers, startup services, or partner platforms. Beacon Indica does not control or endorse third-party platforms and shall not be responsible for external content, third-party policies, data handling practices, transactions, service quality, damages or losses.` },
    { num: "11", title: "Website Usage Restrictions", content: `Users shall not attempt unauthorized access, scrape or extract platform data, interfere with servers or systems, use bots for malicious purposes, introduce malware or harmful code, exploit vulnerabilities, use the platform for illegal activities, or misrepresent affiliation with Beacon Indica. Any such activity may lead to immediate legal and technical action.` },
    { num: "12", title: "Limitation of Liability", content: `To the fullest extent permitted under applicable law, Beacon Indica and its founders, team members, mentors, partners, affiliates, volunteers, interns, representatives, and associates shall not be liable for startup failures, business losses, funding losses, revenue loss, missed opportunities, data loss, technical interruptions, program cancellations, event disruptions, personal disputes, partnership failures, investment decisions, or career outcomes. All participation and usage of the platform are at the user's own risk.` },
    { num: "13", title: "No Investment or Legal Advice", content: `Content shared through the platform does not constitute investment advice, financial advice, legal advice, tax advice, compliance guarantees, or professional consulting assurances. Users should independently consult qualified professionals before making financial, legal, business, or investment decisions.` },
    { num: "14", title: "Media & Publicity Consent", content: `By participating in programs, events, workshops, fellowships, communities, or activities organized by Beacon Indica, users may grant permission for photography, video recordings, testimonials, social media features, marketing promotions, community highlights, and website showcases. Beacon Indica may use such material for branding, marketing, promotional, educational, or documentation purposes unless explicitly requested otherwise in writing.` },
    { num: "15", title: "Privacy & Data Usage", content: `By using the platform, you consent to the collection and processing of information as outlined in the Privacy Policy. This may include name, contact details, academic details, startup information, application data, usage analytics, and community participation records. Beacon Indica aims to handle data responsibly but does not guarantee absolute cybersecurity protection against all external threats.` },
    { num: "16", title: "Termination of Access", content: `Beacon Indica reserves the right to suspend, restrict, or terminate access to any user without prior notice if Terms are violated, misconduct is identified, fraudulent activity occurs, legal risks arise, or platform misuse is detected. Termination may also include removal from communities, events, fellowships, programs, or future opportunities.` },
    { num: "17", title: "Changes to Terms", content: `Beacon Indica may update or revise these Terms at any time without prior notice. Continued use of the platform after updates constitutes acceptance of revised Terms. Users are encouraged to review the Terms periodically.` },
    { num: "18", title: "Governing Law & Jurisdiction", content: `These Terms shall be governed by and interpreted in accordance with the laws of India. Any disputes arising out of or relating to these Terms shall fall under the jurisdiction of the competent courts located in India.` },
    { num: "19", title: "Indemnification", content: `You agree to indemnify and hold harmless Beacon Indica, its founders, affiliates, mentors, employees, volunteers, interns, and partners against any claims, damages, liabilities, legal proceedings, or expenses arising from your misuse of the platform, violation of these Terms, intellectual property infringement, fraudulent conduct, or violation of applicable laws.` },
    { num: "20", title: "Force Majeure", content: `Beacon Indica shall not be held responsible for delays, interruptions, or failures caused by circumstances beyond reasonable control, including natural disasters, internet outages, government restrictions, pandemics, technical failures, cyber incidents, civil disturbances, or power failures.` },
    { num: "21", title: "Contact Information", content: `For questions, concerns, legal notices, partnerships, or support requests related to these Terms & Conditions, contact the official Beacon Indica team through the communication channels listed on the website at beaconindica.com or email admin@beaconindica.com.` },
    { num: "22", title: "Entire Agreement", content: `These Terms constitute the complete agreement between users and Beacon Indica regarding usage of the platform and supersede any prior discussions or communications. If any provision of these Terms is found unenforceable, the remaining provisions shall continue in full force and effect.` },
    { num: "23", title: "Acceptance", content: `By continuing to use the Beacon Indica platform, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.` },
  ];

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-[860px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div data-animate="fade-up">
          <p className="font-mono-label text-accent text-xs tracking-widest uppercase mb-3">Legal</p>
          <h1 className="text-[36px] md:text-[52px] font-extrabold tracking-tight mb-3">Terms & Conditions</h1>
          <p className="text-on-surface-variant text-sm mb-12">Last Updated: May 2026</p>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-2xl p-6 mb-12" data-animate="fade-up">
          <p className="text-on-surface text-[15px] leading-relaxed">
            Welcome to Beacon Indica. These Terms & Conditions govern your access to and use of the Beacon Indica website, programs, services, applications, events, communities, content, and related offerings. By accessing or using our platform in any manner, you agree to be legally bound by these Terms.
          </p>
        </div>

        <div className="space-y-8" data-animate="stagger">
          {sections.map((s) => (
            <div key={s.num} className="border-b border-outline-variant pb-8">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center mt-0.5">{s.num}</span>
                <div>
                  <h2 className="text-[17px] font-bold text-on-surface mb-3">{s.title}</h2>
                  {s.content.split('\n\n').map((para, i) => (
                    <p key={i} className="text-on-surface-variant text-[14px] leading-relaxed mb-3">{para}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-xs text-on-surface-variant text-center" data-animate="fade-up">© 2026 Beacon Indica. All rights reserved.</p>
      </div>
    </div>
  );
}
