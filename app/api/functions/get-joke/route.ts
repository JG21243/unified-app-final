import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ joke: 'Why did the chicken cross the road?' })
}
