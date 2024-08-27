class ProviderB {
    async sendEmail(to, subject, body) {
        // Simulate email sending and possible failure
        if (Math.random() > 0.8) throw new Error('ProviderB failed');
        console.log(`ProviderB sent email to ${to}`);
    }
}

module.exports = ProviderB;
