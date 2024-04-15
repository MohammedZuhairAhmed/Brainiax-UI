export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = process.env.NEXT_PUBLIC_BRAINIAX_URL;
  const res = await fetch(url + '/v1/ingest/list');
  return new Response(res.body, res);
}
