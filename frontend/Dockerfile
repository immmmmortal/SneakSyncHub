FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --force --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm","run", "dev"]