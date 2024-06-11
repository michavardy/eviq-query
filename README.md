# eviQ-Query

## Dev
```bash
npm run start #http://localhost:3000
uvicorn main:app --reload  #http://localhost:8000
```

## test Docker
```bash
docker build -t eviq .
docker run -p 8000:8000 eviq
```