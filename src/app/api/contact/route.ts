import { NextResponse } from "next/server";

/**
 * Envío del formulario de contacto.
 *
 * Configura estas variables en .env.local para activarlo:
 *   RESEND_API_KEY=re_xxx        (https://resend.com — plan gratuito)
 *   CONTACT_TO_EMAIL=tu@correo.com
 *   CONTACT_FROM_EMAIL=onboarding@resend.dev   (o tu dominio verificado)
 *
 * Sin esas variables la ruta responde 501 y el formulario muestra el
 * fallback de "escríbeme directo", en vez de fingir que envió.
 */

type Payload = { name?: string; email?: string; message?: string };

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  // La validación del cliente es UX; esta es la que cuenta.
  if (!name || name.length > 100)
    return NextResponse.json({ error: "Invalid name." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254)
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  if (message.length < 10 || message.length > 5000)
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!apiKey || !to) {
    console.warn(
      "[contact] RESEND_API_KEY o CONTACT_TO_EMAIL sin configurar; mensaje no enviado."
    );
    return NextResponse.json(
      { error: "Email delivery is not configured." },
      { status: 501 }
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Portfolio <${from}>`,
      to: [to],
      reply_to: email,
      subject: `New portfolio message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    }),
  });

  if (!response.ok) {
    console.error("[contact] Resend error:", await response.text());
    return NextResponse.json({ error: "Delivery failed." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
