import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Terms = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-6 py-12">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-4xl font-bold tracking-tight text-primary">
              Terms of Use
            </h1>
            
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Acceptance of Terms</h2>
                <p className="mb-4">
                  By accessing and using Preset Pro, you accept and agree to be bound by the terms 
                  and provision of this agreement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">User Content</h2>
                <p className="mb-4">
                  When you submit presets to our platform:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>You retain ownership of your original content</li>
                  <li>You grant us a license to display and distribute your presets</li>
                  <li>You confirm you have the right to share the content</li>
                  <li>Content must not infringe on third-party rights</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Prohibited Uses</h2>
                <p className="mb-4">
                  You may not use our service:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>For any unlawful purpose or to solicit others to unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations or laws</li>
                  <li>To transmit or procure the sending of any advertising or promotional material</li>
                  <li>To impersonate or attempt to impersonate the company or other users</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Disclaimer</h2>
                <p className="mb-4">
                  The information on this website is provided on an "as is" basis. To the fullest 
                  extent permitted by law, this Company excludes all representations, warranties, 
                  conditions and terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Contact Information</h2>
                <p>
                  If you have any questions about these Terms of Use, please contact us at 
                  legal@presetpro.com
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;