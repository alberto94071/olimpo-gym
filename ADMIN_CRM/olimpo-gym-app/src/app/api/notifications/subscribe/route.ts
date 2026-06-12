// Este endpoint es reemplazado por PUT /api/mobile/push-token (Expo Push Tokens).
// Se mantiene para compatibilidad pero redirige al nuevo flujo.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Este endpoint está obsoleto. Usa PUT /api/mobile/push-token con un Expo Push Token.",
    },
    { status: 410 }
  );
}
