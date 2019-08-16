FROM node:lts-alpine as development
ENV  PATH="${PATH}:/node_modules/.bin:/app/bin" \
  WORKDIR="/app"

WORKDIR ${WORKDIR}
EXPOSE 3000
VOLUME /app

ENTRYPOINT [ "entrypoint" ]
