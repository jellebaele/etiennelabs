---
title: 'Part 5: Adding new applications'
position: 6
---

Adding a new docker application is pretty straightforward.

# 1. Add docker support

# 2. Run first version of your CI/CD

Add a CI/CD file. E.g.:

```yml
name: Build and Push Application

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GHCR
        run: echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin

      - name: Build and Push Docker image
        run: |
          docker buildx build \
            --platform linux/arm64 \
            --label "org.opencontainers.image.source=https://github.com/${{ github.repository }}" \
            -t ghcr.io/${{ github.repository_owner }}/etiennelabs:latest \
            -t ghcr.io/${{ github.repository_owner }}/etiennelabs:${{ github.sha }} \
            --push \
            .
```

Verify if the image is built and pushed to the repo

# 3. Add application in dokploy

1.  Add a new project
2.  Add a new service
3.  Select Docker under tab general
    1. Setup Docker Image, Registry URL and credentials
    2. Verify by ssh-ing into your server and $ docker service ls
4.  Get deploy url

# 4. Adjust github actions to push to dokploy

Add section to your CI/CD:

```yml

# Rest of your pipeline setup (see above)

- name: Trigger Dokploy Deployment
        run: |
          curl -X POST "${{ secrets.DOKPLOY_WEBHOOK_URL }}" \
            -H "CF-Access-Client-Id: ${{ secrets.CF_ACCESS_ID }}" \
            -H "CF-Access-Client-Secret: ${{ secrets.CF_ACCESS_SECRET }}" \
            -H "Content-Type: application/json"
```

Here you can see

# 5. Test CI/CD pipeline

# 6. Setup cloudflare tunnel

# 7. Optional: secure tunnel
