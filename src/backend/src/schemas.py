from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class FileManagerDirectoryContent(BaseModel):
    Action: str
    Path: str
    ShowHiddenItems: Optional[bool] = False
    TargetPath: Optional[str] = None
    Names: Optional[List[str]] = None
    RenameFiles: Optional[bool] = None
    TargetData: Optional[dict] = None
    SearchString: Optional[str] = None
    CaseSensitive: Optional[bool] = False
    Name: Optional[str] = None
    NewName: Optional[str] = None
    Data: Optional[dict] = None

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)

class DirectoryStructure(BaseModel):
    name: str
    children: list

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    permission: int
    class Config:
        from_attributes = True