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

### Requirements

- Node 4.x.x

### Installing Dependencies

####From within the root directory (client side):

Step 1. Install Ionic framework and libraries
```sh
npm install -g ionic
```
Step 2. Install Cordova
```sh
cordova platform add ios
```
Step 3. Install client side dependencies
```sh
bower install
```
Step 4. Install iOS platform for Ionic
```sh
ionic platform add ios
```
Step 5. Install Cordova plugin for the in-app browser 
```sh
cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-inappbrowser.git
```
Step 6. To run app in browser, use the following command
```sh
ionic serve -l
```
Step 7. To run app in an iOS emulator (requires Mac OSX), use the following command
```sh
ionic emulate ios
```


####From within the root directory (server side):

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