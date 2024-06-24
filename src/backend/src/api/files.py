import json
from os import listdir
import os
from fastapi import APIRouter, Depends, HTTPException, Path, Request, UploadFile, File
from core.utils import validate_filename
from fastapi.responses import FileResponse, JSONResponse
from models import User
from core.security import validate_token
from os.path import exists
from sqlalchemy.orm import Session
from dependencies import get_db

router = APIRouter(prefix="/files", tags=["files"])


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
