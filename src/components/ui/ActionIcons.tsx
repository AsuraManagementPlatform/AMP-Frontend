import {
    TrashIcon,
    PencilSquareIcon,
    EyeIcon,
    CheckIcon,
    XMarkIcon,
    BellIcon,
    ArrowDownTrayIcon,
    PlusIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    ClockIcon,
    UserPlusIcon,
    EnvelopeIcon,
} from '@heroicons/react/24/outline';

export interface ActionIconProps {
    className?: string;
    onClick?: () => void;
    title?: string;
}

export const DeleteIcon: React.FC<ActionIconProps> = ({ className = 'w-5 h-5', ...props }) => (
    <TrashIcon className={className} {...props} />
);

export const EditIcon: React.FC<ActionIconProps> = ({ className = 'w-5 h-5', ...props }) => (
    <PencilSquareIcon className={className} {...props} />
);

export const ViewIcon: React.FC<ActionIconProps> = ({ className = 'w-5 h-5', ...props }) => (
    <EyeIcon className={className} {...props} />
);

export const ApproveIcon: React.FC<ActionIconProps> = ({ className = 'w-5 h-5', ...props }) => (
    <CheckIcon className={className} {...props} />
);

export const RejectIcon: React.FC<ActionIconProps> = ({ className = 'w-5 h-5', ...props }) => (
    <XMarkIcon className={className} {...props} />
);

export const ReminderIcon: React.FC<ActionIconProps> = ({ className = 'w-5 h-5', ...props }) => (
    <BellIcon className={className} {...props} />
);

export const DownloadIcon: React.FC<ActionIconProps> = ({ className = 'w-5 h-5', ...props }) => (
    <ArrowDownTrayIcon className={className} {...props} />
);

export const AddIcon: React.FC<ActionIconProps> = ({ className = 'w-5 h-5', ...props }) => (
    <PlusIcon className={className} {...props} />
);

export const RefreshIcon: React.FC<ActionIconProps> = ({ className = 'w-5 h-5', ...props }) => (
    <ArrowPathIcon className={className} {...props} />
);

export const DocumentIcon: React.FC<ActionIconProps> = ({ className = 'w-5 h-5', ...props }) => (
    <DocumentTextIcon className={className} {...props} />
);

export const TimeIcon: React.FC<ActionIconProps> = ({ className = 'w-5 h-5', ...props }) => (
    <ClockIcon className={className} {...props} />
);

export const InviteIcon: React.FC<ActionIconProps> = ({ className = 'w-5 h-5', ...props }) => (
    <UserPlusIcon className={className} {...props} />
);

export const MessageIcon: React.FC<ActionIconProps> = ({ className = 'w-5 h-5', ...props }) => (
    <EnvelopeIcon className={className} {...props} />
);

export const ActionIcons = {
    Delete: DeleteIcon,
    Edit: EditIcon,
    View: ViewIcon,
    Approve: ApproveIcon,
    Reject: RejectIcon,
    Reminder: ReminderIcon,
    Download: DownloadIcon,
    Add: AddIcon,
    Refresh: RefreshIcon,
    Document: DocumentIcon,
    Time: TimeIcon,
    Invite: InviteIcon,
    Message: MessageIcon,
};
