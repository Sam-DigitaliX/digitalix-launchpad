import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const Brand = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen text-foreground">
      {/* Print Button - Hidden on print */}
      <div className="fixed top-6 right-6 z-50 print:hidden">
        <Button onClick={handlePrint} variant="heroGradient" size="lg">
          <Download className="w-4 h-4 mr-2" />
          Exporter en PDF
        </Button>
      </div>

      <div className="container mx-auto px-8 py-16 max-w-5xl">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient-primary">DigitaliX</span> Brand Kit
          </h1>
          <p className="text-xl text-muted-foreground">
            Guidelines visuelles et identité de marque
          </p>
        </header>

        {/* Colors Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 border-b border-white/[0.08] pb-4">
            🎨 Palette de Couleurs
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Primary */}
            <div className="space-y-3">
              <div className="w-full aspect-square rounded-xl bg-primary shadow-lg" />
              <div>
                <p className="font-semibold">Primary</p>
                <p className="text-sm text-muted-foreground">HSL: 262 83% 58%</p>
                <p className="text-sm text-muted-foreground">#8B5CF6</p>
              </div>
            </div>

            {/* Primary Glow */}
            <div className="space-y-3">
              <div className="w-full aspect-square rounded-xl bg-primary-glow shadow-lg" />
              <div>
                <p className="font-semibold">Primary Glow</p>
                <p className="text-sm text-muted-foreground">HSL: 262 83% 68%</p>
                <p className="text-sm text-muted-foreground">#A78BFA</p>
              </div>
            </div>

            {/* Secondary */}
            <div className="space-y-3">
              <div className="w-full aspect-square rounded-xl bg-secondary shadow-lg" />
              <div>
                <p className="font-semibold">Secondary</p>
                <p className="text-sm text-muted-foreground">HSL: 188 94% 43%</p>
                <p className="text-sm text-muted-foreground">#06B6D4</p>
              </div>
            </div>

            {/* Secondary Glow */}
            <div className="space-y-3">
              <div className="w-full aspect-square rounded-xl bg-secondary-glow shadow-lg" />
              <div>
                <p className="font-semibold">Secondary Glow</p>
                <p className="text-sm text-muted-foreground">HSL: 188 94% 53%</p>
                <p className="text-sm text-muted-foreground">#22D3EE</p>
              </div>
            </div>

            {/* Background */}
            <div className="space-y-3">
              <div className="w-full aspect-square rounded-xl border border-white/[0.08] shadow-lg" />
              <div>
                <p className="font-semibold">Background</p>
                <p className="text-sm text-muted-foreground">HSL: 0 0% 0%</p>
                <p className="text-sm text-muted-foreground">#000000</p>
              </div>
            </div>

            {/* Foreground */}
            <div className="space-y-3">
              <div className="w-full aspect-square rounded-xl bg-foreground shadow-lg" />
              <div>
                <p className="font-semibold">Foreground</p>
                <p className="text-sm text-muted-foreground">HSL: 0 0% 98%</p>
                <p className="text-sm text-muted-foreground">#FAFAFA</p>
              </div>
            </div>

            {/* Muted */}
            <div className="space-y-3">
              <div className="w-full aspect-square rounded-xl bg-muted shadow-lg" />
              <div>
                <p className="font-semibold">Muted</p>
                <p className="text-sm text-muted-foreground">HSL: 0 0% 12%</p>
                <p className="text-sm text-muted-foreground">#1F1F1F</p>
              </div>
            </div>

            {/* Muted Foreground */}
            <div className="space-y-3">
              <div className="w-full aspect-square rounded-xl border border-white/[0.08] shadow-lg flex items-center justify-center">
                <span className="text-muted-foreground text-4xl font-bold">Aa</span>
              </div>
              <div>
                <p className="font-semibold">Muted Foreground</p>
                <p className="text-sm text-muted-foreground">HSL: 0 0% 55%</p>
                <p className="text-sm text-muted-foreground">#8C8C8C</p>
              </div>
            </div>
          </div>
        </section>

        {/* Gradients Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 border-b border-white/[0.08] pb-4">
            🌈 Gradients
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Hero Gradient */}
            <div className="space-y-3">
              <div className="w-full h-32 rounded-xl bg-gradient-to-r from-primary to-secondary shadow-lg" />
              <div>
                <p className="font-semibold">Hero Gradient</p>
                <p className="text-sm text-muted-foreground font-mono">
                  linear-gradient(135deg, #8B5CF6, #06B6D4)
                </p>
              </div>
            </div>

            {/* Glass Card */}
            <div className="space-y-3">
              <div className="w-full h-32 rounded-xl glass-card shadow-lg" />
              <div>
                <p className="font-semibold">Glass Card</p>
                <p className="text-sm text-muted-foreground font-mono">
                  hsl(0 0% 100% / 0.04) + backdrop-blur-xl
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 border-b border-white/[0.08] pb-4">
            ✍️ Typographie
          </h2>
          
          <div className="space-y-8">
            <div className="p-6 rounded-xl bg-muted/30 border border-white/[0.08]">
              <p className="text-sm text-muted-foreground mb-2">Font Family</p>
              <p className="text-4xl font-bold">Inter</p>
              <p className="text-muted-foreground mt-2">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br/>
                abcdefghijklmnopqrstuvwxyz<br/>
                0123456789
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">H1 Hero — Bold 700 / 5xl-7xl</p>
                <p className="text-5xl md:text-7xl font-bold">Sans données fiables</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">H2 Section — Bold 700 / 3xl-5xl</p>
                <p className="text-3xl md:text-5xl font-bold">Titre de Section</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Body — Regular 400 / base-lg</p>
                <p className="text-lg">La performance publicitaire ne se décrète pas. Elle se construit sur des données réellement maîtrisées.</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">CTA Button — Bold 700 / lg</p>
                <Button variant="heroGradient" size="lg">Je réserve mon audit</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Effects Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 border-b border-white/[0.08] pb-4">
            ✨ Effets & Shadows
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-8 rounded-xl bg-muted/30 border border-white/[0.08] flex flex-col items-center justify-center text-center gap-4">
              <span className="glass-badge px-4 py-1.5">
                <span className="text-gradient-primary">Glass Badge</span>
              </span>
              <p className="font-semibold mb-1">Glass Badge</p>
              <p className="text-xs text-muted-foreground font-mono">
                gradient bg + border 0.15 + inset highlight
              </p>
            </div>

            <div className="p-8 rounded-xl bg-muted/30 border border-white/[0.08] glow-primary text-center">
              <p className="font-semibold mb-2">Glow Primary</p>
              <p className="text-xs text-muted-foreground font-mono">
                0 0 60px hsl(262 83% 58% / 0.4)
              </p>
            </div>
            
            <div className="p-8 rounded-xl bg-muted/30 border border-white/[0.08] glow-secondary text-center">
              <p className="font-semibold mb-2">Glow Secondary</p>
              <p className="text-xs text-muted-foreground font-mono">
                0 0 40px hsl(188 94% 43% / 0.3)
              </p>
            </div>
            
            <div className="p-8 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-[0_25px_50px_-12px_hsl(0_0%_0%_/_0.8)] text-center">
              <p className="font-semibold mb-2">Card Shadow</p>
              <p className="text-xs text-muted-foreground font-mono">
                0 25px 50px -12px
              </p>
            </div>
          </div>
        </section>

        {/* Spacing Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 border-b border-white/[0.08] pb-4">
            📐 Spacing & Layout
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-xl">Border Radius</h3>
              <div className="flex items-end gap-4">
                <div className="w-16 h-16 bg-primary rounded-sm" />
                <div className="w-16 h-16 bg-primary rounded-md" />
                <div className="w-16 h-16 bg-primary rounded-lg" />
                <div className="w-16 h-16 bg-primary rounded-xl" />
                <div className="w-16 h-16 bg-primary rounded-2xl" />
              </div>
              <p className="text-sm text-muted-foreground">
                Base radius: 0.75rem (12px)
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-xl">Container</h3>
              <div className="p-4 bg-muted/30 rounded-lg border border-white/[0.08]">
                <p><strong>Max Width:</strong> 1400px</p>
                <p><strong>Padding Mobile:</strong> 1rem (16px)</p>
                <p><strong>Padding Desktop:</strong> 2rem (32px)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 border-b border-white/[0.08] pb-4">
            🔘 Boutons
          </h2>
          
          <div className="flex flex-wrap gap-4">
            <Button variant="heroGradient" size="lg">Hero Gradient</Button>
            <Button variant="hero" size="lg">Hero</Button>
            <Button variant="heroOutline" size="lg">Hero Outline</Button>
            <Button variant="glass" size="lg">Glass</Button>
            <Button variant="default" size="lg">Default</Button>
            <Button variant="secondary" size="lg">Secondary</Button>
            <Button variant="outline" size="lg">Outline</Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-muted-foreground pt-8 border-t border-white/[0.08]">
          <p>© {new Date().getFullYear()} DigitaliX — Server-Side Tracking Specialists</p>
          <p className="text-sm mt-2">Brand Kit v1.0</p>
        </footer>
      </div>
    </div>
  );
};

export default Brand;
