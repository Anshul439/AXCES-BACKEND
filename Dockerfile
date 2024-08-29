# Base image
FROM ubuntu:22.04

RUN sudo apt update && sudo apt upgrade -y
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
RUN sudo apt-get install -y nodejs
RUN sudo apt-get install gnupg
RUN curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
RUN echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
RUN sudo apt-get update
RUN sudo apt-get install -y mongodb-org
RUN sudo systemctl start mongod
RUN sudo systemctl enable mongod

# Clone the repository and install dependencies
RUN git clone https://github.com/Axces-landspaces/AXCES-BACKEND.git . && \
    npm install
# nano .env

# Expose the port and set the entrypoint
EXPOSE 5000
ENTRYPOINT [ "node", "app.js" ]

# sudo apt update
# sudo apt install -y nginx
# sudo systemctl start nginx
# sudo systemctl enable nginx
# sudo systemctl status nginx
# sudo nano /etc/nginx/sites-available/backend.axces.in
# sudo ln -s /etc/nginx/sites-available/backend.axces.in /etc/nginx/sites-enabled/
# sudo nginx -t
# sudo systemctl reload nginx
# sudo systemctl restart nginx

# sudo npm install -g pm2
# pm2 start app.js
# pm2 startup systemd
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
# pm2 save