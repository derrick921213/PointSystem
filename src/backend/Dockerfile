FROM python:3.12-alpine
WORKDIR /app
RUN apk update && apk add --no-cache bash iputils-ping \
gcc \
musl-dev \
libffi-dev \
openssl-dev \
&& pip install pipenv
COPY Pipfile Pipfile.lock /app/
RUN pipenv install --deploy --ignore-pipfile && apk del gcc musl-dev libffi-dev
COPY ./src /app
EXPOSE 8000
CMD ["pipenv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000","--reload"]