#!/bin/bash

# Update package list
sudo apt update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt-get install -y git

# Clone the repository (uncomment and replace with your actual repository URL)
# git clone https://github.com/yourusername/photo-management-system.git
# cd photo-management-system

# Install project dependencies
npm install

# Install additional dependencies (shadcn/ui components added to git)
npm install axios date-fns lucide-react

# Create a components folder if it doesn't exist
mkdir -p components/ui

# Create a lib folder and utils.ts file if they don't exist
mkdir -p lib
touch lib/utils.ts

# Add content to utils.ts
echo "import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}" > lib/utils.ts

# Update next.config.js to add transpilePackages
echo "/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react'],
}

module.exports = nextConfig" > next.config.js

# Build the project
npm run build

echo "Setup complete! You can now start the development server with 'npm run dev'"
