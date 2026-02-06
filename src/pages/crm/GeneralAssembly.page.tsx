import Layout from '@/components/layout/Layout';
import { GeneralAssemblies } from '@/components/general-assembly';

export default function GeneralAssemblyPage() {
    return (
        <Layout showNavigation={true}>
            <GeneralAssemblies />
        </Layout>
    );
}
