import { Button, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@digitalix/ui';

const links = ['Services', 'Audit tracking', 'Cas clients', 'Contact'];

export const MobileMenu = () => (
  <Sheet defaultOpen modal={false}>
    <SheetContent side="right" className="border-glass-border">
      <SheetHeader>
        <SheetTitle className="font-display">DigitaliX</SheetTitle>
        <SheetDescription>Tracking server-side & conformité RGPD</SheetDescription>
      </SheetHeader>
      <nav className="mt-8 flex flex-col gap-4">
        {links.map((l) => (
          <span key={l} className="text-lg text-foreground">
            {l}
          </span>
        ))}
      </nav>
      <Button variant="heroGradient" className="mt-8 w-full">
        Réserver un audit
      </Button>
    </SheetContent>
  </Sheet>
);
