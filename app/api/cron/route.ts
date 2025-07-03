import { updateElectionStatus } from '@/app/actions/election/update-election-status';
import { NextRequest } from 'next/server';

export async function PUT(req: NextRequest) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  await updateElectionStatus()
  return Response.json({status:200});
}