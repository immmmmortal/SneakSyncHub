# Use the official Python image from the Docker Hub
FROM python:3.12

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory
WORKDIR /app

# Install system dependencies (if any)
# For example, if you need build tools:
# RUN apt-get update && apt-get install -y build-essential libpq-dev

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Copy the rest of the application code into the container
COPY . .

# Copy certificates into the container
COPY certificates /certificates
RUN python manage.py collectstatic --noinput

# Expose port 8000
EXPOSE 8000

# Command to run migrations, rebuild search index, and start Gunicorn
CMD ["sh", "-c", "ls -la /app && python manage.py migrate && python manage.py collectstatic --noinput && gunicorn sneaksynchub.wsgi:application --bind 0.0.0.0:8000 --certfile /certificates/django/localhost.crt --keyfile /certificates/django/localhost.key --chdir /app"]

