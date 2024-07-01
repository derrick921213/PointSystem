// src/components/SubmitExam.tsx
import React from 'react';
import Swal from 'sweetalert2';

type Metadata = {
  [key: string]: any;
};

interface SubmitExamProps {
  metadata: Metadata;
  totalQuizs: number;
}

interface Answer {
  name: string;
  value: string;
}

interface Question {
  question_id: number;
  answers: Answer[];
}

interface ExamPayload {
  exam_id: number;
  questions: Question[];
}

interface ExamResult {
  total_points: number;
  wrong_questions: {
    question_id: number;
    wrong_answers: {
      name: string;
      your_answer: string;
      correct_answer: string;
    }[];
  }[];
}

const SubmitExam: React.FC<SubmitExamProps> = ({ metadata, totalQuizs }) => {
  const handleSubmit = async () => {
    const examId = parseInt(metadata.id, 10) || 1;
    const questions: Question[] = [];

    document.querySelectorAll("form").forEach((form, index) => {
      const questionId = index + 1;
      const answers: Answer[] = [];
      form.querySelectorAll("textarea").forEach((textarea, answerIndex) => {
        const name = `answer${answerIndex + 1}`;
        const value = textarea.value || "";
        answers.push({
          name: name,
          value: value,
        });
      });
      questions.push({
        question_id: questionId,
        answers: answers,
      });
    });

    const json: ExamPayload = {
      exam_id: examId,
      questions: questions,
    };

    const submitUrl = `${window.location.protocol}//${window.location.hostname}:8000/files/submit/`;
    // 發送請求到後端
    try {
      const response = await fetch(submitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(json),
      });

      if (response.ok) {
        const result: ExamResult = await response.json();
        let wrongQuestionsMessage = "沒有錯誤";
        let iconType: 'success' | 'error' = 'success';

        if (result.wrong_questions && result.wrong_questions.length > 0) {
          iconType = 'error';
          wrongQuestionsMessage = result.wrong_questions.map((q) => {
            const wrongAnswers = q.wrong_answers.map((a) => 
              `Answer: ${a.name}, Your Answer: ${a.your_answer}, Correct Answer: ${a.correct_answer}`
            ).join("<br>");
            return `Question ID: ${q.question_id}<br>${wrongAnswers}`;
          }).join("<br><br>");
        }

        Swal.fire({
          title: 'Response',
          html: `Total Points: ${result.total_points}<br>Wrong Questions:<br>${wrongQuestionsMessage}`,
          icon: iconType,
          showCancelButton: true,
          confirmButtonText: iconType === 'success' && totalQuizs > 1 ? 'Next Question' : 'Retry',
        }).then((result) => {
          if (result.isConfirmed) {
            if (iconType === 'success') {
              if (totalQuizs > 1 && examId < totalQuizs) {
                // Logic for next question
                window.location.href = `${window.location.origin}/test?filename=q${examId + 1}`;
              } else {
                // Logic for navigating to home page if it's the last question
                localStorage.setItem('examCompleted', 'true');
                window.location.href = window.location.origin;
              }
            } else {
              // Logic for retrying the same question
              window.location.reload();
            }
          }
        });
        document.querySelectorAll("textarea").forEach((textarea) => {
          textarea.value = "";
        });
        console.log("Response:", result);
      } else {
        const errorText = await response.text();
        Swal.fire({
          title: 'Error',
          text: 'Failed to submit exam.',
          icon: 'error'
        });
        console.error("Error response:", errorText);
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: `Error submitting exam: ${error.message}`,
        icon: 'error'
      });
      console.error("Fetch error:", error);
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
};

export default SubmitExam;
