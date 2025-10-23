import { NextRequest, NextResponse } from 'next/server';
import { createPendingRecord } from '@/services/pendingRecordsService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar que tengamos los campos necesarios
    const { clientName, appointmentId, appointmentDate } = body;
    
    if (!clientName || !appointmentId || !appointmentDate) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['clientName', 'appointmentId', 'appointmentDate']
        },
        { status: 400 }
      );
    }

    // Crear el registro pendiente
    const record = await createPendingRecord(
      clientName,
      appointmentId,
      appointmentDate
    );

    if (!record) {
      return NextResponse.json(
        { error: 'Failed to create pending record' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        record 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/pending-records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Obtener todos los registros pendientes
export async function GET() {
  try {
    const { getPendingRecords } = await import('@/services/pendingRecordsService');
    const records = await getPendingRecords();
    
    return NextResponse.json({
      success: true,
      records
    });
  } catch (error) {
    console.error('Error in GET /api/pending-records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

