FROM ghcr.io/zastinian/esdock:nodejs_22

USER root
RUN apt-get update \
  && apt-get install -y samba smbclient fuse3 \
  && rm -rf /var/lib/apt/lists/*

USER 101:103
