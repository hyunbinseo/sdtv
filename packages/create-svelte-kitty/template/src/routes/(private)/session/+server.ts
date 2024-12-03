export const GET = ({ locals }) => new Response(null, { status: locals.session ? 200 : 401 });
