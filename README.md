# Bestrida

> A Strava based challenge app - challenge your friends via Strava for the bragging rights on your favorite segments.


## Table of Contents

1. [Team](#team)
1. [Usage](#Usage)
1. [Development](#development)
    1. [Requirements](#requirements)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Roadmap](#roadmap)
1. [Contributing](#contributing)


## Team

  - __Product Owner__: Justin Zimmerman
  - __Scrum Master__: Shan Batla
  - __Development Team Members__: David Lee, A.J. Mullins

## Usage

> Find your friends via Strava, then challenge them for the fastest time on a particular segement. 


## Development
build the docker image:
`docker build . -t bestrida-node`

run the docker container:
`docker run -it --rm -e PORT="4001"  -p 4001:8080  --name bestrida-node-container bestrida-node`

### Requirements

- Node 6.11.x
- Grunt

### Installing Dependencies


Step 1. Install server side dependencies
```sh
npm install
```

Step 2. Run Grunt - builds out app, runs test, and runs app on local host
```sh
grunt
```

### Roadmap

View the project roadmap [here](https://github.com/Bestrida/bestrida/issues)


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.