import * as Brevo from '@getbrevo/brevo'

const apiInstance = new Brevo.TransactionalEmailsApi()

apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY!
)

export async function sendEmail(
    to: string,
    subject: string,
    htmlContent: string
) {
    try {
        await apiInstance.sendTransacEmail({
            sender: {
                email: 'yashsaxena2110@gmail.com',
                name: 'DebugDiary'
            },
            to: [{ email: to }],
            subject,
            htmlContent
        })
        console.log('Email sent to:', to)
    } catch (err) {
        console.error('Email send failed:', err)
    }
}
