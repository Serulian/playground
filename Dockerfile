FROM phusion/baseimage:0.9.19
RUN apt-get update && apt-get install -y nginx git wget gcc npm # 2017OCT19
RUN apt-get install -y software-properties-common && add-apt-repository ppa:certbot/certbot && apt-get update && apt-get install -y python-certbot-nginx 
RUN wget https://storage.googleapis.com/golang/go1.9.1.linux-amd64.tar.gz
RUN tar -zxvf go1.9.1.linux-amd64.tar.gz -C /usr/local/
ENV PATH $PATH:/usr/local/go/bin
RUN mkdir -p playgroundgo/src/github.com/serulian/playground
ADD *.go playgroundgo/src/github.com/serulian/playground/
ENV GOPATH /playgroundgo
WORKDIR playgroundgo/src/github.com/serulian/playground
RUN go get -v ./...
RUN go build .
WORKDIR /
RUN mkdir -p depcache/github.com/serulian/
WORKDIR depcache/github.com/serulian/
RUN git clone https://github.com/serulian/debuglib.git # 2017DEC09
RUN git clone https://github.com/serulian/component.git
RUN git clone https://github.com/serulian/virtualdom.git
RUN git clone https://github.com/serulian/attachment.git
RUN git clone https://github.com/serulian/corelib.git
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