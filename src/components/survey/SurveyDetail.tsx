import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { apiService } from '@/services/api.service';
import { SurveyQuestionDetail, QuestionType } from '@/types/survey.types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import showToast from '@/components/ui/Toast';

export function SurveyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<SurveyQuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (id) {
      loadSurvey();
    }
  }, [id]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSurveyQuestionDetail(id!);
      setSurvey(data);
    } catch (error: any) {
      const message = error?.message || t('toast.survey.load_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
      navigate('/sondaje');
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
      await apiService.submitSurveyResponse(id!, { answers });
      showToast.success(t('toast.survey.submit_success'));
      navigate('/sondaje');
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

    switch (question.type) {
      case QuestionType.TEXT:
        return (
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={4}
            placeholder={t('label.survey.response_placeholder')}
            value={answers[questionOrder] || ''}
            onChange={(e) => handleAnswerChange(questionOrder, e.target.value)}
          />
        );

      case QuestionType.SINGLE_CHOICE:
        return (
          <div className="space-y-2">
            {question.options?.map((option: string, optIndex: number) => (
              <label key={optIndex} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${questionOrder}`}
                  value={option}
                  checked={answers[questionOrder] === option}
                  onChange={(e) => handleAnswerChange(questionOrder, e.target.value)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case QuestionType.MULTIPLE_CHOICE:
        return (
          <div className="space-y-2">
            {question.options?.map((option: string, optIndex: number) => {
              const selectedOptions = answers[questionOrder] || [];
              return (
                <label key={optIndex} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option}
                    checked={selectedOptions.includes(option)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...selectedOptions, option]
                        : selectedOptions.filter((o: string) => o !== option);
                      handleAnswerChange(questionOrder, newValue);
                    }}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500 rounded"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              );
            })}
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
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  answers[questionOrder] === rating
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              onClick={() => handleAnswerChange(questionOrder, 'Yes')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                answers[questionOrder] === 'Yes'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => handleAnswerChange(questionOrder, 'No')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                answers[questionOrder] === 'No'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              No
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  if (survey.hasUserResponded) {
    return (
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/sondaje')}
          className="mb-6"
        >
          ← {t('label.survey.back_to_surveys')}
        </Button>

        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mulțumim!</h2>
          <p className="text-gray-600">{t('toast.survey.already_responded')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate('/sondaje')}
        className="mb-6"
      >
        ← {t('label.survey.back_to_surveys')}
      </Button>

      <Card className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{survey.title}</h1>
          <p className="text-gray-600">{survey.description}</p>
          {survey.isAnonymous && (
            <p className="mt-4 text-sm text-purple-600 font-medium">
              Acest sondaj este anonim
            </p>
          )}
        </div>

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
                {renderQuestion(question)}
              </div>
            ))}
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/sondaje')}
          >
            Anulează
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Se trimite...
              </>
            ) : (
              t('label.survey.submit')
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
