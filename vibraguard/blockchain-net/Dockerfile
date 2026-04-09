FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose Hardhat port
EXPOSE 8545

# Set timezone to align with logs
ENV TZ=UTC

# Run Hardhat node bound to all interfaces
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]
