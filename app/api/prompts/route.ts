import { getPrompts } from '@/app/actions'

export async function GET() {
  try {
    const { prompts } = await getPrompts()
    return Response.json({ prompts })
  } catch (e:any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
