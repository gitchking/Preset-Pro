import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-6 py-12">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-4xl font-bold tracking-tight text-primary">
              Privacy Policy
            </h1>
            
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Information We Collect</h2>
                <p className="mb-4">
                  We collect information you provide directly to us, such as when you create an account, 
                  submit presets, or contact us for support.
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Account information (username, email address)</li>
                  <li>Preset submissions (name, description, files)</li>
                  <li>Usage data and analytics</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">How We Use Your Information</h2>
                <p className="mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Provide and maintain our services</li>
                  <li>Process and display your preset submissions</li>
                  <li>Communicate with you about updates and support</li>
                  <li>Improve our platform and user experience</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Data Security</h2>
                <p className="mb-4">
                  We implement appropriate security measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-primary">Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at 
                  privacy@presetpro.com
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

export default Privacy;