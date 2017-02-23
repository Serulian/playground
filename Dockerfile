FROM phusion/baseimage:0.9.19
RUN apt-get update && apt-get install -y nginx git wget gcc npm
RUN wget https://storage.googleapis.com/golang/go1.7.1.linux-amd64.tar.gz
RUN tar -zxvf  go1.7.1.linux-amd64.tar.gz -C /usr/local/
ENV PATH $PATH:/usr/local/go/bin
RUN mkdir -p playgroundgo/src/github.com/Serulian/playground
ADD *.go playgroundgo/src/github.com/Serulian/playground/
ENV GOPATH /playgroundgo
WORKDIR playgroundgo/src/github.com/Serulian/playground
RUN go get ./...
RUN go build .
WORKDIR /
RUN mkdir -p depcache/github.com/Serulian/
WORKDIR depcache/github.com/Serulian/
RUN git clone https://github.com/Serulian/debuglib.git
RUN git clone https://github.com/Serulian/component.git
RUN git clone https://github.com/Serulian/virtualdom.git
RUN git clone https://github.com/Serulian/attachment.git
RUN git clone https://github.com/Serulian/corelib.git
WORKDIR /
RUN npm install -g slackin
RUN mv /usr/bin/nodejs /usr/bin/node
ADD conf /conf
ADD static static
ADD frontend/playground.seru.js /static/
ADD frontend/playground.seru.js.map /static/
ADD services /etc/service/
CMD ["/sbin/my_init"]
EXPOSE 80