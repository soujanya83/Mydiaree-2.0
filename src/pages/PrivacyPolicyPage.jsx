const privacySections = [
  {
    title: "1. Overview",
    content: [
      "MyDiaree is a childcare communication and daily diary platform for childcare centres, Montessori institutions, educators, administrators, and parents.",
      "This Privacy Policy explains how we collect, use, store, and protect personal information and child-related information when you use MyDiaree.",
    ],
  },
  {
    title: "2. Information We Collect",
    content: [
      "We may collect account information such as names, email addresses, phone numbers, roles, centre details, and login details.",
      "We may collect childcare records such as attendance, daily diary entries, meals, sleep records, observations, learning notes, photos, videos, incident records, and communications.",
      "We may collect technical information such as device details, usage activity, IP address, browser information, and system logs to support security and platform performance.",
    ],
  },
  {
    title: "3. Child Information",
    content: [
      "Child-related information is collected and used only for authorized childcare, learning documentation, family communication, compliance, and operational purposes.",
      "Childcare centres and authorized users are responsible for ensuring they have the required parental or guardian permissions before uploading or sharing child-related content.",
    ],
  },
  {
    title: "4. How We Use Information",
    content: [
      "We use information to provide and operate MyDiaree, manage user accounts, support childcare documentation, enable communication between centres and families, maintain security, improve the Service, and comply with legal obligations.",
      "We do not sell personal information or user-generated child content.",
    ],
  },
  {
    title: "5. Sharing of Information",
    content: [
      "Information may be shared with authorized users within a childcare centre, parents or guardians linked to a child, service providers who help operate the platform, or authorities where required by law.",
      "Service providers may include hosting, analytics, payment, notification, support, and security providers. They are expected to handle information only for the services they provide to MyDiaree.",
    ],
  },
  {
    title: "6. Data Security",
    content: [
      "We take reasonable technical and organizational steps to protect personal information and child-related information from unauthorized access, misuse, loss, alteration, or disclosure.",
      "No digital service can guarantee absolute security. Users must keep login credentials confidential and ensure access is limited to authorized people only.",
    ],
  },
  {
    title: "7. Data Retention",
    content: [
      "We retain information for as long as needed to provide the Service, meet childcare operational needs, comply with legal obligations, resolve disputes, and enforce agreements.",
      "Where information is no longer required, we may delete, archive, or de-identify it in accordance with applicable requirements.",
    ],
  },
  {
    title: "8. User Responsibilities",
    content: [
      "Users must only upload accurate, lawful, and authorized information. Users must not share sensitive child or family information publicly or with unauthorized people.",
      "Childcare organizations are responsible for managing staff access, parent or guardian permissions, and appropriate use of information within their centre.",
    ],
  },
  {
    title: "9. Access, Correction, and Deletion",
    content: [
      "Users may request access to, correction of, or deletion of their personal information where permitted by law and platform requirements.",
      "Some records may need to be retained where required for childcare, compliance, legal, safety, or audit purposes.",
    ],
  },
  {
    title: "10. International and Legal Compliance",
    content: [
      "MyDiaree may process information in accordance with Australian privacy requirements and applicable Indian Information Technology and Data Protection laws where relevant.",
      "Where data is processed by service providers, appropriate safeguards are used where reasonably available.",
    ],
  },
  {
    title: "11. Changes to This Policy",
    content: [
      "We may update this Privacy Policy periodically. Updated versions will be posted within the platform or website.",
      "Continued use of MyDiaree after updates means you acknowledge the revised Privacy Policy.",
    ],
  },
  {
    title: "12. Contact Us",
    content: ["For privacy questions or requests, contact MyDiaree Support at info@mydiaree.com."],
  },
];

function PrivacySection({ title, content }) {
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

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">MyDiaree</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Effective Date: May 27, 2026
          </p>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            We respect the privacy of children, families, educators, and childcare organizations.
            This policy describes how MyDiaree handles information used to provide secure childcare
            communication, daily diary, observation, attendance, media, and related services.
          </p>
        </header>

        <div className="space-y-4">
          {privacySections.map((section) => (
            <PrivacySection key={section.title} {...section} />
          ))}
        </div>
      </div>
    </main>
  );
}
