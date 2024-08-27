const express = require('express');
const EmailService = require('./EmailService');

const app = express();
const port = 3000;
const emailService = new EmailService();

app.use(express.json());

app.post('/send-email', async (req, res) => {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await emailService.sendEmail(to, subject, body);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/email-status/:to', (req, res) => {
    const { to } = req.params;
    const status = emailService.getStatus(to);
    res.status(200).json(status);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
