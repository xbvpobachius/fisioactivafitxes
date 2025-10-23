import ClientSearch from '@/components/client-search';
import PendingRecordsList from '@/components/pending-records-list';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-16 space-y-12">
      <div>
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-primary sm:text-5xl">
            Gestor de Clients FisioActiva
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Busca, crea i gestiona les fitxes dels teus clients de forma fàcil i
            ràpida.
          </p>
        </div>
        <div className="mt-12">
          <ClientSearch />
        </div>
      </div>

      <div>
        <PendingRecordsList />
      </div>
    </main>
  );
}
