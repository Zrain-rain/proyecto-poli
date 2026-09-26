/**
 * Gemini REST. La clave permanece en el Worker; nunca se valida por prefijo.
 * Dependencias opcionales para probar fallos y tiempos de espera sin red.
 */
export async function llamarGemini(apiKey, inputText, model = 'gemini-flash-latest', options = {}) {
  const { fetchImpl = fetch, timeoutMs = 12000 } = options;
  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    return { text: null, ok: false, reason: 'missing_key' };
  }
  const modelName = String(model || 'gemini-flash-latest').trim().replace(/^models\//, '');
  if (!/^[a-zA-Z0-9._-]+$/.test(modelName)) {
    return { text: null, ok: false, reason: 'invalid_model' };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const request = () => fetchImpl(
      'https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey.trim() },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: inputText }] }] }),
        signal: controller.signal
      }
    );
    let response = await request();
    // Un reintento para indisponibilidad temporal; comparte el timeout total.
    if ([502, 503, 504].includes(response.status)) {
      await response.body?.cancel();
      await new Promise(resolve => setTimeout(resolve, 300));
      response = await request();
    }
    if (!response.ok) {
      const reason = response.status === 429 ? 'quota'
        : [401, 403].includes(response.status) ? 'authentication'
        : response.status === 404 ? 'model_unavailable' : 'provider_error';
      // Extraer solo códigos conocidos, nunca claves, prompts ni el cuerpo del proveedor.
      let providerCode;
      try {
        const data = await response.json();
        const knownCodes = new Set(["ACCESS_TOKEN_TYPE_UNSUPPORTED", "API_KEY_INVALID", "API_KEY_EXPIRED", "API_KEY_SERVICE_BLOCKED", "SERVICE_DISABLED", "BILLING_DISABLED"]);
        providerCode = data.error?.details?.map(detail => detail.reason).find(code => knownCodes.has(code));
      } catch { /* El proveedor puede responder HTML o texto. */ }
      console.warn('Gemini no disponible', { status: response.status, reason, providerCode });
      return { text: null, ok: false, reason, providerStatus: response.status, ...(providerCode ? { providerCode } : {}) };
    }
    const data = await response.json();
    if (data.error) return { text: null, ok: false, reason: 'provider_error' };
    const candidate = data.candidates?.[0];
    if (data.promptFeedback?.blockReason ||
        (candidate?.finishReason && !['STOP', 'MAX_TOKENS'].includes(candidate.finishReason))) {
      return { text: null, ok: false, reason: 'blocked_response' };
    }
    const parts = candidate?.content?.parts;
    const text = Array.isArray(parts)
      ? parts.filter(part => !part.thought && typeof part.text === 'string')
        .map(part => part.text).join('\n').trim()
      : '';
    return text ? { text, ok: true } : { text: null, ok: false, reason: 'empty_response' };
  } catch {
    return { text: null, ok: false, reason: controller.signal.aborted ? 'timeout' : 'connection_error' };
  } finally {
    clearTimeout(timer);
  }
}
