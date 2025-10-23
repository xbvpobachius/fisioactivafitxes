'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { parseISO, isValid, format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { useEffect } from 'react';


import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient, updateClient } from '@/lib/data';
import type { Client } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from './ui/separator';

const clientSchema = z.object({
  name: z.string().min(2, 'El nom és requerit.'),
  surname: z.string().min(2, 'Els cognoms són requerits.'),
  birthDate: z.date({ required_error: 'La data de naixement és requerida.' }),
  dni: z.string().min(9, 'El DNI ha de tenir 9 caràcters.').max(9, 'El DNI ha de tenir 9 caràcters.'),
  phone: z.string().min(9, 'El telèfon ha de tenir almenys 9 dígits.'),
  email: z.string().email('L\'email no és vàlid.'),
  address: z.string().min(1, 'L\'adreça és requerida.'),
  city: z.string().min(1, 'La població és requerida.'),
  postalCode: z.string().min(5, 'El codi postal ha de tenir 5 dígits.').max(5, 'El codi postal ha de tenir 5 dígits.'),
  profession: z.string().optional(),
  pathologies: z.string().optional(),
  surgicalInterventions: z.string().optional(),
  medication: z.string().optional(),
  familyHistory: z.string().optional(),
  reasonForConsultation: z.string().min(1, 'El motiu de la consulta és requerit.'),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: Client & { birthDate: Date };
  onSave?: (updatedClient: Client) => void;
  initialData?: { name?: string; surname?: string };
  onSaveSuccess?: () => void;
}

export function ClientForm({ client, onSave, initialData, onSaveSuccess }: ClientFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!client;

  let initialBirthDate: Date | undefined;
  if (client?.birthDate) {
    if (client.birthDate instanceof Date && isValid(client.birthDate)) {
      initialBirthDate = client.birthDate;
    } else if (typeof client.birthDate === 'string') {
      const parsedDate = parseISO(client.birthDate);
      if (isValid(parsedDate)) {
        initialBirthDate = parsedDate;
      } else {
        // Intent amb constructor de Date com a fallback
        const altDate = new Date(client.birthDate);
        if (isValid(altDate)) {
          initialBirthDate = altDate;
        }
      }
    }
  }


  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name ?? initialData?.name ?? '',
      surname: client?.surname ?? initialData?.surname ?? '',
      birthDate: initialBirthDate,
      dni: client?.dni ?? '',
      phone: client?.phone ?? '',
      email: client?.email ?? '',
      address: client?.address ?? '',
      city: client?.city ?? '',
      postalCode: client?.postalCode ?? '',
      profession: client?.profession ?? '',
      pathologies: client?.pathologies ?? '',
      surgicalInterventions: client?.surgicalInterventions ?? '',
      medication: client?.medication ?? '',
      familyHistory: client?.familyHistory ?? '',
      reasonForConsultation: client?.reasonForConsultation ?? '',
    },
  });

  // Actualitzar els valors quan arribin de initialData
  useEffect(() => {
    if (initialData?.name) {
      form.setValue('name', initialData.name);
    }
    if (initialData?.surname) {
      form.setValue('surname', initialData.surname);
    }
  }, [initialData, form]);

  const onSubmit = async (data: ClientFormValues) => {
    try {
      const dataToSave = {
        ...data,
        birthDate: data.birthDate.toISOString(),
      };

      if (isEditMode && client) {
        const updated = await updateClient(client.id, dataToSave);
        if (updated && onSave) {
          const clientWithFormattedDate = {
            ...updated,
            birthDate: format(data.birthDate, 'dd MMMM, yyyy', { locale: ca })
          };
          onSave(clientWithFormattedDate);
        } else if (updated) {
            router.refresh();
        }
      } else {
        const newClient = await createClient(dataToSave);
        if (onSaveSuccess) {
          await onSaveSuccess();
        }
        router.push(`/clients/${newClient.id}`);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No s\'ha pogut desar la fitxa. Intenta-ho de nou.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary">Dades Personals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nom</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            <FormField control={form.control} name="surname" render={({ field }) => (
                <FormItem><FormLabel>Cognoms</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            <FormField control={form.control} name="birthDate" render={({ field }) => (
                <FormItem><FormLabel>Data de Naixement</FormLabel><FormControl><DatePicker date={field.value} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
              )} />
            <FormField control={form.control} name="dni" render={({ field }) => (
                <FormItem><FormLabel>DNI</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Telèfon</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Adreça</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem><FormLabel>Població</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              <FormField control={form.control} name="postalCode" render={({ field }) => (
                  <FormItem><FormLabel>Codi Postal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
             <FormField control={form.control} name="profession" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Professió</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
          </div>
        </div>
        
        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-primary">Anamnesi</h3>
          <div className="space-y-4">
            <FormField control={form.control} name="reasonForConsultation" render={({ field }) => (
                <FormItem><FormLabel>Motiu de la Consulta</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            <FormField control={form.control} name="pathologies" render={({ field }) => (
                <FormItem><FormLabel>Patologies</FormLabel><FormControl><Textarea {...field} placeholder="Malalties rellevants, al·lèrgies..." /></FormControl><FormMessage /></FormItem>
              )} />
            <FormField control={form.control} name="surgicalInterventions" render={({ field }) => (
                <FormItem><FormLabel>Intervencions Quirúrgiques</FormLabel><FormControl><Textarea {...field} placeholder="Operacions, dates si es recorden..." /></FormControl><FormMessage /></FormItem>
              )} />
            <FormField control={form.control} name="medication" render={({ field }) => (
                <FormItem><FormLabel>Medicació Actual</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            <FormField control={form.control} name="familyHistory" render={({ field }) => (
                <FormItem><FormLabel>Antecedents Familiars</FormLabel><FormControl><Textarea {...field} placeholder="Malalties rellevants a la família..." /></FormControl><FormMessage /></FormItem>
              )} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting} size="lg">
            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditMode ? 'Desar Canvis' : 'Crear Fitxa'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
