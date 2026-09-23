import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import MembershipCardPreview from "@/components/MembershipCardPreview";

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-semibold tracking-tight">
          Gym Pass
        </span>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary">
            Get started
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-[1.08] md:text-5xl">
            Turn your gym membership into a digital card.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">
            Give every member a secure digital membership card they can keep
            and share from their phone. Your staff scan a QR code and see who
            they are and whether their membership is valid — instantly.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="btn-primary px-6 py-3 text-base">
              Get started
            </Link>
            <a href="#how-it-works" className="btn-ghost px-6 py-3 text-base">
              See how it works
            </a>
          </div>
          <p className="mt-6 text-sm text-muted">
            No attendance tracking. No check-ins. Just a card, a scan, and a
            clear answer.
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-sm">
          <MembershipCardPreview
            gymName="Powerfit Gym"
            memberName="Rahul Kumar"
            memberCode="PF-0142"
            plan="3 Month Membership"
            startDate="21 Sep 2026"
            expiryDate="21 Dec 2026"
            status="ACTIVE"
            primaryColor="#D8A945"
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-t border-paper/10 bg-surface/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl font-semibold">How it works</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              {
                n: "1",
                title: "You create the card",
                body: "Add a member and set up their membership. Gym Pass generates a digital card with a secure QR code, tied to that member for as long as they're with you.",
              },
              {
                n: "2",
                title: "They keep it on their phone",
                body: "Members open their card from a link, save it to their home screen, and share it however they like — no app to download.",
              },
              {
                n: "3",
                title: "Your staff scan it",
                body: "Point the scanner at the QR code and the member's name, plan, and current status appear immediately. Nothing to look up.",
              },
            ].map((s) => (
              <div key={s.n}>
                <div className="font-display text-2xl text-gold">{s.n}</div>
                <h3 className="mt-3 text-lg font-medium">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl font-semibold">
          Everything a membership desk actually needs
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "One card, always current",
              body: "When a member renews, their existing card updates automatically. They never get a new QR code or a new link.",
            },
            {
              title: "Full renewal history",
              body: "Every plan, payment, and date is kept on the member's record, so you can see exactly how their membership has evolved.",
            },
            {
              title: "Verification, not surveillance",
              body: "Scanning a card confirms who someone is and whether they're current. It doesn't log a visit or build an attendance record.",
            },
            {
              title: "Your gym, your look",
              body: "Add your logo and brand colors once — every member card and the scan screen carries them automatically.",
            },
            {
              title: "Staff accounts with limits",
              body: "Give front-desk staff a login that can scan and search, without handing them billing or account settings.",
            },
            {
              title: "Built for many gyms",
              body: "Each gym's members, staff, and settings are fully separate — one gym can never see another's data.",
            },
          ].map((f) => (
            <div key={f.title} className="panel p-6">
              <h3 className="text-base font-medium">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VERIFICATION DEMO */}
      <section className="border-t border-paper/10 bg-surface/40">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold">
              A scan answers one question, clearly.
            </h2>
            <p className="mt-4 max-w-md text-muted">
              Every scan lands on one of four unmistakable states, so your
              front desk never has to guess or dig through a spreadsheet.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-active" />
                Membership active
              </li>
              <li className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-expiring" />
                Expiring soon
              </li>
              <li className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-expired" />
                Membership expired
              </li>
              <li className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-inactive" />
                Card no longer valid
              </li>
            </ul>
          </div>
          <div className="panel p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-active/15 text-active flex items-center justify-center text-xl">
              ✓
            </div>
            <p className="mt-4 font-display text-xl">Membership active</p>
            <p className="mt-1 text-sm text-muted">Rahul Kumar · PF-0142</p>
            <p className="mt-1 text-xs text-muted">Valid until 21 Dec 2026</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="font-display text-3xl font-semibold md:text-4xl">
          Set your members up with a card in minutes.
        </h2>
        <div className="mt-8">
          <Link href="/signup" className="btn-primary px-8 py-3.5 text-base">
            Get started
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-paper/10">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="font-display text-2xl font-semibold">Questions</h2>
          <div className="mt-8 space-y-6">
            {[
              {
                q: "Does this track attendance or check-ins?",
                a: "No. Gym Pass is only for identifying a member and confirming their membership is valid. It doesn't log visits or count check-ins.",
              },
              {
                q: "What's inside the QR code?",
                a: "A secure, random token — never a phone number, email, or payment detail. Scanning it looks up the member's current record on your server.",
              },
              {
                q: "Can members lose their card?",
                a: "The card lives at a link, not a physical object, so it can't be misplaced. They can reopen it, re-share it, or add it to their home screen at any time.",
              },
              {
                q: "Can I run more than one gym on this?",
                a: "Yes. Each gym you create is its own separate workspace — members, staff, and branding never cross over.",
              },
            ].map((f) => (
              <div key={f.q}>
                <p className="font-medium">{f.q}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-paper/10 px-6 py-10 text-center text-sm text-muted">
        Gym Pass
      </footer>
    </main>
  );
}
