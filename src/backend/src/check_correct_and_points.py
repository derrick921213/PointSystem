import json
import os

return_file_name = "test02.json"

def check_correct_and_points(return_file_name: str):
    answers_files_path = "./"

    #read return file
    with open(return_file_name, "r") as file:
        return_file = json.load(file)
    return_answers = return_file["answers"]
    
    #find answer file
    answers_files = []
    for files in os.listdir(answers_files_path):
        if files.endswith(".json"):
            answers_files.append(files)
    for i in answers_files:
        file_path = os.path.join(answers_files_path, i)
        with open(file_path, "r") as file:
            answers_file = json.load(file)
            if answers_file["id"] == return_file["id"]:
                break
    correct_answers = answers_file["answers"]
    
    #check answer
    correct_question_ids = []
    wrong_question_ids = []
    for i in range(len(correct_answers)):
        if correct_answers[i]["id"] == return_answers[i]["id"]:
            if correct_answers[i]["value"] == return_answers[i]["value"]:
                correct_question_ids.append(correct_answers[i]["id"])
            else:
                wrong_question_ids.append(correct_answers[i]["id"])
        else:
            break

    #count points
    points = 0
    for i in range(len(correct_question_ids)):
        points += correct_answers[correct_question_ids[i]-1]["point"]

    return f"\"points\": {points}, wrong_question_ids: {wrong_question_ids}"

final = check_correct_and_points(return_file_name)
print(final)
