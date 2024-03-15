# Chat Web UI - Duardo AI

Welcome to the Duardo AI project! This guide provides instructions for deploying the Duardo AI application using both Docker and npm. Whether you prefer containerization with Docker for isolated environments or a direct npm installation for Node.js environments, this guide has you covered.

## Deploying with Docker

Utilize Docker containers to deploy the Duardo AI application for an efficient and automated deployment process. Docker ensures faster development cycles, easier collaboration, and seamless environment management.

### Build and Run Your Container 🔧

1. **Clone Duardo AI**
   ```bash
   git clone https://github.com/fugoku/duardo-ai.git
   cd duardo-ai


#### Build the Docker Image: Build a local docker image from the provided Dockerfile:

```
docker build -t duardo-ai .
```



#### Run the Docker Container: Start a Docker container from the newly built image, and expose its HTTP port 3000 to your localhost:3000:
```
docker run -d -p 3000:3000 duardo-ai
```

Browse to http://localhost:3000


#### Run using Docker Compose 🚀

clone repo
cd into repo

```
docker-compose up -d
```


#### Deploying with npm


```
npm install
npm run build
npm start
```

Browse to http://localhost:3000

