'use server';

import { supabase } from '@/lib/supabase';

export type PendingRecord = {
  id: string;
  clientName: string;
  appointmentId: string;
  appointmentDate: string;
  createdAt: string;
  isCompleted: boolean;
};

export async function getPendingRecords(): Promise<PendingRecord[]> {
  const { data, error } = await supabase
    .from('pending_records')
    .select('*')
    .eq('is_completed', false)
    .order('appointment_date', { ascending: true });

  if (error) {
    console.error('Error fetching pending records:', error);
    return [];
  }

  return data?.map(row => ({
    id: row.id,
    clientName: row.client_name,
    appointmentId: row.appointment_id,
    appointmentDate: row.appointment_date,
    createdAt: row.created_at,
    isCompleted: row.is_completed,
  })) || [];
}

export async function createPendingRecord(
  clientName: string,
  appointmentId: string,
  appointmentDate: string
): Promise<PendingRecord | null> {
  const { data, error } = await supabase
    .from('pending_records')
    .insert({
      client_name: clientName,
      appointment_id: appointmentId,
      appointment_date: appointmentDate,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating pending record:', error);
    return null;
  }

  return {
    id: data.id,
    clientName: data.client_name,
    appointmentId: data.appointment_id,
    appointmentDate: data.appointment_date,
    createdAt: data.created_at,
    isCompleted: data.is_completed,
  };
}

export async function completePendingRecord(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('pending_records')
    .update({ is_completed: true })
    .eq('id', id);

  if (error) {
    console.error('Error completing pending record:', error);
    return false;
  }

  return true;
}

export async function deletePendingRecord(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('pending_records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting pending record:', error);
    return false;
  }

  return true;
}

