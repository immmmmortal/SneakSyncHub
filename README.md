# SneakSyncHub

SneakSyncHub is a web scraping tool specifically designed to extract detailed information about sneakers from various online retail and sneaker websites.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [Docker Setup](#docker-setup)
  - [Virtual Environment & Dependencies](#virtual-environment--dependencies)
  - [Elasticsearch Setup](#elasticsearch-setup)
  - [PostgreSQL Setup](#postgresql-setup)
  - [Telegram Bot Token Setup](#telegram-bot-token-setup)
- [Running the Application](#running-the-application)
- [License](#license)

## Prerequisites

Before setting up SneakSyncHub, make sure you have the following installed on your machine:

- Docker & Docker Compose
- Python 3.8+ (for running locally)
- PostgreSQL (for database setup)
- Telegram Bot Token (for notifications)

## Setup Instructions

### Docker Setup

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/immmmmortal/SneakSyncHub.git
   cd SneakSyncHub
   ```

2. Build and start the Docker containers:

   ```bash
   docker-compose up --build
   ```

   This will:
   - Build the Docker images for the application, PostgreSQL, and Elasticsearch.
   - Start the application, PostgreSQL, Elasticsearch, and Kibana services.

3. Once the containers are running, you can access:
   - **Kibana** at [http://localhost:5601](http://localhost:5601)
   - **Elasticsearch** at [http://localhost:9200](http://localhost:9200)

### Virtual Environment & Dependencies

If you prefer running the project locally (without Docker), follow these steps:

1. Create and activate a virtual environment:

   ```bash
   python3 -m venv venv
   source venv/bin/activate   # For macOS/Linux
   .\venv\Scripts\activate    # For Windows
   ```

2. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

### Elasticsearch Setup

SneakSyncHub requires Elasticsearch for data storage. It must be configured with certificates and passwords. Follow these steps to set up Elasticsearch:

1. Generate certificates for Elasticsearch:

   You can use **OpenSSL** to generate certificates, or follow Elasticsearch's official guide to set up certificates.

   ```bash
   openssl genpkey -algorithm RSA -out elasticsearch.key
   openssl req -new -key elasticsearch.key -out elasticsearch.csr
   openssl x509 -req -days 365 -in elasticsearch.csr -signkey elasticsearch.key -out elasticsearch.crt
   ```

   Place the `elasticsearch.key`, `elasticsearch.crt`, and `elasticsearch.csr` files in the `./elasticsearch/certificates/` directory.

2. Set the passwords for Elasticsearch and Kibana:

   Set the passwords for `elastic` and `kibana` users:

   ```bash
   docker exec -it <elasticsearch_container_id> bin/elasticsearch-setup-passwords interactive
   ```

   Follow the prompts to set the passwords.

3. Restart the Elasticsearch service to apply the password changes:

   ```bash
   docker-compose restart elasticsearch
   ```

### PostgreSQL Setup

SneakSyncHub uses PostgreSQL for storing user and sneaker data. To create the required database:

1. Connect to PostgreSQL inside the Docker container:

   ```bash
   docker exec -it <postgres_container_id> psql -U postgres
   ```

2. Create the necessary database and user:

   ```sql
   CREATE DATABASE sneak_sync;
   CREATE USER sneak_user WITH PASSWORD 'your_password';
   ALTER ROLE sneak_user SET client_encoding TO 'utf8';
   ALTER ROLE sneak_user SET default_transaction_isolation TO 'read committed';
   ALTER ROLE sneak_user SET timezone TO 'UTC';
   GRANT ALL PRIVILEGES ON DATABASE sneak_sync TO sneak_user;
   ```

3. Update your `settings.py` to reflect the database credentials.

### Telegram Bot Token Setup

SneakSyncHub sends notifications via a Telegram bot. To set it up:

1. Create a Telegram bot by talking to [BotFather](https://core.telegram.org/bots#botfather).
2. Get the bot token after creating your bot.
3. Set the bot token in the environment variables:

   ```bash
   export TELEGRAM_BOT_TOKEN="your_bot_token"
   ```

   Alternatively, add it to a `.env` file:

   ```env
   TELEGRAM_BOT_TOKEN="your_bot_token"
   ```

## Running the Application

1. **Start the application**:

   If you're using Docker, run:

   ```bash
   docker-compose up
   ```

   If you're running locally (without Docker), simply use:

   ```bash
   python manage.py runserver
   ```

2. The application should now be up and running.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**SneakSyncHub** is developed and maintained by [immmmmortal](https://github.com/immmmmortal).
