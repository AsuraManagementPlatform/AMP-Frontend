import { useEffect, useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FormModal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import showToast from '@/components/ui/Toast';
import generalAssemblyService from '@/services/general-assembly.service';
import { GeneralAssemblyDetail, OrganizationMember, MeetingType, AgendaItemInput } from '@/types/general-assembly.types';
import { useAuth } from '@/hooks/useAuth';

interface GeneralAssemblyCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (assembly: GeneralAssemblyDetail) => void;
}

export const GeneralAssemblyCreateModal = ({ isOpen, onClose, onCreated }: GeneralAssemblyCreateModalProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('12:00');
    const [meetingType, setMeetingType] = useState<MeetingType>('ONLINE');
    const [location, setLocation] = useState('');
    const [agendaItems, setAgendaItems] = useState<AgendaItemInput[]>([{ title: '', description: '', requiresVote: false, documents: [] }]);
    const [includeAllEligible, setIncludeAllEligible] = useState(true);
    const [additionalParticipants, setAdditionalParticipants] = useState<string[]>([]);
    const [allMembers, setAllMembers] = useState<OrganizationMember[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

    const timeOptions = useMemo(() => {
        const options: string[] = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) {
                const hour = h.toString().padStart(2, '0');
                const minute = m.toString().padStart(2, '0');
                options.push(`${hour}:${minute}`);
            }
        }
        return options;
    }, []);

    const eligibleMembers = useMemo(() => allMembers.filter(m => m.isEligible && m.id !== user?.id), [allMembers, user?.id]);

    const searchResults = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        const filtered = allMembers.filter(m => m.id !== user?.id);
        if (!term) return filtered;
        return filtered.filter(m => 
            m.fullName.toLowerCase().includes(term) || m.email.toLowerCase().includes(term)
        );
    }, [allMembers, searchTerm, user?.id]);

    useEffect(() => {
        if (isOpen) {
            loadAllMembers();
        }
    }, [isOpen]);

    const loadAllMembers = async () => {
        try {
            const members = await generalAssemblyService.getAllMembers();
            setAllMembers(members);
        } catch (error: any) {
            const message = error?.message || t('toast.general_assembly.load_members_error');
            showToast.error(message.includes('.') ? t(message) : message);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setStartDate('');
        setStartTime('09:00');
        setEndDate('');
        setEndTime('12:00');
        setMeetingType('ONLINE');
        setLocation('');
        setAgendaItems([{ title: '', description: '', requiresVote: false, documents: [] }]);
        setIncludeAllEligible(true);
        setAdditionalParticipants([]);
        setSearchTerm('');
        setIsSubmitting(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const updateAgendaItem = (index: number, field: keyof AgendaItemInput, value: string | boolean) => {
        setAgendaItems(prev => prev.map((item, i) => 
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const addAgendaItem = () => {
        setAgendaItems(prev => [...prev, { title: '', description: '', requiresVote: false, documents: [] }]);
    };

    const removeAgendaItem = (index: number) => {
        setAgendaItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileSelect = (index: number, files: FileList | null) => {
        if (!files || files.length === 0) return;
        setAgendaItems(prev => prev.map((item, i) => 
            i === index 
                ? { ...item, documents: [...(item.documents || []), ...Array.from(files)] } 
                : item
        ));
    };

    const removeDocument = (agendaIndex: number, docIndex: number) => {
        setAgendaItems(prev => prev.map((item, i) => 
            i === agendaIndex 
                ? { ...item, documents: (item.documents || []).filter((_, di) => di !== docIndex) }
                : item
        ));
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const addParticipant = (member: OrganizationMember) => {
        if (!additionalParticipants.includes(member.id)) {
            setAdditionalParticipants(prev => [...prev, member.id]);
        }
        setSearchTerm('');
    };

    const removeParticipant = (userId: string) => {
        setAdditionalParticipants(prev => prev.filter(id => id !== userId));
    };

    const getAddedMembersDetails = () => {
        return allMembers.filter(m => additionalParticipants.includes(m.id));
    };

    const handleSubmit = async () => {
        const validAgendaItems = agendaItems.filter(item => item.title.trim());
        
        if (!title.trim() || !startDate || !endDate) {
            showToast.error(t('toast.general_assembly.invalid_data'));
            return;
        }

        if (meetingType === 'IN_PERSON' && !location.trim()) {
            showToast.error(t('toast.general_assembly.location_required'));
            return;
        }

        const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
        const endDateTime = new Date(`${endDate}T${endTime}`).toISOString();
        const now = new Date();

        if (new Date(endDateTime) <= now) {
            showToast.error(t('toast.general_assembly.end_date_must_be_future'));
            return;
        }

        try {
            setIsSubmitting(true);
            const assembly = await generalAssemblyService.create({
                title: title.trim(),
                description: description.trim() || undefined,
                startDate: startDateTime,
                endDate: endDateTime,
                meetingType,
                location: location.trim() || undefined,
                agendaItems: validAgendaItems.map(({ documents, ...rest }) => rest),
                includeAllEligible,
                manualParticipants: additionalParticipants.length > 0 ? additionalParticipants : undefined
            });
            
            const hasDocuments = validAgendaItems.some(item => item.documents && item.documents.length > 0);
            if (hasDocuments && assembly.agendaItems) {
                for (let i = 0; i < validAgendaItems.length; i++) {
                    const agendaItemDocs = validAgendaItems[i].documents;
                    if (agendaItemDocs && agendaItemDocs.length > 0) {
                        const createdAgendaItem = assembly.agendaItems.find(ai => ai.order === i + 1);
                        if (createdAgendaItem) {
                            for (const file of agendaItemDocs) {
                                try {
                                    await generalAssemblyService.uploadAgendaItemDocument(createdAgendaItem.id, file);
                                } catch {
                                }
                            }
                        }
                    }
                }
            }
            
            showToast.success(t('toast.general_assembly.create_success'));
            onCreated(assembly);
            handleClose();
        } catch (error: any) {
            const message = error?.message || t('toast.general_assembly.create_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormModal isOpen={isOpen} onClose={handleClose} title={t('label.general_assembly.create_title')} size="xl">
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('label.general_assembly.title')} *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        placeholder={t('label.general_assembly.title_placeholder')}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('label.general_assembly.description')}
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        placeholder={t('label.general_assembly.description_placeholder')}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('label.general_assembly.meeting_type')} *
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="meetingType"
                                value="ONLINE"
                                checked={meetingType === 'ONLINE'}
                                onChange={() => setMeetingType('ONLINE')}
                                className="text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-sm">{t('label.general_assembly.meeting_type_online')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="meetingType"
                                value="IN_PERSON"
                                checked={meetingType === 'IN_PERSON'}
                                onChange={() => setMeetingType('IN_PERSON')}
                                className="text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-sm">{t('label.general_assembly.meeting_type_in_person')}</span>
                        </label>
                    </div>
                </div>

                {meetingType === 'IN_PERSON' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('label.general_assembly.location')} *
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder={t('label.general_assembly.location_placeholder')}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('label.general_assembly.start_date')} *
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
                            {t('label.general_assembly.start_time')} *
                        </label>
                        <select
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        >
                            {timeOptions.map(time => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('label.general_assembly.end_date')} *
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
                            {t('label.general_assembly.end_time')} *
                        </label>
                        <select
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        >
                            {timeOptions.map(time => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                            {t('label.general_assembly.agenda_items')}
                        </label>
                        <Button variant="secondary" size="sm" onClick={addAgendaItem}>
                            {t('label.general_assembly.add_agenda_item')}
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {agendaItems.map((item, index) => (
                            <div key={`agenda-${index}`} className="p-4 bg-gray-50 rounded-lg space-y-3">
                                <div className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 space-y-3">
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => updateAgendaItem(index, 'title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                            placeholder={t('label.general_assembly.agenda_item_title_placeholder')}
                                        />
                                        <textarea
                                            value={item.description}
                                            onChange={(e) => updateAgendaItem(index, 'description', e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                                            placeholder={t('label.general_assembly.agenda_item_description_placeholder')}
                                        />
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={item.requiresVote}
                                                onChange={(e) => updateAgendaItem(index, 'requiresVote', e.target.checked)}
                                                className="rounded text-orange-500 focus:ring-orange-500"
                                            />
                                            <span className="text-sm text-gray-700">{t('label.general_assembly.requires_vote')}</span>
                                        </label>
                                        
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="file"
                                                    ref={(el) => { fileInputRefs.current[index] = el; }}
                                                    onChange={(e) => handleFileSelect(index, e.target.files)}
                                                    className="hidden"
                                                    multiple
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRefs.current[index]?.click()}
                                                    className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                    {t('label.general_assembly.attach_documents')}
                                                </button>
                                            </div>
                                            {item.documents && item.documents.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {item.documents.map((doc, docIdx) => (
                                                        <div key={docIdx} className="flex items-center justify-between bg-white px-2 py-1 rounded text-sm">
                                                            <span className="text-gray-700 truncate max-w-[200px]">{doc.name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-gray-500">{formatFileSize(doc.size)}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeDocument(index, docIdx)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {agendaItems.length > 1 && (
                                        <Button variant="danger" size="sm" onClick={() => removeAgendaItem(index)}>
                                            {t('label.common.remove')}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        {t('label.general_assembly.participants')}
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                        <input
                            type="checkbox"
                            checked={includeAllEligible}
                            onChange={(e) => setIncludeAllEligible(e.target.checked)}
                            className="rounded text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">
                            {t('label.general_assembly.include_all_eligible')} ({eligibleMembers.length} {t('label.general_assembly.members')})
                        </span>
                    </label>

                    <div className="relative mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('label.general_assembly.add_additional_members')}
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder={t('label.general_assembly.search_members_placeholder')}
                        />
                        {isSearchFocused && searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {searchResults.map(member => {
                                    const isAlreadyAdded = additionalParticipants.includes(member.id);
                                    const isEligibleAndIncluded = member.isEligible && includeAllEligible;
                                    return (
                                        <div
                                            key={member.id}
                                            onClick={() => !isAlreadyAdded && !isEligibleAndIncluded && addParticipant(member)}
                                            className={`p-3 border-b last:border-b-0 ${
                                                isAlreadyAdded || isEligibleAndIncluded 
                                                    ? 'bg-gray-100 cursor-not-allowed' 
                                                    : 'hover:bg-orange-50 cursor-pointer'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-900">{member.fullName}</span>
                                                    <span className="text-xs text-gray-500 ml-2">{member.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {member.isEligible ? (
                                                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                                            {t('label.general_assembly.eligible_badge')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                                                            {t('label.general_assembly.non_eligible_badge')}
                                                        </span>
                                                    )}
                                                    {isAlreadyAdded && (
                                                        <span className="text-xs text-blue-600">
                                                            {t('label.general_assembly.already_added')}
                                                        </span>
                                                    )}
                                                    {isEligibleAndIncluded && !isAlreadyAdded && (
                                                        <span className="text-xs text-green-600">
                                                            {t('label.general_assembly.included_auto')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {getAddedMembersDetails().length > 0 && (
                        <div className="mt-3">
                            <p className="text-xs font-medium text-gray-500 mb-2 uppercase">
                                {t('label.general_assembly.additional_participants')} ({getAddedMembersDetails().length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {getAddedMembersDetails().map(member => (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
                                    >
                                        <span className="text-sm text-gray-700">{member.fullName}</span>
                                        {!member.isEligible && (
                                            <span className="text-xs text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                                                {t('label.general_assembly.non_eligible_badge')}
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeParticipant(member.id)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                    {t('label.common.cancel')}
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? t('label.common.creating') : t('label.general_assembly.create_button')}
                </Button>
            </div>
        </FormModal>
    );
};
