// Voz del navegador: dictado bajo acción explícita y lectura opcional.
window.createZetabotVoice = function ({ input, mic, enabled, replay, stop, status }) {
    if (![input, mic, enabled, replay, stop, status].every(Boolean)) return null;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synth = window.speechSynthesis;
    const canSpeak = !!(synth && window.SpeechSynthesisUtterance);
    let recognition = null;
    let listening = false;
    let busy = false;
    let disposed = false;
    let lastReply = '';
    let utterance = null;

    const sayStatus = text => { if (!disposed) status.textContent = text; };
    const update = () => {
        mic.disabled = disposed || busy || !Recognition;
        mic.textContent = listening ? 'Detener dictado' : '🎤 Dictar';
        mic.setAttribute('aria-pressed', String(listening));
        replay.disabled = disposed || !canSpeak || !lastReply || listening || busy;
        stop.disabled = !utterance;
    };
    const silence = () => {
        if (utterance && synth) {
            utterance.onend = null;
            utterance.onerror = null;
            synth.cancel();
        }
        utterance = null;
        update();
    };
    const endDictation = () => {
        if (recognition) {
            const current = recognition;
            recognition = null;
            current.onresult = current.onend = current.onerror = null;
            current.abort();
        }
        listening = false;
        update();
    };
    const speak = () => {
        if (disposed || !canSpeak || !lastReply || listening) return;
        silence();
        const plain = lastReply.replace(/\*\*/g, '').replace(/[#_*]/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/https?:\/\/\S+/g, '')
            .replace(/^Zetabot:\s*/i, '').trim();
        const speech = new window.SpeechSynthesisUtterance(plain);
        speech.lang = 'es-CL';
        const voices = synth.getVoices();
        const spanish = voices.find(v => v.lang.toLowerCase() === 'es-cl') ||
            voices.find(v => v.lang.toLowerCase().startsWith('es'));
        if (spanish) speech.voice = spanish;
        utterance = speech;
        speech.onend = () => {
            if (utterance !== speech || disposed) return;
            utterance = null; update(); sayStatus('Lectura terminada.');
        };
        speech.onerror = () => {
            if (utterance !== speech || disposed) return;
            utterance = null; update();
            sayStatus('No se pudo reproducir la voz. Puedes leer la respuesta en el chat.');
        };
        try {
            synth.speak(speech);
            update(); sayStatus('Leyendo respuesta…');
        } catch {
            utterance = null; update();
            sayStatus('La voz no está disponible. La respuesta sigue en el chat.');
        }
    };
    const onMic = () => {
        if (disposed || busy || !Recognition) return;
        if (listening) {
            recognition?.stop();
            return;
        }
        silence();
        const before = input.value.trim();
        let current;
        try {
            current = new Recognition();
            recognition = current;
            current.lang = 'es-CL';
            current.continuous = false;
            current.interimResults = false;
            current.onresult = event => {
                if (disposed || recognition !== current || busy) return;
                const text = Array.from(event.results).filter(result => result.isFinal)
                    .map(result => result[0].transcript).join(' ').trim();
                if (text) {
                    input.value = [before, text].filter(Boolean).join(' ');
                    sayStatus('Dictado listo. Revisa el texto y pulsa Enviar.');
                }
            };
            current.onerror = event => {
                if (disposed || recognition !== current) return;
                const messages = {
                    'not-allowed': 'Permiso de micrófono denegado. Habilítalo en los permisos del sitio o escribe tu mensaje.',
                    'service-not-allowed': 'El navegador no permite el dictado. Puedes escribir tu mensaje.',
                    'audio-capture': 'No se encontró un micrófono disponible.',
                    'no-speech': 'No se detectó voz. Vuelve a pulsar Dictar.',
                    'network': 'El dictado necesita conexión. Puedes escribir tu mensaje.',
                    'aborted': 'Dictado detenido.'
                };
                sayStatus(messages[event.error] || 'No se pudo dictar. Puedes escribir tu mensaje.');
            };
            current.onend = () => {
                if (disposed || recognition !== current) return;
                recognition = null; listening = false; update();
                if (status.textContent === 'Escuchando… habla ahora.') sayStatus('Dictado finalizado. Puedes revisar el texto.');
            };
            listening = true;
            update(); sayStatus('Escuchando… habla ahora.');
            current.start();
        } catch {
            endDictation();
            sayStatus('No se pudo iniciar el micrófono. Revisa los permisos o escribe tu mensaje.');
        }
    };
    const onEnabled = () => {
        if (!enabled.checked) silence();
        sayStatus(enabled.checked ? 'Leeré las próximas respuestas. También puedes escuchar la última.' : 'Lectura automática desactivada.');
    };
    const onStop = () => { silence(); sayStatus('Lectura detenida.'); };
    mic.addEventListener('click', onMic);
    enabled.addEventListener('change', onEnabled);
    replay.addEventListener('click', speak);
    stop.addEventListener('click', onStop);
    enabled.disabled = !canSpeak;
    if (!Recognition) sayStatus('Este navegador no admite dictado. Puedes escribir tu mensaje.');
    if (!canSpeak) sayStatus('La lectura en voz alta no está disponible en este navegador.');
    update();

    const controller = {
        reply(text) {
            if (disposed) return;
            lastReply = String(text || '');
            update();
            if (enabled.checked) speak();
        },
        setBusy(value) {
            if (disposed) return;
            busy = value;
            if (busy) { endDictation(); silence(); }
            update();
        },
        dispose() {
            if (disposed) return;
            disposed = true;
            endDictation(); silence();
            mic.removeEventListener('click', onMic);
            enabled.removeEventListener('change', onEnabled);
            replay.removeEventListener('click', speak);
            stop.removeEventListener('click', onStop);
            window.removeEventListener('pagehide', controller.dispose);
        }
    };
    window.addEventListener('pagehide', controller.dispose);
    return controller;
};
