from fastapi import HTTPException
import os
def validate_filename(filename: str):
    if not filename.endswith(('.md','.mdx')):
        raise HTTPException(status_code=400, detail="Filename must end with '.md' or '.mdx'")

def get_full_path(base_path: str, path: str) -> str:
    return os.path.abspath(os.path.join(base_path, path))

def validate_path(full_path: str, root_path: str):
    if not full_path.startswith(root_path):
        raise PermissionError("Access denied for Directory-traversal")