import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '@/services/api.service';
import { SurveyQuestionDetail, QuestionType } from '@/types/survey.types';
import { Button } from '@/components/ui/Button';
import showToast from '@/components/ui/Toast';

interface SurveyVoteModalProps {
  surveyId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SurveyVoteModal({ surveyId, isOpen, onClose, onSuccess }: SurveyVoteModalProps) {
  const { t } = useTranslation();
  const [survey, setSurvey] = useState<SurveyQuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isOpen && surveyId) {
      loadSurvey();
    }
  }, [isOpen, surveyId]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSurveyQuestionDetail(surveyId);
      setSurvey(data);
      setAnswers({});
    } catch (error: any) {
      const message = error?.message || t('toast.survey.load_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionOrder: number, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionOrder.toString()]: value
    }));
  };

  const handleSubmit = async () => {
    if (!survey) return;

    const requiredQuestions = survey.questions.filter(q => q.isRequired);
    const missingRequired = requiredQuestions.some(
      q => !answers[q.order.toString()] || 
           (Array.isArray(answers[q.order.toString()]) && answers[q.order.toString()].length === 0)
    );

    if (missingRequired) {
      showToast.error(t('toast.survey.invalid_data'));
      return;
    }

    try {
      setSubmitting(true);
      await apiService.submitSurveyResponse(surveyId, { answers });
      showToast.success(t('toast.survey.submit_success'));
      onSuccess?.();
      onClose();
    } catch (error: any) {
      const message = error?.message || t('toast.survey.submit_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: any) => {
    const questionOrder = question.order;
    const currentAnswer = answers[questionOrder.toString()];

    switch (question.type) {
      case QuestionType.TEXT:
        return (
          <textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(questionOrder, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={4}
            placeholder={t('label.survey.enter_answer')}
          />
        );

      case QuestionType.SINGLE_CHOICE:
        return (
          <div className="space-y-2">
            {question.options?.map((option: string, idx: number) => (
              <label key={idx} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${questionOrder}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(questionOrder, e.target.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case QuestionType.MULTIPLE_CHOICE:
        return (
          <div className="space-y-2">
            {question.options?.map((option: string, idx: number) => (
              <label key={idx} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(currentAnswer) && currentAnswer.includes(option)}
                  onChange={(e) => {
                    const newAnswers = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
                    if (e.target.checked) {
                      newAnswers.push(option);
                    } else {
                      const index = newAnswers.indexOf(option);
                      if (index > -1) newAnswers.splice(index, 1);
                    }
                    handleAnswerChange(questionOrder, newAnswers);
                  }}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
                />
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case QuestionType.RATING:
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswerChange(questionOrder, rating)}
                className={`w-12 h-12 rounded-full border-2 transition-all ${
                  currentAnswer === rating
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case QuestionType.YES_NO:
        return (
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => handleAnswerChange(questionOrder, true)}
              className={`px-6 py-2 rounded-md border-2 transition-all ${
                currentAnswer === true
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              {t('label.survey.yes')}
            </button>
            <button
              type="button"
              onClick={() => handleAnswerChange(questionOrder, false)}
              className={`px-6 py-2 rounded-md border-2 transition-all ${
                currentAnswer === false
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-gray-300 hover:border-red-400'
              }`}
            >
              {t('label.survey.no')}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  if (survey.hasUserResponded) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="bg-white rounded-lg max-w-3xl w-full p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mulțumim!</h2>
            <p className="text-gray-600 mb-6">{t('toast.survey.already_responded')}</p>
            <Button onClick={onClose} variant="primary">
              Închide
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{survey.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{survey.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {survey.isAnonymous && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">
                Acest sondaj este anonim
              </p>
            </div>
          )}

          <div className="space-y-8">
            {survey.questions
              .sort((a, b) => a.order - b.order)
              .map((question, index) => (
                <div key={question.order} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="mb-4">
                    <div className="flex items-start">
                      <span className="text-lg font-semibold text-gray-900 mr-2">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-gray-900">
                          {question.text}
                          {question.isRequired && (
                            <span className="text-red-600 ml-1">*</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-7">
                    {renderQuestion(question)}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={submitting}
          >
            Anulează
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={submitting}
          >
            {submitting ? 'Se trimite...' : 'Trimite răspunsurile'}
          </Button>
        </div>
      </div>
    </div>
  );
}
