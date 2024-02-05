# Audio Streaming Web App

<img src="screen.jpg" width="320px"/>

## Setup

Use python 3.8 or newer one.

```shell
pip install fastapi
```

Prepare dummy ssl certificates.

```shell
openssl genrsa 2048 > host.key
chmod 400 host.key
openssl req -new -x509 -nodes -sha256 -days 365 -key host.key -out host.cert
```

Run!

```shell
uvicorn main:app --reload --host 127.0.1 --port 8501 --ssl-keyfile=host.key --ssl-certfile=host.cert
```

## References

- [WebAudio+WebSocket でブラウザへの音声リアルタイムストリーミングを実装する](https://gist.github.com/ykst/6e80e3566bd6b9d63d19?permalink_comment_id=1877566)
