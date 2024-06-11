from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from eviq_scraper import extract_sections, SECTIONS_PATH,  get_medications_list, PROTOCOLS_PATH, TRANSLATION_PATH
from pathlib import Path
import json
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
# Define the CORS policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set this to specific origins if needed
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Serve static files from the 'frontend/build' directory
app.mount("/static", StaticFiles(directory=Path("/app/frontend/build/static")), name="static")

# Serve the React frontend
@app.get("/")
async def serve_frontend():
    frontend_path = Path("/app/frontend/build/index.html")
    return FileResponse(frontend_path)

# Serve favicon.ico
@app.get("/favicon.ico")
async def favicon():
    favicon_path = Path("/app/frontend/build//favicon.ico")
    return FileResponse(favicon_path)

@app.get("/sections")
async def get_sections():
    sections = json.loads(SECTIONS_PATH.read_text())
    if sections:
        return sections
    return JSONResponse(status_code=500, content={"message": "Failed to scrape data"})

@app.get("/medications")
async def get_medications():
    medications =  get_medications_list()
    if medications:
        return medications
    return JSONResponse(status_code=500, content={"message": "Failed to fetch medications"})

@app.get("/protocols")
async def get_sections():
    protocols = json.loads(PROTOCOLS_PATH.read_text())
    if protocols:
        return protocols
    return JSONResponse(status_code=500, content={"message": "Failed to retrieve protocol data"})

@app.get("/translation")
async def get_translation():
    translation = json.loads(TRANSLATION_PATH.read_text(encoding='utf-8'))
    if translation:
        return translation
    return JSONResponse(status_code=500, content={"message": "Failed to retrieve translation data"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)