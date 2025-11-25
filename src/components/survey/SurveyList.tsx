import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { apiService } from '@/services/api.service';
import { SurveyQuestion } from '@/types/survey.types';
import { Card } from '@/components/ui/Card';
import showToast from '@/components/ui/Toast';
import { CreateSurveyModal } from '@/components/modals/survey/CreateSurveyModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AuthContext } from '@/context/Auth.context';
import SurveyDetailModal from './SurveyDetailModal';
import { ActionIcons } from '@/components/ui/ActionIcons';

export function SurveyList() {
  const [surveys, setSurveys] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const isAdmin = authContext?.user?.groups?.includes('admin') || 
                  authContext?.user?.groups?.includes('organization_admin') || false;

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = isAdmin 
        ? await apiService.getActiveSurveyQuestions()
        : await apiService.getMySurveys();
      setSurveys(data);
    } catch (error: any) {
      const message = error?.message || t('toast.survey.load_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (surveyId: string) => {
    try {
      await apiService.deleteSurveyQuestion(surveyId);
      showToast.success(t('toast.survey.delete_success'));
      loadSurveys();
    } catch (error: any) {
      const message = error?.message || t('toast.survey.delete_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    } finally {
      setSurveyToDelete(null);
    }
  };

  const handleSendReminder = async (surveyId: string) => {
    try {
      await apiService.sendSurveyReminder(surveyId);
      showToast.success(t('toast.survey.reminder_sent'));
    } catch (error: any) {
      const message = error?.message || t('toast.survey.reminder_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const hasResponded = (survey: any) => {
    return survey.hasResponded || survey.assignmentStatus === 'COMPLETED';
  };

  const calculateEffectiveStatus = (survey: SurveyQuestion) => {
    if (survey.status === 'DRAFT' || survey.status === 'CLOSED') {
      return survey.status;
    }
    
    const isExpired = new Date(survey.endDate) < new Date();
    const totalAssignments = survey.totalAssignments || 0;
    const responseCount = survey.responseCount || 0;
    
    if (totalAssignments === 0) {
      return survey.status;
    }
    
    const responsePercentage = (responseCount / totalAssignments) * 100;
    
    if (responsePercentage === 100) {
      return 'COMPLETED';
    }
    
    if (isExpired) {
      if (responseCount === 0) {
        return 'ABANDONED';
      }
      if (responseCount > 0 && responseCount < totalAssignments) {
        return 'PARTIAL';
      }
    }
    
    return 'ACTIVE';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('label.survey.active_surveys')}</h2>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-base bg-transparent text-orange-500 hover:bg-orange-500 hover:text-white shadow-sm hover:shadow-md font-semibold"
          >
            {t('label.survey.create_survey')}
          </button>
        )}
      </div>

      {surveys.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('label.survey.no_active_surveys')}</h3>
          <p className="text-gray-500">{t('label.survey.no_active_surveys')}</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titlu
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descriere
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Termen limită
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Întrebări
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Răspunsuri
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {surveys.map((survey) => {
                  const surveyOverdue = isOverdue(survey.endDate);
                  const surveyResponded = hasResponded(survey);
                  const needsAttention = !surveyResponded;
                  
                  return (
                    <tr 
                      key={survey.id} 
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${surveyResponded ? 'bg-green-50' : ''}`}
                      onClick={() => setSelectedSurveyId(survey.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-900">{survey.title}</div>
                          {needsAttention && !surveyOverdue && <span className="text-yellow-500" title="Sondaj necompletat"></span>}
                          {surveyOverdue && !surveyResponded && <span className="text-red-500" title="Sondaj expirat"></span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {!surveyResponded && !surveyOverdue && (
                            <button
                              onClick={() => navigate(`/sondaje/${survey.id}`)}
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-800 bg-orange-100 border border-orange-300 rounded-lg hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all shadow-sm hover:shadow-md"
                            >
                              <span>Răspunde la sondaj</span>
                            </button>
                          )}
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleSendReminder(survey.id)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                title="Trimite reminder"
                              >
                                <ActionIcons.Reminder />
                              </button>
                              <button
                                onClick={() => setSurveyToDelete(survey.id)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                title={t('label.common.delete')}
                              >
                                <ActionIcons.Delete />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">{survey.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const effectiveStatus = calculateEffectiveStatus(survey);
                          return (
                            <div className="text-sm font-medium">
                              {effectiveStatus === 'ACTIVE' && <span className="text-green-600">{t('label.survey.status_active')}</span>}
                              {effectiveStatus === 'COMPLETED' && <span className="text-blue-600">{t('label.survey.status_completed')}</span>}
                              {effectiveStatus === 'PARTIAL' && <span className="text-orange-600">{t('label.survey.status_partial')}</span>}
                              {effectiveStatus === 'ABANDONED' && <span className="text-red-600">{t('label.survey.status_abandoned')}</span>}
                              {effectiveStatus === 'DRAFT' && <span className="text-gray-600">{t('label.survey.status_draft')}</span>}
                              {effectiveStatus === 'CLOSED' && <span className="text-gray-800">{t('label.survey.status_closed')}</span>}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${surveyOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                          {formatDate(survey.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{survey.questions.length}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{survey.responseCount}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showCreateModal && (
        <CreateSurveyModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadSurveys}
        />
      )}

      {surveyToDelete && (
        <ConfirmDialog
          isOpen={!!surveyToDelete}
          onClose={() => setSurveyToDelete(null)}
          onConfirm={() => handleDelete(surveyToDelete)}
          title={t('label.survey.delete_confirm_title')}
          message={t('label.survey.delete_confirm_message')}
          confirmText={t('action.delete')}
          cancelText={t('action.cancel')}
        />
      )}

      {selectedSurveyId && (
        <SurveyDetailModal
          surveyId={selectedSurveyId}
          onClose={() => setSelectedSurveyId(null)}
        />
      )}
    </div>
  );
}
