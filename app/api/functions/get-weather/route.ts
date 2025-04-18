import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ weather: 'Sunny, 75°F' })
}
