FROM golang:1.24.2-alpine3.20

WORKDIR /work

COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN apk add --no-cache \
        alpine-sdk \
        git \
    && go install github.com/air-verse/air@latest

EXPOSE 8080

CMD ["air", "-c", ".air.toml"]
