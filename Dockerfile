FROM denoland/deno:2.0.0

WORKDIR /app

ADD . /app

RUN deno install --entrypoint src/main.ts

CMD ["run", "--allow-net", "--allow-env", "--allow-read", "src/main.ts"]
