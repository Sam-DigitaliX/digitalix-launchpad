import { StepProps } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Building2, User, Mail, Phone } from 'lucide-react';

interface ContactStepProps extends StepProps {
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function ContactStep({ data, updateData, onPrev, isSubmitting, onSubmit }: ContactStepProps) {
  const isValid = data.full_name && data.full_name.length >= 2 && 
                  data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold">
          Vos <span className="text-gradient-primary">coordonnées</span>
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Pour vous recontacter et planifier notre échange
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Company name */}
        <div className="space-y-2">
          <Label htmlFor="company" className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Entreprise <span className="text-muted-foreground text-xs">(optionnel)</span>
          </Label>
          <Input
            id="company"
            placeholder="Nom de votre entreprise"
            value={data.company_name || ''}
            onChange={(e) => updateData({ company_name: e.target.value })}
            className="bg-muted/50 border-glass-border focus:border-primary"
          />
        </div>

        {/* Full name */}
        <div className="space-y-2">
          <Label htmlFor="fullname" className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Prénom et Nom *
          </Label>
          <Input
            id="fullname"
            placeholder="Jean Dupont"
            value={data.full_name || ''}
            onChange={(e) => updateData({ full_name: e.target.value })}
            className="bg-muted/50 border-glass-border focus:border-primary"
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            Email professionnel *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="jean@entreprise.com"
            value={data.email || ''}
            onChange={(e) => updateData({ email: e.target.value })}
            className="bg-muted/50 border-glass-border focus:border-primary"
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            Téléphone <span className="text-muted-foreground text-xs">(optionnel)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            value={data.phone || ''}
            onChange={(e) => updateData({ phone: e.target.value })}
            className="bg-muted/50 border-glass-border focus:border-primary"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          variant="ghost" 
          onClick={onPrev}
          className="gap-2"
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <Button 
          variant="heroGradient" 
          size="lg"
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Valider ma demande'}
        </Button>
      </div>
    </div>
  );
}
