class ProviderA {
    async sendEmail(to, subject, body) {
        // Simulate email sending and possible failure
        if (Math.random() > 0.8) throw new Error('ProviderA failed');
        console.log(`ProviderA sent email to ${to}`);
    }
}

module.exports = ProviderA;
