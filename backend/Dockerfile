FROM python:3
WORKDIR /app
RUN pip install pipenv
COPY Pipfile Pipfile.lock /app/
RUN pipenv install
COPY ./src /app
EXPOSE 8000
CMD ["pipenv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000","--reload"]