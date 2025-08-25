# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# 宣告一個建置參數
ARG VITE_SYSTEM_Name
ARG VITE_SYSTEM_Description
ARG VITE_SYSTEM_Version
ARG VITE_FUND_FACTORY_ADDRESS
ARG VITE_USDC_ADDRESS
ARG VITE_WETH_ADDRESS
ARG VITE_ASVT_ADDRESS
# 將建置參數設定為環境變數，讓 build 指令可以存取
ENV VITE_SYSTEM_Name=$VITE_SYSTEM_Name
ENV VITE_SYSTEM_Description=$VITE_SYSTEM_Description
ENV VITE_SYSTEM_Version=$VITE_SYSTEM_Version
ENV VITE_FUND_FACTORY_ADDRESS=$VITE_FUND_FACTORY_ADDRESS
ENV VITE_USDC_ADDRESS=$VITE_USDC_ADDRESS
ENV VITE_WETH_ADDRESS=$VITE_WETH_ADDRESS
ENV VITE_ASVT_ADDRESS=$VITE_ASVT_ADDRESS


COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Production Stage ---
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]