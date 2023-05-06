const siteDomain = 'thebackyardbutler.com';
const toEmail = '';
const bccEmail = '';
const fromEmail = 'no-reply@' + siteDomain;

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    let content = '';
    let errorMsg = '';
    let name = '';
    let email = '';
    let subject = '';
    let message = '';

    // check the HTTP referer header
    const referer = request.headers.get('referer') || '';
    const refererMatch = referer.match(/^https?:\/\/([^/]+)/i);
    const refererDomain = refererMatch ? refererMatch[1] : '';
    if (!refererDomain.endsWith('.' + siteDomain) && refererDomain !== siteDomain) {
        errorMsg += 'Invalid referer.\n';
    }

    if (request.method === 'POST') {
        const formData = await request.formData();
        name = formData.get('name') || '';
        email = formData.get('email') || '';
        subject = formData.get('subject') || '';
        message = formData.get('message') || '';

        // check if name is blank
        if (!name.trim()) {
            errorMsg += 'Name is required.\n';
        }

        // check if email is not in a valid format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errorMsg += 'Invalid email format.\n';
        }

        // if there is an error, return an error response
        if (errorMsg) {
            return new Response(errorMsg, {
                status: 400,
                headers: { 'content-type': 'text/plain' },
            });
        }

        // concatenate the form data into a string
        content = `\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}\n`;
    }

    let send_request = new Request('https://api.mailchannels.net/tx/v1/send', {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json',
        },
        'body': JSON.stringify({
            'personalizations': [
                {
                    'to': [{
                        'email': toEmail,
                        'name': ''
                    }],
                    'bcc': [{
                        'email': bccEmail,
                        'name': ''
                    }],
                }
            ],

            'from': {
                'email': fromEmail,
                'name': name
            },
            'reply_to': {
                'email': email,
                'name': name
            },
            'subject': 'Online Request: ' + subject,
            'content': [{
                'type': 'text/plain',
                'value': content,
            }],
        }),
    });

    let respContent = '';

    if (request.method === 'POST') {
        const resp = await fetch(send_request);
        const respText = await resp.text();
        respContent = resp.status + ' ' + resp.statusText + '\n\n' + respText;
    }

    let htmlContent = '<html><head></head><body>' +
        '<form method="post">' +
        '<table>' +
        '<tr><td><label for="name">Name:</label></td><td><input type="text" id="name" name="name"></td></tr>' +
        '<tr><td><label for="email">Email:</label></td><td><input type="text" id="email" name="email"></td></tr>' +
        '<tr><td><label for="subject">Subject:</label></td><td><input type="text" id="subject" name="subject"></td></tr>' +
        '<tr><td><label for="message">Message:</label></td><td><textarea id="message" name="message"></textarea></td></tr>' +
        '<tr><td colspan="2"><input type="submit" value="Send"></td></tr>' +
        '</table>' +
        '</form>' +
        '<pre>' + respContent + '</pre>' +
        '</body></html>';

    return new Response(htmlContent, {
        headers: { 'content-type': 'text/html' },
    });
}