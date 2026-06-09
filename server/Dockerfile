# 1. Start with a standard Node.js environment
FROM node:20-slim

# 2. Install Python 3 and pip directly into the machine
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 3. Copy over your Node package configuration and install them
COPY package*.json ./
RUN npm install

# 4. Copy the rest of your project files (including your scraper folder)
COPY . .

# 5. Install your python scraper packages globally inside the container
RUN pip3 install --no-cache-dir -r scraper/requirements.txt --break-system-packages

# 6. Start your Node server
EXPOSE 3000
CMD ["npm", "start"]