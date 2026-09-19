import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Briefcase, Clock, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout, PageHero } from "@/components/MarketingLayout";
import { toast } from "sonner";
import { SITE_URL } from "@/lib/site";

const SUPPORT_EMAIL = "support@cryptic.technology";
const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${SUPPORT_EMAIL}&su=[Zeus%20AI]%20Message`;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Zeus AI" },
      {
        name: "description",
        content:
          "Get in touch with the Zeus AI team. Support and business inquiries answered within 24–48 hours.",
      },
      { property: "og:title", content: "Contact — Zeus AI" },
      {
        property: "og:description",
        content:
          "Get in touch with the Zeus AI team. Support and business inquiries answered within 24–48 hours.",
      },
      { property: "og:url", content: `${SITE_URL}/contact` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/contact` }],
  }),
  component: Contact,
});

function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      toast.success("Email copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(`Couldn't copy automatically. Copy ${SUPPORT_EMAIL} manually.`);
    }
  };

  return (
    <MarketingLayout>
      <PageHero
        eyebrow="Contact"
        title="We'd love to hear from you"
        subtitle="Reach out with questions, feedback, or partnership ideas. We respond within 24–48 hours."
      />

      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-5">
        <InfoCard
          icon={<Mail className="size-5" />}
          title="Support"
          value={SUPPORT_EMAIL}
          href={`mailto:${SUPPORT_EMAIL}`}
        />
        <div>
          <InfoCard
            icon={<Briefcase className="size-5" />}
            title="Business"
            value={SUPPORT_EMAIL}
            href={`mailto:${SUPPORT_EMAIL}`}
          />
          <div className="mt-3 flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={copyEmail}>
              {copied ? <Check className="size-4 mr-2" /> : <Copy className="size-4 mr-2" />}
              {copied ? "Copied!" : "Copy email"}
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <a href={GMAIL_COMPOSE_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4 mr-2" /> Compose in Gmail
              </a>
            </Button>
          </div>
        </div>
        <InfoCard icon={<Clock className="size-5" />} title="Response time" value="24–48 hours" />
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-20">
        <p className="text-center text-sm text-muted-foreground mt-6">
          For more information, visit{" "}
          <a
            href="https://cryptic.technology"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            cryptic.technology
          </a>
          . For common questions, check our{" "}
          <a href="/faq" className="text-primary hover:underline">
            FAQ
          </a>{" "}
          first.
        </p>
      </section>
    </MarketingLayout>
  );
}

function InfoCard({
  icon,
  title,
  value,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
}) {
  const Body = (
    <div className="rounded-xl border border-border bg-card/60 p-6 hover:border-primary/50 transition-colors">
      <div className="size-10 rounded-lg bg-gradient-primary grid place-items-center mb-3 shadow-glow text-primary-foreground">
        {icon}
      </div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-1 font-medium break-all">{value}</div>
    </div>
  );
  return href ? <a href={href}>{Body}</a> : Body;
}
