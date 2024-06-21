from fastapi import HTTPException
def validate_filename(filename: str):
    if not filename.endswith('.md'):
        raise HTTPException(status_code=400, detail="Filename must end with '.md'")