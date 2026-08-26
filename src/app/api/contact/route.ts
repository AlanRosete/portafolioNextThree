import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { construirCorreo } from "@/lib/contactEmail";

/**
 * Envío del formulario de contacto.
 *
 * El mensaje se guarda en DynamoDB. Configura en .env.local (y en las
 * variables de entorno de Vercel):
 *   CONTACT_AWS_REGION=us-east-1
 *   CONTACT_TABLE_NAME=portafolio-contacto
 *   CONTACT_AWS_ACCESS_KEY_ID=AKIA…
 *   CONTACT_AWS_SECRET_ACCESS_KEY=…
 *
 * Las credenciales son de un usuario IAM con un solo permiso:
 * dynamodb:PutItem sobre esa tabla. No pueden leer ni borrar nada.
 *
 * Opcionalmente, si además defines RESEND_API_KEY y CONTACT_TO_EMAIL,
 * te llega un correo con el mensaje. El correo es notificación, no
 * almacenamiento: si Resend falla, el mensaje ya quedó guardado.
 */

type Payload = { name?: string; email?: string; message?: string };

type Mensaje = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  message: string;
  ip: string | null;
  userAgent: string | null;
};

const region = process.env.CONTACT_AWS_REGION ?? "us-east-1";
const tableName = process.env.CONTACT_TABLE_NAME;
const accessKeyId = process.env.CONTACT_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.CONTACT_AWS_SECRET_ACCESS_KEY;

// El cliente se crea una sola vez por instancia y se reutiliza entre
// invocaciones: abrir la conexión en cada request desperdicia el warm start.
const docClient =
  tableName && accessKeyId && secretAccessKey
    ? DynamoDBDocumentClient.from(
        new DynamoDBClient({
          region,
          credentials: { accessKeyId, secretAccessKey },
        })
      )
    : null;

async function notificarPorCorreo(mensaje: Mensaje) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return;

  const from = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";
  const { subject, html, text } = construirCorreo(mensaje);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Portafolio <${from}>`,
        to: [to],
        // Así, darle "Responder" en Gmail le contesta a quien escribió.
        reply_to: mensaje.email,
        subject,
        html,
        text,
      }),
    });
    if (!response.ok) {
      console.error("[contact] Resend error:", await response.text());
    }
  } catch (error) {
    console.error("[contact] Resend inalcanzable:", error);
  }
}

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

  if (!docClient || !tableName) {
    console.warn("[contact] DynamoDB sin configurar; mensaje no guardado.");
    return NextResponse.json(
      { error: "Contact storage is not configured." },
      { status: 501 }
    );
  }

  const mensaje: Mensaje = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    name,
    email,
    message,
    // Para rastrear abuso si alguien decide llenar la tabla de basura.
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: request.headers.get("user-agent") ?? null,
  };

  try {
    await docClient.send(
      new PutCommand({ TableName: tableName, Item: mensaje })
    );
  } catch (error) {
    console.error("[contact] DynamoDB error:", error);
    return NextResponse.json({ error: "Delivery failed." }, { status: 502 });
  }

  // El mensaje ya está a salvo; el correo es un extra que no debe tumbar
  // la respuesta si falla.
  await notificarPorCorreo(mensaje);

  return NextResponse.json({ ok: true });
}
