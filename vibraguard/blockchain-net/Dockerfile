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

# Start Hardhat node and deploy the WorkOrderRegistry contract automatically
CMD ["sh", "-c", "npx hardhat node --hostname 0.0.0.0 & sleep 5 && npx hardhat run scripts/deploy.js --network localhost && wait"]
