'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { PlusCircle, Calendar, FileText, Euro, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { Client, Visit } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { DatePicker } from './ui/date-picker';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { addVisit } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

const visitSchema = z.object({
  date: z.date({ required_error: 'La data és requerida.' }),
  treatmentNotes: z.string().min(1, 'Les notes són requerides.'),
  price: z.coerce.number().positive('El preu ha de ser un número positiu.'),
});

type VisitFormValues = z.infer<typeof visitSchema>;

interface VisitHistoryProps {
  clientId: string;
  initialVisits: Visit[];
  onVisitAdded: (updatedClient: Client) => void;
}

export default function VisitHistory({ clientId, initialVisits = [], onVisitAdded }: VisitHistoryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<VisitFormValues>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      date: new Date(),
      treatmentNotes: '',
      price: 50,
    },
  });

  const onSubmit = async (data: VisitFormValues) => {
    console.log('Submitting visit:', data);
    console.log('Client ID:', clientId);
    
    try {
      const visitData = {
        date: data.date.toISOString(),
        treatmentNotes: data.treatmentNotes,
        price: Number(data.price),
      };
      
      console.log('Visit data to send:', visitData);
      
      const updatedClient = await addVisit(clientId, visitData);
      
      console.log('Updated client:', updatedClient);

      if (updatedClient) {
        toast({
            title: 'Visita afegida!',
            description: 'La nova visita s\'ha registrat correctament.',
        });
        onVisitAdded(updatedClient);
        setIsDialogOpen(false);
        form.reset({ date: new Date(), treatmentNotes: '', price: 50 });
      } else {
        console.error('No updated client returned');
        throw new Error('No s\'ha pogut actualitzar el client');
      }
    } catch (error) {
      console.error('Error submitting visit:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No s\'ha pogut afegir la visita. Intenta-ho de nou.',
      });
    }
  };
  
  const sortedVisits = [...initialVisits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Historial de Visites</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Afegir Visita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Afegir Nova Visita</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form 
                onSubmit={(e) => {
                  console.log('Form submit event triggered');
                  console.log('Form values:', form.getValues());
                  console.log('Form errors:', form.formState.errors);
                  form.handleSubmit(onSubmit)(e);
                }} 
                className="space-y-4 py-4"
              >
                <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-medium">
                        <Calendar className="h-4 w-4" />Data
                      </FormLabel>
                      <FormControl>
                        <DatePicker date={field.value} setDate={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <FormField control={form.control} name="treatmentNotes" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-medium">
                        <FileText className="h-4 w-4" />Evolució i Tractament
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-medium">
                        <Euro className="h-4 w-4" />Preu
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            className="pl-7" 
                          />
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">€</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel·lar</Button>
                  <Button 
                    type="submit" 
                    disabled={form.formState.isSubmitting}
                    onClick={() => console.log('Submit button clicked')}
                  >
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Desar Visita
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {sortedVisits.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Data</TableHead>
                  <TableHead>Evolució i Tractament</TableHead>
                  <TableHead className="text-right w-[100px]">Preu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedVisits.map(visit => (
                  <TableRow key={visit.id}>
                    <TableCell className="font-medium">{format(new Date(visit.date), 'dd/MM/yyyy', {locale: ca})}</TableCell>
                    <TableCell className="whitespace-pre-wrap">{visit.treatmentNotes}</TableCell>
                    <TableCell className="text-right">{new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' }).format(visit.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Aquest client encara no té visites registrades.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
