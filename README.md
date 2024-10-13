# mySimpleCMS ver. 0.0.1
mySimpleCMS is a simple headless content management system written in ExpressJS

### Executing program
* download the repo
* install all dependencies using command:
```
npm i
```
* create .env file with environment variables:
```
DATABASE_URL=mongodb://localhost:27017/
PORT=3000
USER=admin
PASSWORD={your password hashed with bcrypt}
```
* run server in develop mode:
```
npm run dev
```
* or in production mode: 
```
node server.js
```