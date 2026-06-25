export type Advisor = {
  slug: string;
  name: string;
  title: string;
  photo: string;          // path under /public, e.g. "/Aurbind-Corporate.png"
  shortBio: string;       // 2–3 sentences — shown on the About page card
  fullBio: string[];      // array of paragraphs — shown on the full profile page
  tags: string[];
};

export const advisors: Advisor[] = [
  {
    slug: "aurbind-sharma",
    name: "Aurbind Sharma",
    title: "Serial Entrepreneur & Investor",
    photo: "/Aurbind-Corporate.png",
    shortBio:
      "Founded SEND App — 10-minute grocery delivery in Australia, raising ~$23M when Blinkit and Zepto were single-city operations. Also founded VAttendance, India's first mobile-based attendance system. Currently building Rentfree and Freehold for the Australian Proptech market.",
    fullBio: [
      "Aurbind Sharma is a highly accomplished serial entrepreneur and early-stage investor with a proven track record of building and scaling high-growth technology companies across multiple continents.",
      "He founded SEND App, an innovative 10-minute grocery delivery startup in Australia, raising approximately $23 million at a time when delivery platforms like Blinkit and Zepto were still operating in single cities within India. This venture proved his exceptional capabilities in fundraising, logistics, high-velocity hiring, and operational scaling in complex environments.",
      "Prior to SEND, Aurbind founded VAttendance, India's first mobile-based attendance platform, breaking new ground in cloud enterprise productivity. Currently, he is actively building Rentfree and Freehold to disrupt the Australian Proptech market, leveraging technology to democratize property transactions and leasing.",
      "As an advisory board member, Aurbind brings invaluable, direct pattern recognition to young founders navigating product-market fit, international expansion, high-scale engineering operations, and institutional fundraising rounds.",
    ],
    tags: ["Proptech", "Consumer Apps", "Fundraising", "Australia"],
  },
  {
    slug: "amit-kumar-pandey",
    name: "Amit Kumar Pandey",
    title: "CTO, Jellyfish Technologies",
    photo: "https://i.ibb.co/5W8cPmqX/oo.jpg",
    shortBio:
      "Technology leader and engineering executive with deep expertise in building and scaling product teams. Brings hands-on CTO experience across enterprise and growth-stage companies.",
    fullBio: [
      "Amit Kumar Pandey is a seasoned technology executive and engineering leader currently serving as CTO at Jellyfish Technologies, where he leads product and engineering across the company's global client portfolio.",
      "With deep expertise in software architecture, team scaling, and product strategy, Amit has worked with both enterprise clients and growth-stage startups — giving him rare insight into the structural and technical challenges founders face as they scale.",
      "As an advisor to Beacon Indica, Amit brings direct mentorship to student founders on building engineering teams, choosing the right tech stack, and architecting systems that can scale from prototype to production without being rebuilt from scratch.",
    ],
    tags: ["Engineering", "Product", "Tech Leadership", "Enterprise"],
  },
];
