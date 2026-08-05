    import type { Metadata } from 'next'
    import { SiteFooter } from '@/components/site-footer'

    export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'How Salami collects, uses, and protects your personal data.',
    }

    export default function PrivacyPage() {
    return (
        <main className="min-h-screen text-brand-bone">
        <section className="mx-auto max-w-3xl px-6 pt-28 pb-20 md:px-16 md:pt-36 lg:px-24">
            <h1 className="font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">
            Privacy Policy
            </h1>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-brand-bone/50">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-brand-bone/80">
            <p>
                Salami (&ldquo;SM,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy
                and is committed to protecting your personal data in accordance with the
                Nigeria Data Protection Act, 2023 (NDPA). This policy explains what information
                we collect, why we collect it, and the choices you have.
            </p>

            <div>
                <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-brand-bone">
                Information We Collect
                </h2>
                <ul className="mt-3 flex flex-col gap-2 pl-5 list-disc marker:text-brand-red">
                <li><strong className="text-brand-bone">Account information</strong> — name, email address, and password when you create an account.</li>
                <li><strong className="text-brand-bone">Order information</strong> — shipping address, phone number, and items purchased.</li>
                <li><strong className="text-brand-bone">Payment information</strong> — we do not collect or store your card, bank, or payment details ourselves. Payments are processed directly by Paystack, our third-party payment processor; Paystack collects and handles that information under its own privacy policy.</li>
                <li><strong className="text-brand-bone">Usage data</strong> — pages visited, device/browser type, and general location, collected via cookies and similar technologies.</li>
                </ul>
            </div>

            <div>
                <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-brand-bone">
                How We Use Your Information
                </h2>
                <ul className="mt-3 flex flex-col gap-2 pl-5 list-disc marker:text-brand-red">
                <li>To process and fulfil your orders, including shipping and returns.</li>
                <li>To create and manage your account, including your wishlist and order history.</li>
                <li>To communicate with you about orders, promotions, and updates (you can opt out of marketing at any time).</li>
                <li>To improve our website, products, and customer experience.</li>
                <li>To detect and prevent fraud, and to comply with legal obligations.</li>
                </ul>
                <p className="mt-3">
                We only collect the data needed for these purposes and do not use it for
                unrelated reasons without telling you first.
                </p>
            </div>

            <div>
                <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-brand-bone">
                Payments — Paystack
                </h2>
                <p>
                All payments on our website are processed by Paystack, a licensed payment
                service provider. When you check out, you are directed to Paystack&rsquo;s
                secure payment flow, and your card or bank details are entered directly with
                Paystack — they never pass through or get stored on our servers. Paystack
                acts as an independent data controller for the payment information it
                collects, and processes it under its own privacy policy, available at{' '}
                
                    <a
                    href="https://paystack.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-red underline underline-offset-2 hover:text-brand-bone"
                >
                    paystack.com/privacy
                </a>
                . We only receive confirmation of payment status and a transaction reference
                from Paystack — not your full payment details.
                </p>
            </div>

            <div>
                <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-brand-bone">
                Sharing Your Information
                </h2>
                <p>
                We do not sell your personal data. We share information only with trusted
                third parties who help us operate our business — including Paystack (payment
                processing), our shipping/logistics partners, and our hosting and database
                providers — and only to the extent necessary for them to perform their
                services. We may also disclose information where required by law or a valid
                request from the Nigeria Data Protection Commission (NDPC) or other
                regulatory authority.
                </p>
            </div>

            <div>
                <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-brand-bone">
                Cookies
                </h2>
                <p>
                We use cookies and similar technologies to keep you signed in, remember your
                cart, and understand how our site is used. You can control cookies through
                your browser settings, though disabling them may affect site functionality.
                </p>
            </div>

            <div>
                <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-brand-bone">
                Data Retention
                </h2>
                <p>
                We retain your personal data for as long as your account is active or as
                needed to fulfil the purposes described in this policy — including order
                history, tax, and accounting requirements — and for as long as necessary to
                comply with our legal obligations, resolve disputes, and enforce our
                agreements. When data is no longer needed for these purposes, we take steps
                to delete or anonymise it.
                </p>
            </div>

            <div>
                <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-brand-bone">
                Your Rights
                </h2>
                <p>Under the NDPA, you have the right to:</p>
                <ul className="mt-3 flex flex-col gap-2 pl-5 list-disc marker:text-brand-red">
                <li>Request access to the personal data we hold about you.</li>
                <li>Request correction of inaccurate or incomplete data.</li>
                <li>Request deletion of your data, subject to our legal and contractual retention obligations.</li>
                <li>Withdraw consent to marketing communications at any time.</li>
                <li>Object to certain processing of your data, including automated decision-making that significantly affects you.</li>
                <li>Lodge a complaint with the Nigeria Data Protection Commission (NDPC) if you believe your data has been mishandled.</li>
                </ul>
                <p className="mt-3">
                To exercise any of these rights, contact us using the details below.
                </p>
            </div>

            <div>
                <h2 className="font-heading text-lg font-bold uppercase tracking-tight text-brand-bone">
                Contact Us
                </h2>
                <p>
                If you have questions about this policy, how we handle your data, or wish to
                exercise your rights under the NDPA, reach us via our{' '}
                <a href="/contact" className="text-brand-red underline underline-offset-2 hover:text-brand-bone">
                    contact page
                </a>.
                </p>
            </div>
            </div>
        </section>

        <SiteFooter />
        </main>
    )
    }
// this is app\privacy\page.tsx