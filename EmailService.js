
const RETRY_LIMIT = 5;
const INITIAL_BACKOFF = 1000; // 1 second
const RATE_LIMIT = 10000; // 10 seconds


class ProviderA {
    async sendEmail(to, subject, body) {
        if (!to) throw new Error({ msg: 'ProviderA failed', status: 500 });
        return { msg: `ProviderA sent email to ${to}`, status: 200 };
    }
}

class ProviderB {
    async sendEmail(to, subject, body) {
        if (!to) throw new Error({ msg: 'ProviderB failed', status: 500 });
        return { msg: `ProviderB sent email to ${to}`, status: 200 };
    }
}

class EmailService {
    constructor() {
        this.providerA = new ProviderA();
        this.providerB = new ProviderB();
        this.emailStatus = {};
        this.lastSendTime = 0;
        this.idempotencyCache = new Set();
        this.statusLog = new Map();

    }

     async sendWithProvider(provider, to, subject, body, retryCount = 0) {
        const providerInstance = provider === 'A' ? this.providerA : this.providerB;
        try {
            const currentTime = Date.now();
            if (currentTime - this.lastSendTime < RATE_LIMIT) {
                return ('Rate limit exceeded you can resend email after 10 second');
            }
             const success = await providerInstance.sendEmail(to, subject, body);
            if (success) {

                this.emailStatus[to] = {
                    message: "Email send succesfully!!",
                    success: true,
                    provider: `Provider${provider}`,
                    timestamp: Date.now()
                };

                this.lastSendTime = currentTime;
                return this.emailStatus[to];

            }

            return success;

        } catch (error) {

            console.log(retryCount)
            if (retryCount < RETRY_LIMIT) {
                const backoff = INITIAL_BACKOFF * Math.pow(2, retryCount);
                console.log(`Retrying (${retryCount + 1}/${RETRY_LIMIT}) after ${backoff}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                return await this.sendWithProvider(provider, to, subject, body, retryCount + 1);
            } else {

                throw new Error(`Failed to send email after ${retryCount} retries`);
            }
        }
    }

    async sendEmail(payload) {
        //  check duplicate email send
        if (this.idempotencyCache.has(payload.idempotencyKey)) {
            throw new Error(`[SKIPPED] Duplicate send attempt with key: ${payload.idempotencyKey}`);
        }
         try {
            const res = await this.sendWithProvider('B', payload.to, payload.subject, payload.body);
            if (res) {
                this.idempotencyCache.add(payload.idempotencyKey);
            }
            return res;

        } catch (error) {
            throw new Error(error.message, 'Both providers failed');
        }

    }


    getStatus(to) {
        return this.emailStatus[to] || { success: false, provider: 'None', timestamp: 0 };
    }


}

module.exports = EmailService;
