const termsSections = [
  {
    title: "1. About MyDiaree",
    content: [
      "MyDiaree is a childcare communication and daily diary platform designed for childcare centres, Montessori institutions, educators, administrators, and parents. The platform enables secure sharing of children’s activities, learning observations, attendance, meals, sleep records, photos, and communications.",
    ],
  },
  {
    title: "2. Eligibility",
    content: [
      "You must be at least 18 years old, or use the platform under the supervision of a registered childcare organization or legal guardian.",
      "By using the Service, you confirm that the information you provide is accurate and complete.",
    ],
  },
  {
    title: "3. User Accounts",
    content: [
      "To access certain features, users may be required to create an account.",
      "You are responsible for maintaining the confidentiality of your login credentials, all activities occurring under your account, and ensuring authorized access only.",
      "You agree not to share your password with unauthorized users, impersonate another person or organization, or use the Service for unlawful purposes.",
      "We reserve the right to suspend or terminate accounts that violate these Terms.",
    ],
  },
  {
    title: "4. Acceptable Use",
    content: [
      "You agree not to upload harmful, abusive, defamatory, or illegal content; attempt unauthorized access to servers or systems; disrupt platform functionality or security; reverse engineer, copy, or exploit the application; or upload content that infringes intellectual property rights.",
      "Any misuse may result in immediate suspension or legal action.",
    ],
  },
  {
    title: "5. Child Safety & Privacy",
    content: [
      "MyDiaree is intended for authorized childcare communication purposes only.",
      "Users must obtain necessary parental or guardian permissions before uploading child-related content, use child data responsibly and lawfully, and avoid sharing sensitive child information publicly.",
      "We take reasonable steps to protect child and family data in accordance with applicable privacy laws.",
    ],
  },
  {
    title: "6. Content Ownership",
    content: [
      "Users retain ownership of the content they upload, including photos, notes, and communications.",
      "By uploading content, you grant MyDiaree a limited license to store, process, display, and transmit such content solely for operating and improving the Service.",
      "We do not sell user-generated content.",
    ],
  },
  {
    title: "7. Intellectual Property",
    content: [
      "All rights, trademarks, branding, software, designs, logos, and platform content related to MyDiaree remain the property of MyDiaree or its licensors.",
      "You may not reproduce, modify, distribute, resell, or create derivative works without written permission.",
    ],
  },
  {
    title: "8. Availability of Service",
    content: [
      "We strive to provide uninterrupted access but do not guarantee continuous availability, error-free operation, or compatibility with all devices.",
      "Maintenance, updates, outages, or third-party failures may temporarily affect the Service.",
    ],
  },
  {
    title: "9. Third-Party Services",
    content: [
      "The platform may integrate with third-party providers including cloud hosting providers, analytics services, payment processors, and notification systems.",
      "Use of such services may also be governed by their respective terms and privacy policies.",
    ],
  },
  {
    title: "10. Subscription & Payments",
    content: [
      "If paid plans or subscriptions are offered, fees are billed according to the selected plan, payments may be processed through app stores or third-party gateways, and subscriptions may renew automatically unless cancelled.",
      "Refunds are subject to applicable app store or payment provider policies.",
    ],
  },
  {
    title: "11. Termination",
    content: [
      "We may suspend or terminate access if these Terms are violated, illegal or harmful activity is detected, or termination is required by law.",
      "Users may stop using the Service at any time.",
    ],
  },
  {
    title: "12. Disclaimer",
    content: [
      'The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind.',
      "We do not guarantee data accuracy, continuous uptime, or error-free functionality. Users are responsible for verifying important records and communications.",
    ],
  },
  {
    title: "13. Limitation of Liability",
    content: [
      "To the maximum extent permitted by law, MyDiaree shall not be liable for indirect damages, loss of data, business interruption, or unauthorized access caused by user negligence.",
      "Our total liability shall not exceed the amount paid by the user, if any, during the previous 12 months.",
    ],
  },
  {
    title: "14. Privacy Policy",
    content: ["Your use of the Service is also governed by our Privacy Policy."],
  },
  {
    title: "15. Changes to Terms",
    content: [
      "We may update these Terms periodically. Updated versions will be posted within the platform or website.",
      "Continued use after updates constitutes acceptance of the revised Terms.",
    ],
  },
  {
    title: "16. Governing Law",
    content: [
      "These Terms shall be governed by and interpreted in accordance with the laws of Australia, and applicable Indian Information Technology and Data Protection laws where relevant.",
      "Any disputes shall be subject to the jurisdiction of competent courts.",
    ],
  },
  {
    title: "17. Contact Us",
    content: ["For questions or legal concerns, contact MyDiaree Support at info@mydiaree.com."],
  },
];

function LegalSection({ title, content }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
        {content.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export default function TermsConditionsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">MyDiaree</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Effective Date: May 27, 2026
          </p>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            Welcome to MyDiaree. These Terms of Service govern your access to and use of the
            MyDiaree platform, website, and related services. By accessing or using MyDiaree, you
            agree to be bound by these Terms. If you do not agree, please do not use the Service.
          </p>
        </header>

        <div className="space-y-4">
          {termsSections.map((section) => (
            <LegalSection key={section.title} {...section} />
          ))}
        </div>
      </div>
    </main>
  );
}
