# TARGETPLATFORM (例: linux/amd64), TARGETOS (例: linux), TARGETARCH (例: amd64)
ARG TARGETPLATFORM
ARG TARGETOS
ARG TARGETARCH

FROM --platform=${TARGETPLATFORM} golang:1.24-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# アプリケーションをビルド（明示的にLinux/AMD64向けにビルド）
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o /app/main ./cmd


FROM --platform=${TARGETPLATFORM} alpine:latest

WORKDIR /app

# ビルド環境から、コンパイル済みの実行ファイルだけをコピー
COPY --from=builder /app/main .

# アプリケーションがリッスンするポート
EXPOSE 8080

# コンテナ起動時に実行するコマンド
CMD ["/app/main"]