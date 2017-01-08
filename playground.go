// Copyright 2016 The Serulian Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// main package defines a webserver that performs Serulian toolkit operations via a REST
// API.
package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"time"

	"github.com/gorilla/mux"
)

const BUILD_TIMEOUT = time.Duration(60) * time.Second
const TOOLKIT_CONTAINER_IMAGE = "quay.io/serulian/compiler"

var SHARED_ROOT_DIRECTORY = os.Getenv("SHARED_ROOT_PATH")
var BUILD_COMMAND = []string{"build", "/b/playground.seru", "--debug"}

type buildResult struct {
	Status              int
	Output              string
	GeneratedSourceFile string
	GeneratedSourceMap  string
}

func serve(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadFile("static/index.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Write(data)
}

func build(w http.ResponseWriter, r *http.Request) {
	// Read the body as the source to be built.
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("Got build request with body: %s", body)

	// Place the body into a temporary folder.
	dir, err := ioutil.TempDir(SHARED_ROOT_DIRECTORY, "buildpack")
	if err != nil {
		log.Printf("Error creating temp dir: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer os.RemoveAll(dir)
	log.Printf("Created temporary directory %v", dir)

	rootSourceFilePath := path.Join(dir, "playground.seru")
	err = ioutil.WriteFile(rootSourceFilePath, body, 0666)
	if err != nil {
		log.Printf("Error writing temp file: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("Wrote temporary file to path %v", rootSourceFilePath)

	// Spawn a Docker container of the toolkit with the temp directory as the project root and
	// wait for it terminate.
	bindPoint := dir + ":/b/"
	status, stdout, stderr, err := runAndWaitDockerContainer(TOOLKIT_CONTAINER_IMAGE, BUILD_COMMAND, []string{bindPoint}, BUILD_TIMEOUT)
	if err != nil {
		log.Printf("Error running container: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("Build complete with status %v\n%v\n%v\n", status, stdout, stderr)

	// Create the build result.
	var generatedSourceFile = []byte{}
	var generatedSourceMap = []byte{}

	if status == 0 {
		generatedSourceFile, err = ioutil.ReadFile(path.Join(dir, "playground.seru.js"))
		if err != nil {
			log.Printf("Error reading generated source file: %v\n", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		generatedSourceMap, err = ioutil.ReadFile(path.Join(dir, "playground.seru.js.map"))
		if err != nil {
			log.Printf("Error reading generated source map: %v\n", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	result := buildResult{
		Status:              status,
		Output:              stdout,
		GeneratedSourceFile: string(generatedSourceFile),
		GeneratedSourceMap:  string(generatedSourceMap),
	}

	jsonData, err := json.Marshal(result)
	if err != nil {
		log.Printf("Error marshalling build result to JSON: %v\n", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Write(jsonData)
}

// Run runs the playgrounud webserver on localhost at the given addr.
func Run(addr string) {
	if SHARED_ROOT_DIRECTORY == "" {
		fmt.Printf("Missing SHARED_ROOT_DIRECTORY env var")
		return
	}

	rtr := mux.NewRouter()
	rtr.HandleFunc("/play/build", build).Methods("POST")
	rtr.HandleFunc("/", serve).Methods("GET")

	http.Handle("/", rtr)

	fmt.Printf("Serving playground backend server at %v\n", addr)
	err := http.ListenAndServe(addr, nil)
	if err != nil {
		fmt.Printf("Error running playground: %v", err)
		return
	}
}

func main() {
	Run("0.0.0.0:5000")
}
