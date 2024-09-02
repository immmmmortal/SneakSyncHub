# Use the official Python image from the Docker Hub
FROM python:3.12

# Set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Copy certificates into the container
COPY certificates /certificates

# Expose port 8000
EXPOSE 8000

# Command to run migrations, rebuild search index, and start the Django server
CMD ["sh", "-c", "python manage.py migrate && python manage.py search_index --rebuild && python manage.py runserver_plus 0.0.0.0:8000 --cert-file /certificates/django/localhost.crt"]
