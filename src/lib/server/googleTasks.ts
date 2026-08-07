import { google } from 'googleapis';

export async function createGoogleTask(title: string, dueString?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn("Faltan credenciales de Google (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN). Simulando creación de tarea en Google Tasks.");
    return { success: true, simulated: true };
  }

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const tasks = google.tasks({ version: 'v1', auth: oauth2Client });

    const response = await tasks.tasks.insert({
      tasklist: '@default',
      requestBody: {
        title,
        ...(dueString ? { due: dueString } : {})
      }
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Excepción al crear Google Task:', error);
    return { success: false, error };
  }
}
