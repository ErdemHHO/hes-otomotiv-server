# Base image
FROM node:20-bullseye

# Çalışma dizini oluşturun ve içine geçin
WORKDIR /app

# Bağımlılıkları kopyalayın
COPY package.json ./
COPY package-lock.json ./

# Bağımlılıkları yükleyin
RUN npm install

# Nodemon'u global olarak yükleyin (Geliştirme için)
RUN npm install nodemon

# Nodemon'u global olarak yükleyin (Geliştirme için)
RUN npm install -g nodemon

# Uygulama kaynak kodunu kopyalayın
COPY . .

# Uygulamayı çalıştırın
CMD ["npm", "start"]
