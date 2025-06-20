
import QuestionModel from "./model.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export function findQuestionsForQuiz(quizId) {
  return QuestionModel.find({ quiz: quizId }).sort({ _id: 1 });
}

export function findQuestionById(questionId) {
  return QuestionModel.findOne({ _id: questionId });
}

export function createQuestion(question) {
  const newQuestion = { ...question, _id: uuidv4() };

  console.log('Creating question with data:', newQuestion);
  console.log('Question type:', newQuestion.type);
  console.log('Correct answer:', newQuestion.correctAnswer);
  console.log('Correct answer type:', typeof newQuestion.correctAnswer);
  
  return QuestionModel.create(newQuestion);
}

export function updateQuestion(questionId, questionUpdates) {
  return QuestionModel.findOneAndUpdate(
    { _id: questionId },
    questionUpdates,
    { new: true }
  );
}

export function deleteQuestion(questionId) {
  return QuestionModel.findOneAndDelete({ _id: questionId });
}


export function deleteQuestionsForQuiz(quizId) {
  return QuestionModel.deleteMany({ quiz: quizId });
}

export function countQuestionsForQuiz(quizId) {
  return QuestionModel.countDocuments({ quiz: quizId });
}

export function getTotalPointsForQuiz(quizId) {
  return QuestionModel.aggregate([
    { $match: { quiz: quizId } },
    { $group: { _id: null, totalPoints: { $sum: "$points" } } }
  ]);
}