import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { apiService } from '@/services/api.service';
import { SurveyResults as SurveyResultsType, QuestionType } from '@/types/survey.types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import showToast from '@/components/ui/Toast';

export function SurveyResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<SurveyResultsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadResults();
    }
  }, [id]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSurveyResults(id!);
      setResults(data);
    } catch (error: any) {
      const message = error?.message || t('toast.survey.load_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionResults = (question: any) => {
    const { type, answers } = question;

    if (!answers || answers.length === 0) {
      return <p className="text-gray-500 italic">{t('label.survey.no_responses')}</p>;
    }

    switch (type) {
      case QuestionType.TEXT:
        return (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {answers.map((answer: string, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-gray-700">{answer}</p>
              </div>
            ))}
          </div>
        );

      case QuestionType.SINGLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE:
        const answerCounts = answers.reduce((acc: Record<string, number>, answer: string | string[]) => {
          const options = Array.isArray(answer) ? answer : [answer];
          options.forEach((opt: string) => {
            acc[opt] = (acc[opt] || 0) + 1;
          });
          return acc;
        }, {});

        const total = type === QuestionType.SINGLE_CHOICE ? answers.length : answers.flat().length;

        return (
          <div className="space-y-3">
            {Object.entries(answerCounts).map(([option, count]) => {
              const percentage = ((count as number / total) * 100).toFixed(1);
              return (
                <div key={option} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{option}</span>
                    <span className="text-gray-600">{count as number} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case QuestionType.RATING:
        const ratingCounts = answers.reduce((acc: Record<number, number>, answer: number) => {
          acc[answer] = (acc[answer] || 0) + 1;
          return acc;
        }, {});

        const totalRatings = answers.length;
        const avgRating = (answers.reduce((sum: number, val: number) => sum + val, 0) / totalRatings).toFixed(1);

        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{avgRating}</div>
                <div className="text-sm text-gray-600">{t('label.survey.average')}</div>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingCounts[rating] || 0;
                  const percentage = ((count / totalRatings) * 100).toFixed(1);
                  return (
                    <div key={rating} className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700 w-8">{rating}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-16">{count} ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case QuestionType.YES_NO:
        const yesCount = answers.filter((a: any) => a === true || a === 'Yes').length;
        const noCount = answers.filter((a: any) => a === false || a === 'No').length;
        const totalYesNo = answers.length;

        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="text-3xl font-bold text-green-600">{yesCount}</div>
              <div className="text-sm text-gray-600">{t('label.survey.yes')} ({((yesCount / totalYesNo) * 100).toFixed(1)}%)</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
              <div className="text-3xl font-bold text-red-600">{noCount}</div>
              <div className="text-sm text-gray-600">{t('label.survey.no')} ({((noCount / totalYesNo) * 100).toFixed(1)}%)</div>
            </div>
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

  if (!results) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate('/sondaje')}
        className="mb-6"
      >
        ← {t('label.survey.back_to_surveys')}
      </Button>

      <Card className="p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('label.survey.results_title')}</h1>
              <div className="flex items-center text-gray-600 mt-1">
                <span>{results.totalResponses} {t('label.survey.responses')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {results.questions.map((question, index) => (
            <div key={question.order} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {index + 1}. {question.question}
                </h3>
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {question.type.replace('_', ' ')}
                </span>
              </div>
              {renderQuestionResults(question)}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
