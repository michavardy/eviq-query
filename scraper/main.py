from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from eviq_scraper import extract_sections, SECTIONS_PATH,  get_medications_list, PROTOCOLS_PATH, TRANSLATION_PATH
from pathlib import Path
from functools import lru_cache
import json
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from tinydb import TinyDB, Query
import requests
from dotenv import main
import os
import re
from pydantic import BaseModel

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent.parent / '.env'
main.load_dotenv(dotenv_path=str(env_path))

GITHUB_URL = os.getenv("GITHUB_URL")
TOKEN = os.getenv("TOKEN")
BRANCH = os.getenv("BRANCH")

app = FastAPI()
# Define the CORS policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set this to specific origins if needed
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Initialize TinyDB
comments_db_path = Path("data/comments.json")
comments_db_path.parent.mkdir(parents=True, exist_ok=True)  # Ensure the directory exists
db = TinyDB(comments_db_path)
Comments = db.table('comments')

class EditCommentRequest(BaseModel):
    newComment: str

# Serve static files from the 'frontend/build' directory
app.mount("/static", StaticFiles(directory=Path("/app/frontend/build/static")), name="static")
#
## Serve the React frontend
@app.get("/eviq-query")
async def serve_frontend():
    frontend_path = Path("/app/frontend/build/index.html")
    return FileResponse(frontend_path)

# Serve favicon.ico
@app.get("/eviq-query/favicon.ico")
async def favicon():
    favicon_path = Path("/app/frontend/build//favicon.ico")
    return FileResponse(favicon_path)

@app.get("/eviq-query/sections")
async def get_sections():
    sections = json.loads(SECTIONS_PATH.read_text())
    if sections:
        return sections
    return JSONResponse(status_code=500, content={"message": "Failed to scrape data"})

@app.get("/eviq-query/medications")
async def get_medications():
    medications = get_medications_list()
    medications = [med for med in {m.split(' ')[0] for m in medications} if len(med)>3]
    if medications:
        return medications
    return JSONResponse(status_code=500, content={"message": "Failed to fetch medications"})

@app.get("/eviq-query/protocols")
async def get_sections():
    protocols = json.loads(PROTOCOLS_PATH.read_text())
    if protocols:
        return protocols
    return JSONResponse(status_code=500, content={"message": "Failed to retrieve protocol data"})

@app.get("/eviq-query/translation")
async def get_translation():
    translation = json.loads(TRANSLATION_PATH.read_text(encoding='utf-8'))
    if translation:
        return translation
    return JSONResponse(status_code=500, content={"message": "Failed to retrieve translation data"})

# Endpoint to get all comments
@app.get("/eviq-query/comments")
async def get_all_comments():
    comments = Comments.all()
    return comments

# Endpoint to edit a comment
@app.put("/eviq-query/comments/{protocol_id}")
async def edit_comment(protocol_id: str, body: EditCommentRequest):
    new_comment = body.newComment
    Comment = Query()
     # Check if protocol_id is empty or new_comment is empty
    if not protocol_id or not new_comment:
        raise HTTPException(status_code=400, detail="Protocol ID and new comment are required.")
    if Comments.contains(Comment.ID == protocol_id):
        print(f'updating id: {protocol_id}, comment: {new_comment}')
        Comments.update({"Comment": new_comment}, Comment.ID == protocol_id)
        return {"message": "Comment updated successfully"}
    else:
        print(f'new comment id: {protocol_id}, comment: {new_comment}')
        Comments.insert({"ID": protocol_id, "Comment": new_comment})
        return {"message": "Comment created successfully"}

# Endpoint to edit a comment
@app.delete("/eviq-query/comments/{protocol_id}")
async def delete_comment(protocol_id: str):
    Comment = Query()
    if Comments.contains(Comment.ID == protocol_id):
        Comments.remove(Comment.ID == protocol_id)
        return {"message": "Comment deleted successfully"}
    else:
        return JSONResponse(status_code=404, content={"message": "Comment not found"})

# Endpoint to backup comments to GitHub
@app.post("/eviq-query/comments/backup")
async def backup_comments_to_github(repo: str, path: str):
    # Read the comments from the file
    with open(comments_db_path, 'r') as file:
        content = file.read()

    url = f"{GITHUB_URL}/{repo}/contents/{path}"
    headers = {
        "Authorization": f"token {TOKEN}",
        "Content-Type": "application/json"
    }
    data = {
        "message": "Backup comments",
        "content": content.encode('utf-8').strip().decode('utf-8'),
        "branch": BRANCH
    }

    response = requests.put(url, headers=headers, data=json.dumps(data))
    if response.status_code in [200, 201]:
        return {"message": "Backup successful"}
    else:
        return JSONResponse(status_code=404, content={"message": f"Error backing comments up to github, status: {response.status_code}, details: {response.json()}"})

    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=80, reload=True)