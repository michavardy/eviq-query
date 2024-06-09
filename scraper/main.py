from fastapi import FastAPI
from fastapi.responses import JSONResponse
from eviq_scraper import extract_sections, SECTIONS_PATH,  get_medications_list, PROTOCOLS_PATH
from pathlib import Path
import json
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)