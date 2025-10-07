FROM node:20-alpine
WORKDIR /srv
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
EXPOSE 3001
CMD ["npm","run","start"]
