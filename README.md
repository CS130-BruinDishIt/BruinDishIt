# BruinDishIt
An app for UCLA students to view, review, and talk about the dining halls.

## Requirements for Local Setup
### Node
Install [Node](https://nodejs.org/en/download) on your machine. If the installation was successful, you should be able to run the following commands.

``` bash
$ node --version
v24.14.1

$ npm --version
11.11.0
```

### MongoDB
Install [MongoDB Community Server](https://www.mongodb.com/try/download/community).

## Project Setup
Clone this repository and install the Node modules for the application.

``` bash
$ git clone https://github.com/CS130-BruinDishIt/BruinDishIt
$ cd BruinDishIt
$ npm install 
```

### Server Setup
Go to the `server` directory and install the necessary Node modules for the backend server.

```bash
$ cd server
$ npm install
```

Add an `.env` file with the following contents:

    MONGODB_URI=mongodb://127.0.0.1:27017/diningdb
    CLIENT_ORIGIN=http://localhost:5173

Launch the MongoDB application. Create a "New Connection" with URI  set to `mongodb://localhost:27017` and click "Save & Connect." 

### Frontend Setup

Go to the `frontend` directory and install the necessary Node modules for the frontend application.

``` bash
$ cd ../frontend
$ npm install
```

### Running the App

Return to the project root and start the app.
``` bash
$ cd ..
$ npm run start:dev
```
The application can be found at http://localhost:5173. The backend server will be running at http://localhost:3000.