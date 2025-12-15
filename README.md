# reveal.wtf 

Secret NFT drops platform - Pay to reveal what's hidden.

🚀## Features

- **Wallet Authentication** - Connect with Phantom/Solflare
- **Secret Drops** - Upload encrypted art that's revealed after payment
- **Real Solana Payments** - Integrated with Solana devnet/mainnet
- **Artist Profiles** - Unique usernames with social verification
- **Digital Scarcity** - 1/1 editions disappear after purchase
- **Search & Discovery** - Find artists and drops easily

## Tech Stack

- **Backend:** Django 5.2 + PostgreSQL
- **Frontend:** Bootstrap 5 (Dark Theme)
- **Blockchain:** Solana Web3.js
- **Encryption:** cryptography (Fernet)
- **Database:** Neon (Serverless PostgreSQL)
- **Deployment:** Railway/Vercel

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/yourusername/reveal.wtf.git
cd reveal.wtf

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Environment variables
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
