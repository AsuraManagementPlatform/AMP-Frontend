import { useState, useContext, useEffect } from 'react';
import { t } from 'i18next';
import { Modal } from '@/components/ui/Modal';
import showToast from '@/components/ui/Toast';
import { apiService } from '@/services/api.service';
import { Question, QuestionType, SurveyQuestionCreate } from '@/types/survey.types';
import { getQuestionTypeOptions } from '@/config/survey.form.config';
import { AuthContext } from '@/context/Auth.context';
import { organizationMemberService } from '@/services/organization-member.service';
import { OrganizationMemberWithDetails } from '@/types/organization-member.types';
import { ActionIcons } from '@/components/ui/ActionIcons';

interface CreateSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateSurveyModal({ isOpen, onClose, onSuccess }: CreateSurveyModalProps) {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [members, setMembers] = useState<OrganizationMemberWithDetails[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    { text: '', type: QuestionType.TEXT, order: 0, isRequired: true, options: [] }
  ]);

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen]);

  const loadMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await organizationMemberService.getList();
      const allMembers = response.organizationMembersList || [];
      
      const sortedMembers = allMembers.sort((a, b) => {
        const isACurrentUser = a.memberDetails?.id === user?.id;
        const isBCurrentUser = b.memberDetails?.id === user?.id;
        
        if (isACurrentUser) return -1;
        if (isBCurrentUser) return 1;
        
        const nameA = a.memberDetails?.fullName || '';
        const nameB = b.memberDetails?.fullName || '';
        return nameA.localeCompare(nameB);
      });
      
      setMembers(sortedMembers);
    } catch (error: any) {
      const message = error?.message || t('toast.members.load_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    } finally {
      setLoadingMembers(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { 
        text: '', 
        type: QuestionType.TEXT, 
        order: questions.length, 
        isRequired: true,
        options: []
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated.map((q, i) => ({ ...q, order: i })));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'type') {
      if (value === QuestionType.SINGLE_CHOICE || value === QuestionType.MULTIPLE_CHOICE) {
        updated[index].options = [''];
      } else {
        updated[index].options = undefined;
      }
    }
    
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    if (!updated[questionIndex].options) {
      updated[questionIndex].options = [];
    }
    updated[questionIndex].options!.push('');
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    if (updated[questionIndex].options) {
      updated[questionIndex].options![optionIndex] = value;
    }
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options) {
      updated[questionIndex].options = updated[questionIndex].options!.filter((_, i) => i !== optionIndex);
    }
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.organizationId) {
      showToast.error(t('toast.survey.no_organization'));
      return;
    }
    
    if (!title || !description || !startDate || !endDate) {
      showToast.error(t('toast.survey.fill_required_fields'));
      return;
    }

    if (selectedMembers.length === 0) {
      showToast.error(t('toast.survey.select_recipients'));
      return;
    }

    if (questions.length === 0 || questions.some(q => !q.text)) {
      showToast.error(t('toast.survey.add_questions'));
      return;
    }

    const choiceQuestions = questions.filter(
      q => q.type === QuestionType.SINGLE_CHOICE || q.type === QuestionType.MULTIPLE_CHOICE
    );
    if (choiceQuestions.some(q => !q.options || q.options.length < 2 || q.options.some(o => !o))) {
      showToast.error(t('toast.survey.choice_questions_need_options'));
      return;
    }

    try {
      setIsSubmitting(true);
      
      const surveyData: SurveyQuestionCreate = {
        organization: user!.organizationId,
        title,
        description,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isAnonymous: false,
        selectedMembers: selectedMembers,
        questions: questions.map(q => ({
          ...q,
          options: q.options?.filter(o => o.trim() !== '')
        }))
      };

      await apiService.createSurveyQuestion(surveyData);
      
      const message = t('toast.survey.created_success');
      showToast.success(message);
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      const message = error?.message || t('toast.survey.creation_failed');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setSelectedMembers([]);
    setQuestions([{ text: '', type: QuestionType.TEXT, order: 0, isRequired: true, options: [] }]);
  };

  const questionTypeOptions = getQuestionTypeOptions();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('label.survey.create_survey')}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('label.survey.title')} *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder={t('label.survey.title_placeholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('label.survey.description')} *
          </label>
          <textarea
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder={t('label.survey.description_placeholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('label.survey.start_date')} *
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('label.survey.end_date')} *
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('label.survey.recipients')} *
          </label>
          {loadingMembers ? (
            <div className="text-sm text-gray-500 py-2">Se încarcă membrii...</div>
          ) : (
            <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto p-2 space-y-1">
              <div className="flex items-center p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  id="select_all"
                  checked={selectedMembers.length === members.length && members.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMembers(members.map(m => m.memberDetails?.id || '').filter(id => id));
                    } else {
                      setSelectedMembers([]);
                    }
                  }}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="select_all" className="ml-2 block text-sm font-medium text-gray-700">
                  Selectează toți membrii
                </label>
              </div>
              {members.map((member) => {
                const typeLabels: Record<string, string> = {
                  'EMPLOYEE': 'Angajat',
                  'VOLUNTEER': 'Voluntar',
                  'MEMBER': 'Membru'
                };
                const typeLabel = typeLabels[member.type] || member.type;
                const isCurrentUser = member.memberDetails?.id === user?.id;
                const userId = member.memberDetails?.id || '';
                
                return (
                  <div key={member.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      id={`member_${member.id}`}
                      checked={selectedMembers.includes(userId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers([...selectedMembers, userId]);
                        } else {
                          setSelectedMembers(selectedMembers.filter(id => id !== userId));
                        }
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`member_${member.id}`} className="ml-2 block text-sm text-gray-700 flex-1">
                      <div className="flex items-center justify-between">
                        <span>
                          {member.memberDetails?.fullName || 'Nume necunoscut'}
                          {isCurrentUser && <span className="text-primary-600 font-medium ml-1">(Tu)</span>}
                        </span>
                        <span className="text-gray-500 text-xs">({typeLabel})</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {member.memberDetails?.email || 'Email necunoscut'}
                      </div>
                    </label>
                  </div>
                );
              })}
              {members.length === 0 && (
                <div className="text-sm text-gray-500 py-2 text-center">
                  Nu există membri în organizație
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Selectează membrii care vor primi acest sondaj
          </p>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{t('label.survey.questions')}</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center px-3 py-1.5 border-2 border-primary-600 text-primary-600 font-medium rounded-lg hover:bg-primary-600 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="text-lg mr-1">+</span>
              {t('label.survey.add_question')}
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-900">
                    {t('label.survey.question')} {qIndex + 1}
                  </h4>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                      title={t('label.survey.delete_question')}
                    >
                      <ActionIcons.Delete />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('label.survey.question_text')} *
                    </label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(qIndex, 'text', e.target.value)}
                      placeholder={t('label.survey.question_text_placeholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('label.survey.question_type')} *
                      </label>
                      <select
                        value={question.type}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateQuestion(qIndex, 'type', e.target.value as QuestionType)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        required
                      >
                        {questionTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`required_${qIndex}`}
                        checked={question.isRequired}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(qIndex, 'isRequired', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`required_${qIndex}`} className="ml-2 block text-sm text-gray-700">
                        {t('label.survey.question_required')}
                      </label>
                    </div>
                  </div>

                  {(question.type === QuestionType.SINGLE_CHOICE || question.type === QuestionType.MULTIPLE_CHOICE) && (
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {t('label.survey.options')} *
                        </label>
                        <button
                          type="button"
                          onClick={() => addOption(qIndex)}
                          className="inline-flex items-center px-2 py-1 text-sm border-2 border-primary-600 text-primary-600 font-medium rounded hover:bg-primary-600 hover:text-white transition-all duration-200"
                        >
                          <span className="mr-1">+</span>
                          {t('label.survey.add_option')}
                        </button>
                      </div>
                      <div className="space-y-2">
                        {question.options?.map((option, oIndex) => (
                          <div key={oIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOption(qIndex, oIndex, e.target.value)}
                              placeholder={`${t('label.survey.option')} ${oIndex + 1}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              required
                            />
                            {question.options!.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeOption(qIndex, oIndex)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
                                title={t('label.survey.delete_option')}
                              >
                                <ActionIcons.Delete />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-base bg-transparent text-gray-600 hover:bg-gray-100 shadow-sm hover:shadow-md font-semibold"
          >
            {t('label.survey.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-base bg-transparent text-orange-500 hover:bg-orange-500 hover:text-white shadow-sm hover:shadow-md font-semibold"
          >
            {isSubmitting ? t('label.survey.saving') : t('label.survey.create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
