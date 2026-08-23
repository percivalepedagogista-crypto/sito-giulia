export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    
    // Recupera i valori tollerando sia inglese (name) che italiano (nome)
    const nome = formData.get('name') || formData.get('nome') || 'Utente dal sito';
    const email = formData.get('email') || '';
    const messaggio = formData.get('message') || formData.get('messaggio') || '';

    const RESEND_API_KEY = context.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: "Chiave API mancante su Cloudflare" }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepara il corpo della richiesta a Resend
    const payload = {
      from: 'Modulo Contatti <onboarding@resend.dev>',
      to: ['percivale.pedagogista@gmail.com'],
      subject: `Nuovo messaggio da ${nome} via giuliapercivale.it`,
      html: `
        <h3>Hai ricevuto una nuova richiesta dal sito:</h3>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email mittente:</strong> ${email}</p>
        <p><strong>Messaggio:</strong></p>
        <p>${messaggio}</p>
      `,
    };

    // Aggiunge reply_to solo se l'email è stata effettivamente compilata
    if (email && email.trim() !== '') {
      payload.reply_to = email.trim();
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const resendData = await resendResponse.json();

    if (resendResponse.ok) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ success: false, error: resendData }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}