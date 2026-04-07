FROM node:22-alpine
WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN find . -name "*.spec.ts" -delete 2>/dev/null || true
RUN yarn build

EXPOSE 8000
CMD ["node", "dist/src/main"]
