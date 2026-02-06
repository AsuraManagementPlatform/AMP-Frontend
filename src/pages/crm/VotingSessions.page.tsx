import Layout from '@/components/layout/Layout';
import { VotingSessions } from '@/components/voting-session/VotingSessions';

export default function VotingSessionsPage() {
    return (
        <Layout showNavigation={true}>
            <VotingSessions />
        </Layout>
    );
}
