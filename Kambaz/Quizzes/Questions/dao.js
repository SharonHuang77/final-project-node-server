
import QuestionModel from "./model.js";
import mongoose from "mongoose";

export function findQuestionsForQuiz(quizId) {
  return QuestionModel.find({ quiz: quizId }).sort({ _id: 1 });
}

export function findQuestionById(questionId) {
  return QuestionModel.findOne({ _id: questionId });
}

export function createQuestion(question) {
  delete question._id;
  return QuestionModel.create(question);
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