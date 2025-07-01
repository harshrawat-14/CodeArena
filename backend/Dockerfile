FROM node:18-alpine

WORKDIR /app

RUN apk update && apk add --no-cache python3 g++ 

#  <local_dir> <work_dir> 
COPY . .

RUN npm install

EXPOSE 8000

CMD ["node","index.js"]



