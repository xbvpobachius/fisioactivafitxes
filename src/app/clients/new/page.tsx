'use client';

import { ClientForm } from '@/components/client-form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { completePendingRecord } from '@/services/pendingRecordsService';

export default function NewClientPage() {
  const searchParams = useSearchParams();
  const [initialData, setInitialData] = useState<{ name?: string; surname?: string } | undefined>();
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    const name = searchParams.get('name');
    const surname = searchParams.get('surname');
    const pending = searchParams.get('pendingId');
    
    if (name || surname) {
      setInitialData({
        name: name || undefined,
        surname: surname || undefined,
      });
    }
    
    if (pending) {
      setPendingId(pending);
    }
  }, [searchParams]);

  const handleSave = async () => {
    // Marcar la ficha pendent com a completada
    if (pendingId) {
      await completePendingRecord(pendingId);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">
            Crear Nova Fitxa de Client
          </CardTitle>
          <CardDescription>
            Omple els camps següents per registrar un nou client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm initialData={initialData} onSaveSuccess={handleSave} />
        </CardContent>
      </Card>
    </main>
  );
}
