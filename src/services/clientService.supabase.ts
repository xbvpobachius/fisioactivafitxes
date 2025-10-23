'use server';

import { supabase } from '@/lib/supabase';
import type { Client } from '@/lib/types';

// Convertir de Supabase Row a Client type
function rowToClient(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    surname: row.surname,
    phone: row.phone,
    dni: row.dni,
    birthDate: row.birth_date,
    address: row.address,
    city: row.city,
    postalCode: row.postal_code,
    email: row.email,
    profession: row.profession,
    pathologies: row.pathologies,
    surgicalInterventions: row.surgical_interventions,
    medication: row.medication,
    familyHistory: row.family_history,
    reasonForConsultation: row.reason_for_consultation,
    history: [], // Las visitas se cargan por separado
  };
}

// Convertir de Client a Supabase Insert
function clientToRow(client: Omit<Client, 'id' | 'history'>): any {
  return {
    name: client.name,
    surname: client.surname,
    phone: client.phone,
    dni: client.dni,
    birth_date: client.birthDate,
    address: client.address,
    city: client.city,
    postal_code: client.postalCode,
    email: client.email,
    profession: client.profession,
    pathologies: client.pathologies,
    surgical_interventions: client.surgicalInterventions,
    medication: client.medication,
    family_history: client.familyHistory,
    reason_for_consultation: client.reasonForConsultation,
  };
}

export async function searchClients(query: string): Promise<Client[]> {
  if (!query) return [];

  const { data, error } = await supabase
    .from('clients_records')
    .select('*')
    .or(`name.ilike.%${query}%,surname.ilike.%${query}%,phone.ilike.%${query}%,dni.ilike.%${query}%`)
    .order('name');

  if (error) {
    console.error('Error searching clients:', error);
    return [];
  }

  return data?.map(rowToClient) || [];
}

export async function getClient(id: string): Promise<Client | undefined> {
  try {
    const { data: clientData, error: clientError } = await supabase
      .from('clients_records')
      .select('*')
      .eq('id', id)
      .single();

    if (clientError || !clientData) {
      console.error('Error fetching client:', clientError);
      return undefined;
    }

    // Obtener historial de visitas
    const { data: visitsData, error: visitsError } = await supabase
      .from('visits')
      .select('*')
      .eq('client_id', id)
      .order('date', { ascending: false });

    if (visitsError) {
      console.error('Error fetching visits:', visitsError);
    }

    const client = rowToClient(clientData);
    client.history = visitsData?.map(v => ({
      id: v.id,
      date: v.date,
      treatmentNotes: v.treatment_notes,
      price: Number(v.price), // Assegurem que sigui número
    })) || [];

    console.log('Client loaded with visits:', client.id, 'visits count:', client.history.length);
    return client;
  } catch (err) {
    console.error('Exception getting client:', err);
    return undefined;
  }
}

export async function createClient(clientData: Omit<Client, 'id' | 'history'>): Promise<Client | null> {
  const row = clientToRow(clientData);

  const { data, error } = await supabase
    .from('clients_records')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error('Error creating client:', error);
    return null;
  }

  return rowToClient(data);
}

export async function updateClient(
  id: string,
  clientData: Partial<Omit<Client, 'id' | 'history'>>
): Promise<Client | undefined> {
  const updates: any = {};

  if (clientData.name !== undefined) updates.name = clientData.name;
  if (clientData.surname !== undefined) updates.surname = clientData.surname;
  if (clientData.phone !== undefined) updates.phone = clientData.phone;
  if (clientData.dni !== undefined) updates.dni = clientData.dni;
  if (clientData.birthDate !== undefined) updates.birth_date = clientData.birthDate;
  if (clientData.address !== undefined) updates.address = clientData.address;
  if (clientData.city !== undefined) updates.city = clientData.city;
  if (clientData.postalCode !== undefined) updates.postal_code = clientData.postalCode;
  if (clientData.email !== undefined) updates.email = clientData.email;
  if (clientData.profession !== undefined) updates.profession = clientData.profession;
  if (clientData.pathologies !== undefined) updates.pathologies = clientData.pathologies;
  if (clientData.surgicalInterventions !== undefined) updates.surgical_interventions = clientData.surgicalInterventions;
  if (clientData.medication !== undefined) updates.medication = clientData.medication;
  if (clientData.familyHistory !== undefined) updates.family_history = clientData.familyHistory;
  if (clientData.reasonForConsultation !== undefined) updates.reason_for_consultation = clientData.reasonForConsultation;

  const { data, error } = await supabase
    .from('clients_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating client:', error);
    return undefined;
  }

  return getClient(id);
}

export async function addVisit(
  clientId: string,
  visitData: { date: string; treatmentNotes: string; price: number }
): Promise<Client | undefined> {
  try {
    const { data, error } = await supabase
      .from('visits')
      .insert({
        client_id: clientId,
        date: visitData.date,
        treatment_notes: visitData.treatmentNotes,
        price: Number(visitData.price), // Assegurem que sigui un número
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding visit:', error);
      console.error('Visit data:', visitData);
      return undefined;
    }

    console.log('Visit added successfully:', data);
    return getClient(clientId);
  } catch (err) {
    console.error('Exception adding visit:', err);
    return undefined;
  }
}

