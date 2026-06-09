import { NextResponse } from 'next/server'
import { buildHeadlineSvg } from '@/lib/templates/common'
import sharp from 'sharp'

export async function GET() {
  try {
    const W = 1024
    const H = 1024
    const lines = [
      "THIS IS A VERY LONG HEADLINE THAT WILL CERTAINLY EXCEED FOURTEEN CHARS",
      "ANOTHER LINE THAT IS REALLY LONG TOO"
    ]
    
    const svg = buildHeadlineSvg({
      W,
      H,
      lines,
      accentWord: "LONG",
      position: "center"
    })
    
    const buffer = await sharp({
      create: {
        width: W,
        height: H,
        channels: 4,
        background: { r: 15, g: 15, b: 20, alpha: 1 }
      }
    })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer()
    
    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || err })
  }
}
