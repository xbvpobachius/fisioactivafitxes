'use client';

import { useState } from 'react';
import type { Client } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Edit, User, Calendar, Phone, Mail, MapPin, Briefcase, Pill, Stethoscope, Dna, Activity, Fingerprint } from 'lucide-react';
import { ClientForm } from './client-form';
import VisitHistory from './visit-history';
import { useRouter } from 'next/navigation';
import { parseISO, isValid, format } from 'date-fns';
import { ca } from 'date-fns/locale';

function DetailItem({ icon, label, value }: { icon: React.ElementType, label: string, value?: string | null }) {
    if (!value) return null;
    const Icon = icon;
    return (
        <div>
            <p className="text-sm font-semibold text-primary flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
            </p>
            <p className="text-muted-foreground ml-6 whitespace-pre-wrap">{value}</p>
        </div>
    )
}

export function ClientDetails({ initialClient }: { initialClient: Client }) {
  const [isEditing, setIsEditing] = useState(false);
  const [client, setClient] = useState(initialClient);
  const router = useRouter();

  const handleSave = (updatedClientData: Client) => {
    // We need to re-format the date for display after saving, as it might come back as an ISO string
    let birthDate = updatedClientData.birthDate;
    if (typeof birthDate === 'string') {
        const parsed = parseISO(birthDate);
        if (isValid(parsed)) {
            birthDate = format(parsed, 'dd MMMM, yyyy', { locale: ca });
        }
    }
    setClient({...updatedClientData, birthDate });
    setIsEditing(false);
  };
  
  const handleVisitAdded = (updatedClient: Client) => {
    setClient(updatedClient);
  }

  if (isEditing) {
    // The form needs a Date object. The initial client has a string.
    let birthDateForForm: Date | undefined;
    
    // Sempre utilitzem initialClient.birthDate (que és l'original ISO string de Supabase)
    const parsedDate = parseISO(initialClient.birthDate);
    if (isValid(parsedDate)) {
        birthDateForForm = parsedDate;
    } else {
        // Si no és vàlid, provem amb el format actual
        const altParsed = new Date(client.birthDate);
        if (isValid(altParsed)) {
            birthDateForForm = altParsed;
        }
    }
    
    const clientForForm = { 
      ...client, 
      birthDate: birthDateForForm as Date,
      // Assegurem que totes les propietats es passen correctament
      name: client.name,
      surname: client.surname,
      dni: client.dni,
      phone: client.phone,
      email: client.email,
      address: client.address,
      city: client.city,
      postalCode: client.postalCode,
      profession: client.profession,
      pathologies: client.pathologies,
      surgicalInterventions: client.surgicalInterventions,
      medication: client.medication,
      familyHistory: client.familyHistory,
      reasonForConsultation: client.reasonForConsultation,
    };

    return (
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Editant Fitxa de Client</CardTitle>
          <CardDescription>Modifica les dades i prem a desar.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm client={clientForForm} onSave={handleSave} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-3xl font-bold text-primary flex items-center gap-3">
                        <User className="h-8 w-8" />
                        {client.name} {client.surname}
                    </CardTitle>
                    <CardDescription className="mt-2">Fitxa de Client</CardDescription>
                </div>
                <Button onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Fitxa
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DetailItem icon={Calendar} label="Data de Naixement" value={client.birthDate} />
                    <DetailItem icon={Fingerprint} label="DNI" value={client.dni} />
                    <DetailItem icon={Phone} label="Telèfon" value={client.phone} />
                    <DetailItem icon={Mail} label="Email" value={client.email} />
                    <DetailItem icon={MapPin} label="Adreça" value={`${client.address}, ${client.postalCode} ${client.city}`} />
                    <DetailItem icon={Briefcase} label="Professió" value={client.profession} />
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Anamnesi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <DetailItem icon={Activity} label="Motiu de la Consulta" value={client.reasonForConsultation} />
                <DetailItem icon={Stethoscope} label="Patologies" value={client.pathologies} />
                <DetailItem icon={Pill} label="Medicació Actual" value={client.medication} />
                <DetailItem icon={Stethoscope} label="Intervencions Quirúrgiques" value={client.surgicalInterventions} />
                <DetailItem icon={Dna} label="Antecedents Familiars" value={client.familyHistory} />
            </CardContent>
        </Card>

        <VisitHistory clientId={client.id} initialVisits={client.history} onVisitAdded={handleVisitAdded} />
    </div>
  );
}