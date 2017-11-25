# Tyme

Application created using Node, Express, and PostgreSQL

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisities

Node.js Version 6+ (8+ recommended)

Postgresql Version 9.3+

### Running Tyme

1) Clone this repository to your host computer.
```
git clone https://github.com/TymeCodecatalysts/PrimeTyme
```

2) Change into the `/Tyme` app directory
```
cd Tyme
```

3) Create a user (password is ctp_tyme)
```
createuser -P -s -e ctp_tyme
```

4) Create a database for the Tyme application
```
createdb -h localhost -U ctp_tyme PRIMETYME_development
```

5) Edit the `/Tyme/config/config.json` file with corresponding credentials

6) Run npm install
```
npm install
```

7) Start the application
```
npm start
```

8) See the application by entering this in your web browser address bar
```
localhost:3000
```


## Running the tests

Coming Soon

### Coding Style (_Linting_)

We use AirBnB JS coding style. You can check whether or not your code
is styled properly by checking it using eslint. You must be within your project directory (inside of blog)

```
./node_modules/.bin/eslint nameOfYourFile.js
```

or for the entire project:

```
./node_modules/.bin/eslint .
```

## Built With

* Node
* Express
* Postgres

## License

This project is licensed under the MIT License.
