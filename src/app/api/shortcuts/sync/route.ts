import { NextResponse } from 'next/server';
import { supabaseServerAdmin } from '@/lib/server/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Seguridad básica: Verificar token contra CRON_SECRET o SHORTCUTS_SECRET
  const expectedSecret = process.env.CRON_SECRET || process.env.SHORTCUTS_SECRET;
  if (!expectedSecret || token !== expectedSecret) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Consulta a Supabase de tareas pendientes ('todo' o 'in-progress')
    const { data: tasks, error } = await supabaseServerAdmin
      .from('tasks')
      .select('*')
      .neq('status', 'done');

    if (error) {
      console.warn('Advertencia al consultar Supabase en /api/shortcuts/sync:', error.message);
      return NextResponse.json({ tasks: [] });
    }

    // Formateo limpio y directo para parsing en Apple Shortcuts / Reminders
    const mappedTasks = (tasks || []).map((t: any) => ({
      title: t.title || 'Tarea sin título',
      dueDate: t.due_date || t.dueDate || null,
      notes: t.description || 'Agregado desde LifeOS',
      priority: t.priority || 'media',
      status: t.status || 'todo',
    }));

    return NextResponse.json({ tasks: mappedTasks });
  } catch (error) {
    console.error('Error en endpoint /api/shortcuts/sync:', error);
    return NextResponse.json({ error: 'Fallo al sincronizar' }, { status: 500 });
  }
}
