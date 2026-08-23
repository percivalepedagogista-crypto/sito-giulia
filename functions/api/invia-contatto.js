export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const nome = formData.get('name');
    const email = formData.get('email');
    const messaggio = formData.get('message');

    const RESEND_API_KEY = context.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: "Chiave API mancante" }), { status: 500 });
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
        reply_to: email,
      }),
    });

    if (resendResponse.ok) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      const errorData = await resendResponse.json();
      return new Response(JSON.stringify({ success: false, error: errorData }), { status: 400 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
