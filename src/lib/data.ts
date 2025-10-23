'use server';

import type { Client, Visit } from './types';

// Use Supabase services
import {
  searchClients as searchClientsSupabase,
  getClient as getClientSupabase,
  createClient as createClientSupabase,
  updateClient as updateClientSupabase,
  addVisit as addVisitSupabase,
} from '@/services/clientService.supabase';

export async function searchClients(query: string): Promise<Client[]> {
  return searchClientsSupabase(query);
}

export async function getClient(id: string): Promise<Client | undefined> {
  return getClientSupabase(id);
}

export async function createClient(data: Omit<Client, 'id' | 'history'>): Promise<Client> {
  const result = await createClientSupabase(data);
  if (!result) {
    throw new Error('Failed to create client');
  }
  return result;
}

export async function updateClient(id: string, data: Partial<Omit<Client, 'id' | 'history'>>): Promise<Client | undefined> {
  return updateClientSupabase(id, data);
}

export async function addVisit(clientId: string, visitData: Omit<Visit, 'id'>): Promise<Client | undefined> {
  return addVisitSupabase(clientId, visitData);
}
