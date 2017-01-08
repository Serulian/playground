FROM phusion/baseimage:0.9.19
RUN apt-get update && apt-get install -y nginx golang git
RUN mkdir -p playgroundgo/src/github.com/Serulian/playground
ADD *.go playgroundgo/src/github.com/Serulian/playground/
ENV GOPATH /playgroundgo
WORKDIR playgroundgo/src/github.com/Serulian/playground
RUN go get ./...
RUN go build .
ADD services /etc/service/
WORKDIR /
ADD conf /conf
ADD static static
ADD frontend/playground.seru.js /static/
ADD frontend/playground.seru.js.map /static/
CMD ["/sbin/my_init"]
EXPOSE 80