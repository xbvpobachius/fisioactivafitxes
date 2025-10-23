import { getClient } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ClientDetails } from '@/components/client-details';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ca } from 'date-fns/locale';

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clientData = await getClient(id);

  if (!clientData) {
    notFound();
  }

  // Aquest ajust és per evitar problemes d'hidratació amb la zona horària.
  const date = parseISO(clientData.birthDate);
  if (!isValid(date)) {
    // Handle invalid date string from source
    console.error("Invalid date format for client:", clientData.id);
    // You might want to render an error or a default state
    return <div>Error: La data de naixement del client no és vàlida.</div>
  }
  
  const formattedBirthDate = format(date, 'dd MMMM, yyyy', { locale: ca });
  const clientWithFormattedDate = { ...clientData, birthDate: formattedBirthDate };


  return (
    <main className="container mx-auto px-4 py-8">
       <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tornar a la cerca
          </Link>
        </Button>
      </div>
      <ClientDetails initialClient={clientWithFormattedDate} />
    </main>
  );
}
