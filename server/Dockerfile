FROM node:22-alpine

ENV TZ=America/Toronto
RUN ln -snf /usr/share/zoneinfo/"$TZ" /etc/localtime && echo "$TZ" > /etc/timezone

WORKDIR '/'
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .

CMD ["npm", "start"]

# Healthcheck (runs inside container)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1