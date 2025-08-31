#/bin/bash
docker compose build

# sendgridparquetlog-sendgrid-logger はフォルダ構成により算出される値
# 8080 は Dockerfile に EXPOSE で記載されている値
bash ./Deploy/SakuraCloud.sh \
  sendgridparquetlog-sendgrid-logger \
  8080 \
  latest
