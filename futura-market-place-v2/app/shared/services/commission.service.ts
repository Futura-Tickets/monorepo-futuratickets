import type { Commission } from "@/app/shared/interface";

export async function getEventCommission(eventId: string): Promise<Commission> {
  return await fetch(
    `${process.env.NEXT_PUBLIC_FUTURA_API}/events/${eventId}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  )
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => console.log(err));
}