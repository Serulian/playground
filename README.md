# Serulian Playground

[![godoc](https://godoc.org/github.com/Serulian/compiler?status.svg)](http://godoc.org/github.com/Serulian/playground)
[![Build Status (Travis)](https://travis-ci.org/Serulian/playground.svg?branch=master)](https://travis-ci.org/Serulian/playground)
[![Container Image on Quay](https://quay.io/repository/serulian/playground/status "Container Image on Quay")](https://quay.io/repository/serulian/playground)

The Serulian Playground provides a browser-based playground for building and running small Serulian applications without installation of the [Serulian Toolkit](https://github.com/Serulian/compiler).

## Running the playground

The playground can be run via a single Docker command. The `SHARED_ROOT_PATH` environment variable must be defined to point to a temporary directory accessible to Docker on the host. If `/tmp` is not used, mount a different directory.

```sh
docker run -v /var/run/docker.sock:/var/run/docker.sock  -p 80:80 -v /tmp:/tmp -e SHARED_ROOT_PATH=/tmp  -ti quay.io/serulian/playground 
```

## Building the playground image

```sh
docker build -t quay.io/serulian/playground .
```

## Modfiying the playground's Serulian code

### Making changes

The Playground's Seruian frontend code can be found in the [frontend](frontend) directory. To test modifications, run the Serulian Toolkit in development mode and add `?develop=true` to the Playground URL.

Run development mode:

```sh
cd frontend
serulian develop playground.seru
```

The code will automatically recompile on every refresh of the Playground.

### Comitting changes

Once changes are verified, run the `build` command to update the compiled code:

```sh
cd frontend
serulian build playground.seru
cd ..
docker build -t quay.io/serulian/playground .
```
