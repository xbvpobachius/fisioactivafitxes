'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, Phone, Fingerprint, PlusCircle, Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { searchClients } from '@/lib/data';
import type { Client } from '@/lib/types';
import { Separator } from './ui/separator';

// Simple debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}

export default function ClientSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const debouncedSearch = useCallback(debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    const foundClients = await searchClients(searchQuery);
    setResults(foundClients);
    setLoading(false);
  }, 300), []);


  useEffect(() => {
    setLoading(true);
    debouncedSearch(query);
  }, [query, debouncedSearch]);


  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Search className="h-6 w-6" />
          Cercar Client
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cercar per nom, cognoms, telèfon o DNI..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              aria-label="Cercar client"
            />
          </div>
           <Button onClick={() => router.push('/clients/new')} className="h-12">
            <PlusCircle className="mr-2 h-5 w-5" />
            Crear Nova Fitxa
          </Button>
        </div>

        <Separator className="my-6" />

        <div className="min-h-[10rem]">
          {loading && (
            <div className="flex justify-center items-center gap-2 text-muted-foreground pt-8">
              <Loader2 className="animate-spin h-5 w-5" />
              <span>Cercant...</span>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-4">
               <h3 className="font-semibold">Resultats de la cerca:</h3>
              {results.map(client => (
                <Link href={`/clients/${client.id}`} key={client.id} className="block">
                  <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <div className="font-bold text-primary flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {client.name} {client.surname}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{client.phone}</p>
                      <p className="flex items-center gap-2"><Fingerprint className="h-4 w-4" />{client.dni}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && query.length > 0 && results.length === 0 && (
             <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
               <p className="text-muted-foreground">
                {`No s'han trobat clients per a "${query}".`}
              </p>
            </div>
          )}
           {!loading && query.length === 0 && results.length === 0 && (
             <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
               <p className="text-muted-foreground">
                Comença a escriure per buscar un client.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
