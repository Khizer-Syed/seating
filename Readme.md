```shell
  cd server
  docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t khizersyed/seating-app:latest \
  --push .
```