import { useState } from 'react';
import { StepProps } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Building2, User, Mail, Phone, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Country codes with E.164 format - Francophone countries first, then Anglophone
const COUNTRY_CODES = [
  // Francophone countries (priority)
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'BE', name: 'Belgique', dialCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', dialCode: '+41', flag: '🇨🇭' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'LU', name: 'Luxembourg', dialCode: '+352', flag: '🇱🇺' },
  { code: 'MC', name: 'Monaco', dialCode: '+377', flag: '🇲🇨' },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'CI', name: 'Côte d\'Ivoire', dialCode: '+225', flag: '🇨🇮' },
  { code: 'MA', name: 'Maroc', dialCode: '+212', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisie', dialCode: '+216', flag: '🇹🇳' },
  { code: 'DZ', name: 'Algérie', dialCode: '+213', flag: '🇩🇿' },
  // Anglophone countries
  { code: 'US', name: 'États-Unis', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'Royaume-Uni', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AU', name: 'Australie', dialCode: '+61', flag: '🇦🇺' },
  { code: 'IE', name: 'Irlande', dialCode: '+353', flag: '🇮🇪' },
  { code: 'NZ', name: 'Nouvelle-Zélande', dialCode: '+64', flag: '🇳🇿' },
  { code: 'ZA', name: 'Afrique du Sud', dialCode: '+27', flag: '🇿🇦' },
] as const;

interface ContactStepProps extends StepProps {
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function ContactStep({ data, updateData, onPrev, isSubmitting, onSubmit }: ContactStepProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('FR');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  // Get country dial code
  const getDialCode = (countryCode: string) => {
    return COUNTRY_CODES.find(c => c.code === countryCode)?.dialCode || '+33';
  };

  // Format national number (remove leading zero, keep only digits)
  const formatNationalNumber = (number: string): string => {
    const cleaned = number.replace(/[^\d]/g, '');
    return cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  };

  // Build E.164 format
  const buildE164 = (nationalNumber: string, countryCode: string): string => {
    const dialCode = getDialCode(countryCode);
    return `${dialCode}${nationalNumber}`;
  };

  // Handle phone input change - auto-format as user types
  const handlePhoneChange = (value: string) => {
    // Only allow digits (strip everything else immediately)
    let digitsOnly = value.replace(/[^\d]/g, '');
    
    // Auto-remove leading zero
    if (digitsOnly.startsWith('0')) {
      digitsOnly = digitsOnly.slice(1);
    }
    
    // Limit to reasonable length (max 15 digits for national number)
    digitsOnly = digitsOnly.slice(0, 15);
    
    setPhoneNumber(digitsOnly);
    
    // Update form data with E.164 format
    if (digitsOnly.length >= 6) {
      updateData({ phone: buildE164(digitsOnly, selectedCountry) });
    } else {
      updateData({ phone: '' });
    }
  };

  // Handle country change
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    // Re-format phone with new country code
    if (phoneNumber) {
      updateData({ phone: buildE164(phoneNumber, countryCode) });
    }
  };

  // Validation: phone must have at least 6 digits (national number)
  const isPhoneValid = phoneNumber.length >= 6;

  const isValid = data.full_name && data.full_name.length >= 2 && 
                  data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
                  isPhoneValid;

  const selectedCountryData = COUNTRY_CODES.find(c => c.code === selectedCountry);

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

        {/* Phone with country selector */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            Téléphone *
          </Label>
          <div className="flex gap-2">
            {/* Country selector */}
            <Select value={selectedCountry} onValueChange={handleCountryChange}>
              <SelectTrigger className="w-[130px] bg-muted/50 border-glass-border focus:border-primary">
                <SelectValue>
                  {selectedCountryData && (
                    <span className="flex items-center gap-2">
                      <span>{selectedCountryData.flag}</span>
                      <span className="text-sm">{selectedCountryData.dialCode}</span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[280px] bg-background border-glass-border">
                {COUNTRY_CODES.map((country) => (
                  <SelectItem 
                    key={country.code} 
                    value={country.code}
                    className="cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span className="text-sm font-medium">{country.dialCode}</span>
                      <span className="text-xs text-muted-foreground">{country.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Phone input - shows only national digits */}
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="6 12 34 56 78"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="flex-1 bg-muted/50 border-glass-border focus:border-primary font-mono"
              required
            />
          </div>
          {phoneNumber && !isPhoneValid && (
            <p className="text-xs text-destructive">Minimum 6 chiffres requis</p>
          )}
          {phoneNumber && isPhoneValid && (
            <p className="text-xs text-primary font-mono">
              → {data.phone}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4">
        <Button 
          variant="ghost" 
          onClick={onPrev}
          className="gap-2 w-full sm:w-auto"
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
          className="w-full sm:w-auto sm:min-w-[200px]"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Valider ma demande'}
        </Button>
      </div>
    </div>
  );
}
