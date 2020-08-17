# tscw-relay
A relay server for tscw-webserver

- [tscw-relay](#tscw-relay)
- [Purpose](#purpose)
- [Solution](#solution)
- [Installation](#installation)
  - [Docker Container](#docker-container)
    - [Setting Up](#setting-up)
- [Usage](#usage)

# Purpose

Compliments [tscw-daemon](https://github.com/kyleratti/tscw-daemon) as the internet-based web socket and HTTP server relay.

# Solution

Listens to inbound HTTP requests (coming from the video board software), validates them, and retrieves them via the web socket connection to [tscw-daemon](https://github.com/kyleratti/tscw-daemon). Includes basic error handling for edge cases like too many daemons running and daemon not running at all.

# Installation

## Docker Container

This service is intended to be deployed via Docker container. For convenience, a  `build/web.Dockerfile` is included.

A `docker-compose.yml` file is also included and is the recommended way to start this application.


### Setting Up

  1. Clone the repository
  2. Run `docker-compose up`

# Usage

Once online, this relay listens for requests to `/filename.xml`. The request for the file name will then be passed onto the daemon, which will validate it and, if it exists, read and return it to the relay. The relay will then respond to the HTTP request for the file.

