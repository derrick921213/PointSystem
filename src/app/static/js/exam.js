
async function submitExam() {
  const examId = 1; // 假設考試 ID 為 1，如果需要動態設置，請根據需要進行修改
  const answers = [];

  // 遍歷所有表單元素
  document.querySelectorAll("form").forEach((form, index) => {
    const questionId = index; // 根據需要設置問題 ID
    const value = form.querySelector("textarea").value;
    const point = 5; // 假設每題 5 分，如果需要動態設置，請根據需要進行修改
    answers.push({
      id: questionId,
      value: value,
      point: point,
    });
  });

  const json = {
    id: examId,
    answers: answers,
  };
  const submitUrl = `${window.location.protocol}//${window.location.hostname}:8000/files/submit/`;
  // 發送請求到後端
  try {
    const response = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(json),
    });

    if (response.ok) {
      alert("Exam submitted successfully!");
    } else {
      alert("Failed to submit exam.");
    }
  } catch (error) {
    alert("Error submitting exam: " + error.message);
  }
}
export default { submitExam };


