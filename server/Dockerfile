# Start with a standard Node.js environment
FROM node:22-slim

# Install Python 3 and pip directly into the machine
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy over Node package configuration and install
COPY package*.json ./
RUN npm install

# Copy over the rest of server code
COPY . .

# Install python scraper packages globally inside the container
RUN pip3 install --no-cache-dir -r scraper/requirements.txt --break-system-packages

# Expose the server port and start the server
EXPOSE 3000
CMD ["npm", "start"]