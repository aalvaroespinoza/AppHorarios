export class StravaService {
  static async getLatestActivities(token: string) {
    try {
      const res = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=3', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        next: { revalidate: 300 } // cache for 5 minutes
      });

      if (!res.ok) {
        throw new Error('Error fetching Strava activities');
      }

      return await res.json();
    } catch (error) {
      console.error('Strava Service Error:', error);
      return null;
    }
  }
}
