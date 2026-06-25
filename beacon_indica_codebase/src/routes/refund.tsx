import { createFileRoute } from "@tanstack/react-router";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const Route = createFileRoute("/refund")({
  component: RefundPage,
  head: () => ({
    meta: [
      { title: "Refund Policy | Beacon Indica" },
      { name: "description", content: "Refund Policy for the Genesis Program by Beacon Indica." },
    ],
  }),
});

function RefundPage() {
  useScrollAnimation();
  const sections = [
    { num: "1", title: "General Policy", content: `All fees paid towards the Genesis Program are generally non-refundable.\n\nDue to the nature of the program, including limited cohort seats, mentorship allocations, operational commitments, resource planning, and ecosystem access provided upon enrollment, Beacon Indica maintains a strict no-refund policy in most circumstances.\n\nThis applies to: Application Fees, Registration Fees, Program Fees, Cohort Reservation Amounts, Workshop Access Fees, Community Access Payments, Any Installment Payments, and Any Advance or Partial Payments.` },
    { num: "2", title: "Non-Refundable Situations", content: `Refunds shall not be provided in situations including but not limited to: change of mind after enrollment, lack of participation or attendance, failure to complete assignments or milestones, scheduling conflicts from the participant side, academic workload or examinations, startup idea changes, team disputes or founder exits, inability to attend sessions, dissatisfaction arising from personal expectations, failure to secure funding or partnerships, removal due to misconduct or policy violations, or voluntary withdrawal from the program.` },
    { num: "3", title: "Seat Blocking & Cohort Commitment", content: `Enrollment in the Genesis Program reserves a limited seat within a cohort. Once a participant confirms enrollment and payment is received, operational resources and planning are allocated accordingly.\n\nAs a result, payments are treated as commitment-based and are typically non-refundable.` },
    { num: "4", title: "Exceptional Refund Consideration", content: `In rare and exceptional cases, Beacon Indica may review refund requests at its sole discretion. Submission of a refund request does not guarantee approval.\n\nRefund considerations, if any, may apply only in circumstances such as: duplicate payment transactions, incorrect excess payment due to technical error, program cancellation initiated solely by Beacon Indica before commencement, or regulatory/legal restrictions preventing program delivery.\n\nEven in such cases, processing charges may be deducted, partial refunds may apply, decision timelines may vary, and documentation may be requested. All refund decisions made by Beacon Indica shall be final and binding.` },
    { num: "5", title: "No Guarantee Clause", content: `Enrollment fees do not guarantee startup success, funding opportunities, investor introductions, incubation selection, business growth, revenue generation, job offers or PPOs, media exposure, or partnerships or collaborations.\n\nThe Genesis Program is designed as a learning, execution, and ecosystem support initiative. Outcomes depend on individual effort, market conditions, execution capability, and external factors beyond Beacon Indica's control.` },
    { num: "6", title: "Program Changes", content: `Beacon Indica reserves the right to modify program structure, change mentors or speakers, reschedule sessions, update curriculum, shift session formats between online/offline/hybrid, and alter timelines or deliverables.\n\nSuch changes shall not constitute grounds for refund claims.` },
    { num: "7", title: "Installment Payments", content: `Where installment-based payment options are provided, participants remain responsible for completing pending dues. Previously paid installments remain non-refundable. Missing payments may result in suspension or removal from the program.` },
    { num: "8", title: "Transfer Policy", content: `Program enrollments are generally non-transferable unless explicitly approved by Beacon Indica in writing. Transfers, if approved, may involve administrative charges or eligibility review.` },
    { num: "9", title: "Chargebacks & Payment Disputes", content: `Initiating unauthorized chargebacks, payment disputes, or fraudulent refund claims may result in immediate termination from the program, restriction from future programs, and legal or recovery proceedings where applicable.\n\nParticipants are encouraged to contact the Beacon Indica team directly before raising disputes through banks or payment gateways.` },
    { num: "10", title: "Contact for Refund Requests", content: `For genuine payment-related concerns or exceptional refund requests, contact Beacon Indica through the official communication channels on the website at beaconindica.com.\n\nRefund review requests should include: Full Name, Registered Email ID, Transaction Details, Payment Proof, and Reason for Request.` },
    { num: "11", title: "Acceptance of Policy", content: `By making payment for the Genesis Program, you confirm that you have read this Refund Policy, understood the non-refundable nature of the program, and agreed to all terms stated herein.` },
  ];

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-[860px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <div data-animate="fade-up">
          <p className="font-mono-label text-accent text-xs tracking-widest uppercase mb-3">Legal</p>
          <h1 className="text-[36px] md:text-[52px] font-extrabold tracking-tight mb-3">Refund Policy</h1>
          <p className="text-on-surface-variant text-sm mb-4">Last Updated: May 2026</p>
          <p className="text-on-surface-variant text-sm mb-12">Applicable to: Genesis Program</p>
        </div>

        <div className="bg-accent/8 border border-accent/20 rounded-2xl p-6 mb-12" data-animate="fade-up">
          <p className="text-on-surface text-[15px] leading-relaxed font-medium">
            ⚠️ All fees paid towards the Genesis Program are generally non-refundable. Please read this policy carefully before making any payment.
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
