import { useAuth } from '../../contexts/AuthContext';
import { WorkItem } from '../../types';
import { detectTeam } from '../../utils/team-detection';
import TechDailyForm from './TechDailyForm';
import MarketingDailyForm from './MarketingDailyForm';
import MediaDailyForm from './MediaDailyForm';
import SaleDailyForm from './SaleDailyForm';

interface TeamFormSelectorProps {
  tasks: WorkItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function TeamFormSelector({ tasks, onClose, onSuccess }: TeamFormSelectorProps) {
  const { currentUser } = useAuth();
  const teamType = detectTeam(currentUser?.departments || []);

  const formProps = { tasks, onClose, onSuccess };

  switch (teamType) {
    case 'tech':
      return <TechDailyForm {...formProps} />;
    case 'marketing':
      return <MarketingDailyForm {...formProps} />;
    case 'media':
      return <MediaDailyForm {...formProps} />;
    case 'sale':
      return <SaleDailyForm {...formProps} />;
    default:
      return <TechDailyForm {...formProps} />;
  }
}
