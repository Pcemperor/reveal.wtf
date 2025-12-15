// Solana wallet connector
class WalletConnector {
    constructor() {
        this.provider = null;
        this.walletAddress = null;
        this.checkExistingConnection();
        this.restoreConnection();
    }


    checkExistingConnection(){
        const savedAddress = localStorage.getItem('walletAddress');
        if (savedAddress){
            this.walletAddress = savedAddress;

            if (window.solana && window.solana.isPhantom){
                this.provider = window.solana;
                console.log('Restored phantom provider');
            }else if (window.solflare && window.solflare.isSolflare){
                this.provider - window.solflare;
                console.log('restored solflare provider');
            }

            this.updateWalletUI()
            console.log('Restored wallet connection:', this.walletAddress);
        }
    }


    //restoreConnection on page load
    async restoreConnection(){
        const savedAddress = localStorage.getItem('walletAddress');
        if (savedAddress){
            this.walletAddress = savedAddress;
            this.updateWalletUI();
            //reconect to provider
            await this.autoReconnect();
        }
    }

    //to auto-autoReconnect to wallet
    async autoReconnect() {
        if (window.solana && window.solana.isConnected){
            this.provider = window.solana;
            try{
                await this.provider.connect();
                console.log('Auto reconect to Phantom');
            } catch (error){
                console.log('Auto reconnect failed:', error);
            }
        }
    }

    // connect to Phantom
    async connectPhantom() {
        try {
            if (!window.solana || !window.solana.isPhantom) {
                alert('Phantom wallet not found! Please install Phantom.');
                return;
            }
            this.provider = window.solana;

            // connect to wallet
            const response = await this.provider.connect();
            // response may expose publicKey (note the capital K)
            this.walletAddress = (response?.publicKey || this.provider?.publicKey)?.toString();
            //save to localStorage
            localStorage.setItem('walletAddress', this.walletAddress);
            // update ui
            this.updateWalletUI();
            this.hideModal();

            await this.registerWithBackend(this.walletAddress);
        } catch (error) {
            console.error('Phantom connection failed:', error);
                    console.error('Phantom connection failed:', error);
                    // Log all error properties for debugging
                    if (error && typeof error === 'object') {
                        for (const key in error) {
                            if (Object.prototype.hasOwnProperty.call(error, key)) {
                                console.error(`Error property [${key}]:`, error[key]);
                            }
                        }
                    }
                    alert('Wallet Connection Failed: ' + (error?.message || error));
    }
      
    }
     // register wallet with django session
    async registerWithBackend(walletAddress) {
        const response = await fetch('/api/wallet_login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken(),
            },
            body: JSON.stringify({ wallet_address: walletAddress }),
        });
        if (response.ok) {
            console.log('Wallet registered with backend successfully.');
            }
    }
    // get CSRF token from django 
    getCSRFToken() {return document.querySelector('[name=csrfmiddlewaretoken]').value;}




    // connect to Solflare
    async connectSolflare() {
        try {
            if (!window.solflare || !window.solflare.isSolflare) {
                alert('Solflare wallet not found. Please install Solflare.');
                return;
            }
            this.provider = window.solflare;
            const response = await this.provider.connect();
            this.walletAddress = (response?.publicKey || this.provider?.publicKey)?.toString();

            this.updateWalletUI();
            this.hideModal();
        } catch (error) {
            console.error('Solflare connection failed:', error);
            alert('Wallet Connection failed: ' + (error?.message || error));
        }
    }

    // update UI after connect
    updateWalletUI() {
        const btn = document.getElementById('wallet-connect-btn');
        const createDropbtn = document.getElementById('create-drop-btn');
        if (!btn) return;

        if (this.walletAddress) {
            const a = this.walletAddress;
            const short = a.slice(0, 4) + '...' + a.slice(-4);
            btn.textContent = `🦊 ${short}`;
            btn.classList.remove('btn-outline-light');
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-success');
            if (createDropbtn) {
                createDropbtn.classList.remove('d-none');
            }
        } else {
            btn.textContent = 'Connect Wallet';
            btn.classList.remove('btn-success');
            btn.classList.add('btn-outline-light');
            if (createDropbtn) {
                createDropbtn.classList.add('d-none');
            }
        }
    }

    // hide modal safely
    hideModal() {
        const modalEl = document.getElementById('walletModal');
        if (!modalEl) return;
        const modal = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.hide();
    }
}



// global instance
const wallet = new WalletConnector();

// global functions for modal buttons (templates call these)
function connectPhantom() {
    wallet.connectPhantom();
}

function connectSolflare() {
    wallet.connectSolflare();
}

// expose to window
window.wallet = wallet;
window.connectPhantom = connectPhantom;
window.connectSolflare = connectSolflare;
// Make walletConnector globally available for all pages
window.walletConnector = wallet;