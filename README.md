# SneakSyncHub

A synchronized data processing platform with Elasticsearch, Kibana, PostgreSQL, and Telegram integration.

## Prerequisites

- Docker & Docker Compose
- Python 3.x
- Python venv module
- OpenSSL (for certificate generation)

## Setup Instructions

### 1. Environment Variables
Create `.env` file in project root:
```env
# PostgreSQL
POSTGRES_DB=sshub_db
POSTGRES_USER=sshub_user
POSTGRES_PASSWORD=strongpassword123

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Elasticsearch
ELASTIC_PASSWORD=elasticpassword123

# Kibana
KIBANA_PASSWORD=kibanapassword123

2. Generate Certificates
mkdir -p config/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout config/certs/elasticsearch.key \
  -out config/certs/elasticsearch.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

chmod 644 config/certs/elasticsearch.key

3. Docker Setup
docker-compose up -d

4. PostgreSQL Database Setup
docker exec -it sneak_sync_hub_postgres_1 createdb -U ${POSTGRES_USER} ${POSTGRES_DB}

5. Python Virtual Environment
python -m venv venv
source venv/bin/activate  # Linux/MacOS
# venv\Scripts\activate  # Windows
pip install -r requirements.txt

6. Run Application
python manage.py runserver

Configuration Summary
Service	Credentials	Port
Elasticsearch	elastic / ${ELASTIC_PASSWORD}	9200
Kibana	kibana_system / ${KIBANA_PASSWORD}	5601
PostgreSQL	
P
O
S
T
G
R
E
S
U
S
E
R
/
POSTGRES 
U
​
 SER/{POSTGRES_PASSWORD}	5432
Telegram Bot	Token: ${TELEGRAM_BOT_TOKEN}	-
Notes/Troubleshooting
Certificate Issues:

Ensure certificates have proper permissions

Regenerate certificates if seeing SSL errors
