package main

import (
	"bytes"
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/fsouza/go-dockerclient"
)

const MAX_MEMORY_BYTES = 4294967296

type waitResult struct {
	status int
	err    error
}

// runAndWaitDockerContainer runs the given container image with the specified binds,
// waiting for it to terminate and returning a tuple of the (status, stdout, stderr, err)
//
// Loosely based on container_test.go in the github.com/fsouza/go-dockerclient repo.
func runAndWaitDockerContainer(containerImage string, cmd []string, binds []string, timeout time.Duration) (int, string, string, error) {
	// Connect to Docker.
	client, err := docker.NewClientFromEnv()
	if err != nil {
		return -1, "", "", err
	}

	// Create the container.
	hostConfig := docker.HostConfig{Binds: binds}
	createOpts := docker.CreateContainerOptions{
		Config: &docker.Config{
			Image:      containerImage,
			Cmd:        cmd,
			Memory:     MAX_MEMORY_BYTES / 2,
			MemorySwap: MAX_MEMORY_BYTES,
		},
		HostConfig: &hostConfig,
	}

	container, err := client.CreateContainer(createOpts)
	if err != nil {
		return -1, "", "", err
	}

	// Start the container and run it under a timeout.
	completeChan := make(chan waitResult, 1)
	timeoutChan := make(chan bool, 1)

	go func() {
		time.Sleep(timeout)
		timeoutChan <- true
	}()

	go func() {
		// Start the container.
		err = client.StartContainer(container.ID, &hostConfig)
		if err != nil {
			completeChan <- waitResult{-1, err}
			return
		}

		status, err := client.WaitContainer(container.ID)
		completeChan <- waitResult{status, err}
	}()

	// Wait for the container to finish or for timeout.
	var status = -1
	var result = waitResult{}

	select {
	case result = <-completeChan:
		if result.err != nil {
			return -1, "", "", err
		}

		status = result.status

	case <-timeoutChan:
		err = client.KillContainer(docker.KillContainerOptions{ID: container.ID})
		if err != nil {
			log.Printf("Got error when trying to kill container %v: %v", container.ID, err)
		}

		return -1, "", "", fmt.Errorf("Timed out")
	}

	// Collect all the logs from the container.
	var stdout, stderr bytes.Buffer
	logsOpts := docker.LogsOptions{
		Container:    container.ID,
		OutputStream: &stdout,
		ErrorStream:  &stderr,
		Stdout:       true,
		Stderr:       true,
	}

	err = client.Logs(logsOpts)
	if err != nil {
		return -1, "", "", err
	}

	return status, stdout.String(), stderr.String(), nil
}

func buildTLSTransport(basePath string) (*http.Transport, error) {
	roots := x509.NewCertPool()
	pemData, err := ioutil.ReadFile(basePath + "/ca.pem")
	if err != nil {
		return nil, err
	}

	// Add the certification to the pool.
	roots.AppendCertsFromPEM(pemData)

	// Create the certificate;
	crt, err := tls.LoadX509KeyPair(basePath+"/cert.pem", basePath+"/key.pem")
	if err != nil {
		return nil, err
	}

	// Create the new tls configuration using both the authority and certificate.
	conf := &tls.Config{
		RootCAs:      roots,
		Certificates: []tls.Certificate{crt},
	}

	// Create our own transport and return it.
	return &http.Transport{
		TLSClientConfig: conf,
	}, nil
}
