import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@digitalix/ui';

export const Confirmation = () => (
  <Dialog defaultOpen modal={false}>
    <DialogContent className="border-glass-border sm:rounded-2xl">
      <DialogHeader>
        <DialogTitle className="font-display text-xl">Débloquer le rapport complet</DialogTitle>
        <DialogDescription>
          Recevez les 28 vérifications détaillées et nos recommandations prioritaires par email.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2">
        <Button variant="outline">Plus tard</Button>
        <Button variant="heroGradient">Débloquer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
