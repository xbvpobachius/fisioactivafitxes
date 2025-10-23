'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  FileText, 
  Calendar, 
  CheckCircle, 
  Trash2,
  Loader2 
} from 'lucide-react';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import {
  getPendingRecords,
  completePendingRecord,
  deletePendingRecord,
  type PendingRecord,
} from '@/services/pendingRecordsService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function PendingRecordsList() {
  const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  async function loadPendingRecords() {
    setLoading(true);
    const records = await getPendingRecords();
    setPendingRecords(records);
    setLoading(false);
  }

  useEffect(() => {
    loadPendingRecords();
  }, []);

  async function handleComplete(id: string) {
    setActionLoading(id);
    const success = await completePendingRecord(id);
    if (success) {
      await loadPendingRecords();
    }
    setActionLoading(null);
  }

  async function handleDelete(id: string) {
    setActionLoading(id);
    const success = await deletePendingRecord(id);
    if (success) {
      await loadPendingRecords();
    }
    setActionLoading(null);
    setDeleteId(null);
  }

  function handleCreateRecord(record: PendingRecord) {
    // Dividir el nom: primera paraula = nom, resta = cognoms
    const nameParts = record.clientName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Navegar amb els paràmetres
    const params = new URLSearchParams({
      name: firstName,
      surname: lastName,
      pendingId: record.id,
    });
    router.push(`/clients/new?${params.toString()}`);
  }

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6" />
            Fitxes pendents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center gap-2 py-8">
            <Loader2 className="animate-spin h-5 w-5" />
            <span>Carregant fitxes pendents...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6" />
            Fitxes pendents
            {pendingRecords.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingRecords.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRecords.length === 0 ? (
            <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">
                No hi ha fitxes pendents de crear.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <h3 className="font-bold text-primary">
                          {record.clientName}
                        </h3>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Cita:{' '}
                          {format(new Date(record.appointmentDate), "PPP 'a les' p", {
                            locale: ca,
                          })}
                        </p>
                        <p className="text-xs">
                          Creat:{' '}
                          {format(new Date(record.createdAt), 'PPP', {
                            locale: ca,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleCreateRecord(record)}
                        disabled={actionLoading === record.id}
                      >
                        {actionLoading === record.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4 mr-1" />
                        )}
                        Crear Fitxa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteId(record.id)}
                        disabled={actionLoading === record.id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar fitxa pendent?</AlertDialogTitle>
            <AlertDialogDescription>
              Aquesta acció no es pot desfer. La fitxa pendent s'eliminarà permanentment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

