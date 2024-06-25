import json
from os import listdir
import os
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Path, Request, UploadFile, File
from schemas import DirectoryStructure, FileManagerDirectoryContent
from core.utils import get_full_path, validate_filename, validate_path
from fastapi.responses import FileResponse, JSONResponse
from models import User
from core.security import validate_token
from os.path import exists
from sqlalchemy.orm import Session
from dependencies import get_db
import asyncio
from core.file_manager import FileManager

router = APIRouter(prefix="/files", tags=["files"])
# BASE_DIR = "./markdown"
# if not os.path.exists(BASE_DIR):
#     os.makedirs(BASE_DIR)

@router.get("/markdown/{filename:path}")
async def get_markdown(filename: str = Path(...), user: User = Depends(validate_token)):
    print(filename)
    validate_filename(filename)
    file_path = f'markdown/questions/{filename}'
    print(file_path)
    if exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")


@router.post("/markdown/{filename:path}")
async def update_markdown(filename: str = Path(...), file: UploadFile = File(...), user: User = Depends(validate_token)):
    validate_filename(filename)
    if user.permission != 1:
        raise HTTPException(status_code=403, detail="Permission denied")
    file_path = f'markdown/questions/{filename}'
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    return {"message": "File updated successfully"}


@router.get("/")
async def get_files_lists(user: User = Depends(validate_token)):
    if user.permission != 1:
        raise HTTPException(status_code=403, detail="Permission denied")
    dirpaths = f'markdown'
    try:
        files = listdir(dirpaths)
        return {'files': files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# @router.post("/submit")
# async def submit_exam(request: Request,user: User = Depends(validate_token)):
#     exam_data = await request.json()
#     print(exam_data)
#     return JSONResponse(content={"message": "Exam submitted successfully"})


@router.post("/submit/")
async def check_answer_and_give_points(request: Request, user: User = Depends(validate_token), db: Session = Depends(get_db)):
    answers_files_path = "./markdown/answers/"
    # 讀取提交的答案文件
    return_file = await request.json()
    print(return_file)
    return_answers = return_file["questions"]
    # 查找匹配的答案文件
    answers_files = [f for f in os.listdir(
        answers_files_path) if f.endswith(".json")]
    answers_file = None
    for file_name in answers_files:
        file_path = os.path.join(answers_files_path, file_name)
        with open(file_path, "r") as file:
            temp_answers_file = json.load(file)
            if temp_answers_file["exam_id"] == return_file["exam_id"]:
                answers_file = temp_answers_file
                break
    if not answers_file:
        return {"error": "No matching answer file found"}
    avg_point = answers_file["avg_point"]
    correct_answers = answers_file["questions"]
    # 檢查答案
    wrong_questions = []
    total_points = 0
    for i in range(len(correct_answers)):
        bool_wrong = False
        wrong_answers = {
            'question_id': correct_answers[i]["question_id"], 'wrong_answers': []}
        if correct_answers[i]["question_id"] != return_answers[i]["question_id"]:
            print(f"Sheet wrong (question_id: {
                  correct_answers[i]['question_id']})")
            break
        for j in range(len(correct_answers[i]["answers"])):
            if correct_answers[i]["answers"][j]["name"] != return_answers[i]["answers"][j]["name"]:
                print(f"Sheet wrong (answer name: {
                      correct_answers[i]['answers'][j]['name']})")
                break

            if correct_answers[i]["answers"][j]["value"] == return_answers[i]["answers"][j]["value"]:
                if "point" in correct_answers[i]["answers"][j]:
                    total_points += correct_answers[i]["answers"][j]["point"]
                else:
                    total_points += avg_point
            else:
                bool_wrong = True
                wrong_answers["wrong_answers"].append({
                    'name': correct_answers[i]["answers"][j]["name"],
                    'correct_answer': correct_answers[i]["answers"][j]["value"],
                    'your_answer': return_answers[i]["answers"][j]["value"]
                })
        if bool_wrong:
            wrong_questions.append(wrong_answers)
    user = db.query(User).filter(User.email == user.email).first()
    user.points += total_points
    db.commit()
    return JSONResponse(content={
        'total_points': total_points,
        'wrong_questions': wrong_questions
    })


@router.get("/q_count/")
def count_files(user: User = Depends(validate_token)):
    file_path = "./markdown/questions"
    files_list = [f for f in os.listdir(file_path) if f.endswith(".mdx")]
    return {"total": len(files_list)}

# async def get_directory_structure(rootdir):
#     dir_structure = {"name": os.path.basename(rootdir), "children": []}
#     try:
#         loop = asyncio.get_event_loop()
#         for item in await loop.run_in_executor(None, os.listdir, rootdir):
#             itempath = os.path.join(rootdir, item)
#             if os.path.isdir(itempath):
#                 dir_structure["children"].append(await get_directory_structure(itempath))
#             else:
#                 dir_structure["children"].append({"name": item})
#     except PermissionError:
#         pass  # Ignore directories that cannot be accessed
#     return dir_structure

# @router.get("/dir", response_model=DirectoryStructure)
# async def read_directory_structure():
#     return await get_directory_structure(BASE_DIR)

# Initialize the file manager
base_path = os.getcwd()
root_folder = "markdown"
file_manager = FileManager(base_path, root_folder)

@router.post("/FileOperations")
async def file_operations(args: FileManagerDirectoryContent,user: User = Depends(validate_token)):
    if user.permission != 1:
        raise HTTPException(status_code=403, detail="Permission denied")
    try:
        full_path = get_full_path(file_manager.base_path, args.Path)
        validate_path(full_path, file_manager.root_path)
        
        if args.Action in ["delete", "rename"]:
            if not args.TargetPath and not args.Path:
                return JSONResponse(status_code=401, content={"error": {"code": "401", "message": "Restricted to modify the root folder."}})
        
        action_map = {
            "read": lambda: file_manager.get_files(args.Path, args.ShowHiddenItems),
            "delete": lambda: file_manager.delete(args.Path, args.Names),
            "copy": lambda: file_manager.copy(args.Path, args.TargetPath, args.Names, args.RenameFiles),
            "move": lambda: file_manager.move(args.Path, args.TargetPath, args.Names, args.RenameFiles),
            "details": lambda: file_manager.details(args.Path, args.Names),
            "create": lambda: file_manager.create(args.Path, args.Name),
            "search": lambda: file_manager.search(args.Path, args.SearchString, args.ShowHiddenItems, args.CaseSensitive),
            "rename": lambda: file_manager.rename(args.Path, args.Name, args.NewName),
        }

        if args.Action in action_map:
            return action_map[args.Action]()
        else:
            return JSONResponse(status_code=400, content={"error": {"code": "400", "message": "Invalid action"}})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/Upload")
async def upload_files(path: str, upload_files: List[UploadFile] = File(...),user: User = Depends(validate_token)):
    if user.permission != 1:
        raise HTTPException(status_code=403, detail="Permission denied")
    try:
        for file in upload_files:
            file_path = get_full_path(file_manager.base_path, os.path.join(path, file.filename))
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        return {"status": "uploaded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
