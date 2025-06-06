const express = require('express');
const EmailService = require('./EmailService');

const app = express();
const port = 4000;
const emailService = new EmailService();

app.use(express.json());

app.post('/email', async (req, res) => {
   
   

    try {
        const response=await emailService.sendEmail(req.body);
        res.status(200).json({ response});
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
