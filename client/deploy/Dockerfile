# Build the React app
FROM node:18 AS build
WORKDIR /app

# Accept build-time arguments (Only available during build)
ARG GENERATE_SOURCEMAP
ARG REACT_APP_BASE_URL
ARG REACT_APP_GOOGLE_CLIENT_ID
ARG REACT_APP_MICROSOFT_CLIENT_ID
ARG REACT_APP_MICROSOFT_TENANT_ID
ARG REACT_APP_TINY_MCE_API_KEY
ARG REACT_APP_GOOGLE_MAPS_API_KEY
ARG REACT_APP_DISABLE_CHECK_MAILING
ARG REACT_APP_DISABLE_PAYMENT_LINKS
ARG REACT_APP_ALLOW_SUPER_ADMIN_DISABLE_MFA
ARG REACT_APP_GTM_ID
ARG REACT_APP_ENABLE_QBO_INTEGRATION
ARG REACT_APP_ENABLE_CHECK_IMPORT

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Use Nginx for serving the React app
FROM nginx:alpine

# Copy React build files
COPY --from=build /app/build /usr/share/nginx/html

# Copy Nginx config and entrypoint script from deploy directory
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf.template
COPY deploy/entrypoint.sh /entrypoint.sh

# Set executable permissions for entrypoint script
RUN chmod +x /entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 80
