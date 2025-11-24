import { NextRequest, NextResponse } from 'next/server';
import { chatWithAgent } from '@/lib/gemini';
import { requireAuth } from '@/lib/auth-helpers';
import { handleAPIError, handleValidationError } from '@/lib/error-handler';
import { ChatAgentSchema, validateInput, sanitizeAIInput } from '@/lib/validation-schemas';

export async function POST(req: NextRequest) {
  // SECURITY: Verifica autenticazione
  const authError = await requireAuth(req);
  if (authError) {
    return authError;
  }

  try {
    const body = await req.json();

    // SECURITY: Validazione input
    const validation = validateInput(ChatAgentSchema, body);
    if (!validation.success) {
      return handleValidationError(validation.error, 'AI_AGENT');
    }

    const { message, context } = validation.data;

    // SECURITY: Sanitizza input per prevenire prompt injection
    const sanitizedMessage = sanitizeAIInput(message);
    const sanitizedContext = sanitizeAIInput(context || '');

    const response = await chatWithAgent(sanitizedContext, sanitizedMessage);
    return NextResponse.json({ response });
  } catch (error) {
    // SECURITY: Gestione sicura errori
    return handleAPIError(error, 'AI_AGENT', 'Errore AI Agent');
  }
}
