#!/bin/bash

get_latest_release() { \
  wget -qO- "https://api.github.com/repos/$1/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/';
}
NGINX_VERSION=`nginx -v 2>&1 > /dev/null | sed -E "s/^.*nginx\/(.*)/\\1/"`
OPENTRACING_NGINX_VERSION="$(get_latest_release opentracing-contrib/nginx-opentracing)"
DD_OPENTRACING_CPP_VERSION="$(get_latest_release DataDog/dd-opentracing-cpp)"
wget https://github.com/opentracing-contrib/nginx-opentracing/releases/download/${OPENTRACING_NGINX_VERSION}/linux-amd64-nginx-${NGINX_VERSION}-ot16-ngx_http_module.so.tgz
NGINX_MODULES=/etc/nginx/modules
tar zxvf linux-amd64-nginx-${NGINX_VERSION}-ot16-ngx_http_module.so.tgz -C "${NGINX_MODULES}"
# Install Datadog module
wget -O - https://github.com/DataDog/dd-opentracing-cpp/releases/download/${DD_OPENTRACING_CPP_VERSION}/linux-amd64-libdd_opentracing_plugin.so.gz | gunzip -c > /usr/local/lib/libdd_opentracing_plugin.so
