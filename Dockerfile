FROM ghcr.io/zastinian/esdock:nodejs_22

USER root
RUN apt-get update \
  && apt-get install -y samba smbclient samba-common-bin fuse3 libfuse3-dev \
     gosu sudo python3 make g++ pkg-config \
  && rm -rf /var/lib/apt/lists/*

ENV PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

RUN echo "user_allow_other" > /etc/fuse.conf \
  && echo "#101 ALL=(root) NOPASSWD: /home/container/tools/smb_user.sh" > /etc/sudoers.d/offload \
  && chmod 440 /etc/sudoers.d/offload
