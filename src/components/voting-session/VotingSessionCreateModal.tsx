import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormModal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import showToast from '@/components/ui/Toast';
import votingSessionService from '@/services/voting-session.service';
import { VotingSessionDetail } from '@/types/voting-session.types';

interface VotingSessionCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (session: VotingSessionDetail) => void;
}

export const VotingSessionCreateModal = ({ isOpen, onClose, onCreated }: VotingSessionCreateModalProps) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('10:00');
    const [meetPassword, setMeetPassword] = useState('');
    const [questions, setQuestions] = useState<string[]>(['']);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setStartDate('');
        setStartTime('09:00');
        setEndDate('');
        setEndTime('10:00');
        setMeetPassword('');
        setQuestions(['']);
        setIsSubmitting(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const updateQuestion = (index: number, value: string) => {
        setQuestions(prev => prev.map((q, i) => (i === index ? value : q)));
    };

    const addQuestion = () => {
        setQuestions(prev => [...prev, '']);
    };

    const removeQuestion = (index: number) => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        const trimmedQuestions = questions.map(q => q.trim()).filter(Boolean);
        if (!title.trim() || !startDate || !endDate || trimmedQuestions.length === 0) {
            showToast.error(t('toast.voting_session.invalid_data'));
            return;
        }

        const startDateTime = `${startDate}T${startTime}`;
        const endDateTime = `${endDate}T${endTime}`;

        try {
            setIsSubmitting(true);
            const session = await votingSessionService.create({
                title: title.trim(),
                description: description.trim() || undefined,
                startDate: startDateTime,
                endDate: endDateTime,
                meetPassword: meetPassword.trim() || undefined,
                questions: trimmedQuestions.map(text => ({ text }))
            });
            showToast.success(t('toast.voting_session.create_success'));
            onCreated(session);
            handleClose();
        } catch (error: any) {
            const message = error?.message || t('toast.voting_session.create_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormModal isOpen={isOpen} onClose={handleClose} title={t('label.voting_session.create_title')} size="lg">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('label.voting_session.title')}
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        placeholder={t('label.voting_session.title_placeholder')}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('label.voting_session.description')}
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        placeholder={t('label.voting_session.description_placeholder')}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('label.voting_session.start_date')}
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('label.voting_session.start_time')}
                        </label>
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('label.voting_session.end_date')}
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('label.voting_session.end_time')}
                        </label>
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('label.voting_session.meet_password')}
                    </label>
                    <input
                        type="text"
                        value={meetPassword}
                        onChange={(e) => setMeetPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        placeholder={t('label.voting_session.meet_password_placeholder')}
                    />
                    <p className="mt-1 text-xs text-gray-500">{t('label.voting_session.meet_password_hint')}</p>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                            {t('label.voting_session.questions')}
                        </label>
                        <Button variant="secondary" size="sm" onClick={addQuestion}>
                            {t('label.voting_session.add_question')}
                        </Button>
                    </div>
                    {questions.map((question, index) => (
                        <div key={`question-${index}`} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => updateQuestion(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                placeholder={t('label.voting_session.question_placeholder')}
                            />
                            {questions.length > 1 && (
                                <Button variant="danger" size="sm" onClick={() => removeQuestion(index)}>
                                    {t('label.common.remove')}
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        {t('label.common.cancel')}
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
                        {t('label.voting_session.create_button')}
                    </Button>
                </div>
            </div>
        </FormModal>
    );
};
