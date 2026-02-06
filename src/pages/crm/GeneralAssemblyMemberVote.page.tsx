import Layout from '@/components/layout/Layout';
import { GeneralAssemblyMemberView } from '@/components/general-assembly';

export default function GeneralAssemblyMemberVotePage() {
    return (
        <Layout showNavigation={true}>
            <GeneralAssemblyMemberView />
        </Layout>
    );
}
