// Solana wallet connector
class WalletConnector {
    constructor() {
        this.provider = null;
        this.walletAddress = null;
        this.checkExistingConnection();
        this.restoreConnection();
        setTimeout(updateDropdownUI, 100);
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
      
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            const phantomDeeplink = `phantom://wc?uri=${encodeURIComponent(window.location.href)}`;
            window.location.href = phantomDeeplink;

        setTimeout(() => {
            if (document.hasFocus()) {
                const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                const storeURL = isIOS
                    ? 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977'
                    : 'https://play.google.com/store/apps/details?id=com.phantom.app';
                window.location.href = storeURL;
            }
        }, 2000);

        return;
      }
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
        try{
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
            //refrsh page to update header with profile status
            setTimeout(()=> location.reload(), 500);
            }
        } catch (error){
            console.log('Backend regisgtration error:', error);
        }
        
    }
    // get CSRF token from django 
    getCSRFToken() {return document.querySelector('[name=csrfmiddlewaretoken]').value;}
 nb
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
    async updateWalletUI() {
        const btn = document.getElementById('wallet-connect-btn');
        const createDropbtn = document.getElementById('create-drop-btn');
        const setupProfileBtn = document.getElementById('setup-profile-btn');
    

     
        if (!btn) {
            console.error('Wallet connect button not found');
            return
        };
        if (this.walletAddress) {
            const a = this.walletAddress;
            const short = a.slice(0, 4) + '...' + a.slice(-4);
            btn.textContent = `🦊 ${short}`;
            btn.classList.remove('btn-outline-light');
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-success');
                    //to know if user has a profile
            const hasProfile = await this.checkUserProfile();
            console.log('User has profile:', hasProfile);
      
       if(hasProfile){
       //if has username, show createdrop & hide setup
       if (createDropbtn){
        createDropbtn.classList.remove('d-none');
       }
       if (setupProfileBtn){
        setupProfileBtn.classList.add('d-none')
       }
       } else{
        if (createDropbtn){
            createDropbtn.classList.add('d-none');
        }
        if (setupProfileBtn){
            setupProfileBtn.classList.remove('d-none')
        }
       }
       

         //   if (createDropbtn) {
           //     createDropbtn.classList.remove('d-none');
            //}
        } else {
            btn.textContent = 'Connect Wallet';
            btn.classList.remove('btn-success');
            btn.classList.add('btn-outline-light');

            if (createDropbtn) createDropbtn.classList.add('d-none');
            if(setupProfileBtn) setupProfileBtn.classList.add('d-none')    
            
        }
    }
 async checkUserProfile(){
    try{
        const response = await fetch(`/api/user/has-profile/?wallet=${this.walletAddress}`);
        const data = await response.json();
        console.log('Profile check response:', data);
        return data.has_profile;
    }catch (error) {
        console.log('Error checking profile: ', error);
        return false;
    }
 }

    // hide modal safely
    hideModal() {
        const modalEl = document.getElementById('walletModal');
        if (!modalEl) return;
        const modal = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.hide();
    }

    //disconnect wallet buttons
    disconnectWallet() {
        //clear local storgae
        localStorage.removeItem('walletAddress');

        //reset wallet
        this.walletAddress = null;
        this.provider =null;

        //update ui
        this.updateWalletUI();

        console.log('Wallet Disconnected')
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

function disconnectWallet() {
    if (window.walletConnector) {
        window.walletConnector.disconnectWallet();
        //update dropdown ui
        updateWalletUI()
    }
}

function updateDropdownUI(){
    const connectOptions = document.querySelectorAll('.connect-option');
    const disconnectOption = document.querySelector('.disconnect-option');

    if (window.walletConnector && window.walletConnector.walletAddress){
        // show disconnect when connected
        connectOptions.forEach(opt => opt.classList.add('d-none'));
        disconnectOption.classList.remove('d-none')
    } else{
        //show connect when disconnected
        connectOptions.forEach(opt => opt.classList.remove('d-none'));
        disconnectOption.classList.add('d-none');
    }
}