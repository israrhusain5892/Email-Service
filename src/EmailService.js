const ProviderA = require('./providers/ProviderA');
const ProviderB = require('./providers/ProviderB');

const RETRY_LIMIT = 5;
const INITIAL_BACKOFF = 1000; // 1 second
const RATE_LIMIT = 10000; // 10 seconds

class EmailService {
    constructor() {
        this.providerA = new ProviderA();
        this.providerB = new ProviderB();
        this.emailStatus = {};
        this.lastSendTime = 0;
    }

    async sendWithProvider(provider, to, subject, body, retryCount = 0) {
        const providerInstance = provider === 'A' ? this.providerA : this.providerB;
        try {
            await providerInstance.sendEmail(to, subject, body);
            this.emailStatus[to] = {
                success: true,
                provider: `Provider${provider}`,
                timestamp: Date.now()
            };
        } catch (error) {
            if (retryCount < RETRY_LIMIT) {
                const backoff = INITIAL_BACKOFF * Math.pow(2, retryCount);
                console.log(`Retrying (${retryCount + 1}/${RETRY_LIMIT}) after ${backoff}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                await this.sendWithProvider(provider, to, subject, body, retryCount + 1);
            } else {
                throw new Error(`Failed to send email after ${RETRY_LIMIT} retries`);
            }
        }
    }

    async sendEmail(to, subject, body) {
        const currentTime = Date.now();
        if (currentTime - this.lastSendTime < RATE_LIMIT) {
            throw new Error('Rate limit exceeded');
        }
        this.lastSendTime = currentTime;

        try {
            await this.sendWithProvider('A', to, subject, body);
        } catch (error) {
            try {
                await this.sendWithProvider('B', to, subject, body);
            } catch (finalError) {
                throw new Error('Both providers failed');
            }
        }
    }

    getStatus(to) {
        return this.emailStatus[to] || { success: false, provider: 'None', timestamp: 0 };
    }
}

module.exports = EmailService;
