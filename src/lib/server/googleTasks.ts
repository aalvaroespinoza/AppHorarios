export async function createGoogleTask(title: string, datetimeISO?: string) {
  const token = process.env.GOOGLE_TASKS_API_KEY;
  if (!token) {
    console.warn("GOOGLE_TASKS_API_KEY no configurado. Simulando creación de tarea en Google Tasks.");
    return { success: true, simulated: true };
  }

  try {
    const url = 'https://tasks.googleapis.com/tasks/v1/lists/@default/tasks';
    const body: any = { title };
    if (datetimeISO) {
      body.due = datetimeISO;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.error('Error en Google Tasks API:', await response.text());
      return { success: false };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Excepción al crear Google Task:', error);
    return { success: false, error };
  }
}
