import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SurveyQuestionDetail, SurveyAssignment } from '../../types/survey.types';
import { apiService } from '../../services/api.service';
import showToast from '@/components/ui/Toast';

interface SurveyDetailModalProps {
  surveyId: string;
  onClose: () => void;
}

export default function SurveyDetailModal({ surveyId, onClose }: SurveyDetailModalProps) {
  const { t } = useTranslation();
  const [survey, setSurvey] = useState<SurveyQuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'responses'>('overview');

  useEffect(() => {
    loadSurveyDetails();
  }, [surveyId]);

  const loadSurveyDetails = async () => {
    try {
      setLoading(true);
      const surveyData = await apiService.getSurveyQuestionDetail(surveyId);
      setSurvey(surveyData);
    } catch (error: any) {
      const message = error?.message || t('toast.survey.load_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data invalidă';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data invalidă';
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Data invalidă';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data invalidă';
    return date.toLocaleString('ro-RO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuestionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      TEXT: 'Text liber',
      SINGLE_CHOICE: 'Alegere unică',
      MULTIPLE_CHOICE: 'Alegere multiplă',
      RATING: 'Rating',
      YES_NO: 'Da/Nu'
    };
    return types[type] || type;
  };

  const renderAnswer = (answer: any, questionType: string) => {
    if (answer === null || answer === undefined) {
      return <span className="text-gray-400 italic">Fără răspuns</span>;
    }

    if (questionType === 'RATING') {
      return <span className="font-medium">⭐ {answer}/5</span>;
    }

    if (questionType === 'YES_NO') {
      return <span className="font-medium">{answer ? 'Da' : 'Nu'}</span>;
    }

    if (Array.isArray(answer)) {
      return (
        <div className="flex flex-wrap gap-1">
          {answer.map((item, idx) => (
            <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {item}
            </span>
          ))}
        </div>
      );
    }

    return <span className="font-medium">{answer}</span>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="text-green-600">Răspuns</span>;
      case 'REMINDED':
        return <span className="text-orange-600">Reminded</span>;
      case 'EXPIRED':
        return <span className="text-red-600">Expirat</span>;
      default:
        return <span className="text-gray-400">În așteptare</span>;
    }
  };

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

  const assignments = survey.assignments || [];
  const respondedCount = assignments.filter(a => a.status === 'COMPLETED').length;
  const totalMembers = assignments.length;
  
  const isExpired = new Date(survey.endDate) < new Date();
  
  const calculateEffectiveStatus = () => {
    if (survey.status === 'DRAFT' || survey.status === 'CLOSED') {
      return survey.status;
    }
    
    if (totalMembers === 0) {
      return survey.status;
    }
    
    const responsePercentage = (respondedCount / totalMembers) * 100;
    
    if (responsePercentage === 100) {
      return 'COMPLETED';
    }
    
    if (isExpired) {
      if (respondedCount === 0) {
        return 'ABANDONED';
      }
      if (respondedCount > 0 && respondedCount < totalMembers) {
        return 'PARTIAL';
      }
    }
    
    return 'ACTIVE';
  };
  
  const effectiveStatus = calculateEffectiveStatus();

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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

        <div className="border-b border-gray-200">
          <nav className="flex px-6 -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sumar
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'responses'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Răspunsuri ({respondedCount}/{totalMembers})
            </button>
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm text-gray-500">Creat de:</span>
                    <p className="font-medium">{survey.createdByName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Perioada:</span>
                    <p className="font-medium">{formatDate(survey.startDate)} - {formatDate(survey.endDate)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Total răspunsuri:</span>
                    <p className="font-medium">{respondedCount} / {totalMembers}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status:</span>
                    <p className="font-medium">
                      {effectiveStatus === 'ACTIVE' && <span className="text-green-600">Activ</span>}
                      {effectiveStatus === 'COMPLETED' && <span className="text-blue-600">Încheiat</span>}
                      {effectiveStatus === 'PARTIAL' && <span className="text-orange-600">Parțial</span>}
                      {effectiveStatus === 'ABANDONED' && <span className="text-red-600">Abandonat</span>}
                      {effectiveStatus === 'DRAFT' && <span className="text-gray-600">Draft</span>}
                      {effectiveStatus === 'CLOSED' && <span className="text-gray-800">Închis</span>}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Întrebări ({survey.questions.length})</h3>
                  <div className="space-y-3">
                    {survey.questions.map((question, idx) => (
                      <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{idx + 1}.</span>
                              <span className="font-medium text-gray-900">{question.text}</span>
                              {question.isRequired && <span className="text-red-500">*</span>}
                            </div>
                            <span className="text-xs text-gray-500 ml-6">{getQuestionTypeLabel(question.type)}</span>
                          </div>
                        </div>
                        {question.options && question.options.length > 0 && (
                          <div className="ml-6 mt-2 flex flex-wrap gap-2">
                            {question.options.map((option, optIdx) => (
                              <span key={optIdx} className="text-sm px-2 py-1 bg-gray-100 rounded">
                                {option}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'responses' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Răspunsuri membri ({respondedCount} au răspuns din {totalMembers})
                </h3>
                
                {assignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nu există membri selectați</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment: SurveyAssignment) => (
                      <div key={assignment.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {assignment.userName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {assignment.userEmail}
                              </div>
                            </div>
                            {getStatusBadge(assignment.status)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {assignment.completedAt ? formatDateTime(assignment.completedAt) : 'În așteptare'}
                          </span>
                        </div>
                        
                        {assignment.response ? (
                          <div className="p-4 space-y-3 bg-white">
                            {survey.questions.map((question, qIdx) => {
                              const answer = assignment.response?.answers[qIdx.toString()];
                              return (
                                <div key={qIdx} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
                                  <span className="text-sm text-gray-500 font-medium min-w-[20px]">
                                    {qIdx + 1}.
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-700 mb-1 font-medium">{question.text}</p>
                                    <div className="text-sm">{renderAnswer(answer, question.type)}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-400 italic bg-gray-50">
                            Nu a răspuns încă
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  );
}
