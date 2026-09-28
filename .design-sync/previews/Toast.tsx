import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@digitalix/ui';
import { Surface } from '../preview-kit/Surface';

// Radix renders toasts inside ToastViewport; in the app the Toaster pins it bottom-right. Here it is made static to sit in the card.
export const Variants = () => (
  <Surface>
    <ToastProvider duration={Infinity}>
      <Toast open>
        <div className="grid gap-1">
          <ToastTitle>Email enregistré</ToastTitle>
          <ToastDescription>Votre rapport complet arrive dans quelques minutes.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <Toast open variant="destructive">
        <div className="grid gap-1">
          <ToastTitle>Analyse impossible</ToastTitle>
          <ToastDescription>Le site bloque les navigateurs automatisés.</ToastDescription>
        </div>
        <ToastAction altText="Réessayer">Réessayer</ToastAction>
      </Toast>
      <ToastViewport className="static flex-col gap-3 p-0 w-[420px] md:max-w-[420px]" />
    </ToastProvider>
  </Surface>
);
