# Syncoss Check Writer
## synccos-checkwriter-backend
---
Synccos Check Writer Backend Microservice
<br>
<br>

## Node Version Used in the project
---
  ```
  v16.15.0
  ```

<br>
<br>

## Getting Started
---
* Ask for the config files (dev.json / prod.json) from someone in the team
* Go to project root directory
  ```
  cd ./synccos-backend-check-writer/
  ```
* Run the command - 
  ```
  nvm use 16.15
  npm i
  ```
* Make sure you have whitelisted your ip to the security group before proceeding.
* Run the script (as per the config file available)
  ```
  npm run start:prod    // prod.json config file
  npm run start:dev     // dev.json config file
  ```
* For Development / Debug (Nodemon)
  ```
  npm run debug:prod    // prod.json config file
  npm run debug:dev     // dev.json config file
  ```

