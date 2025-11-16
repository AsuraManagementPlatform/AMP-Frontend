import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { SurveyList } from '@/components/survey/SurveyList';
import { SurveyDetail } from '@/components/survey/SurveyDetail';
import { SurveyResults } from '@/components/survey/SurveyResults';

export default function SurveysPage() {
  return (
    <Layout showNavigation={true}>
      <Routes>
        <Route index element={<SurveyList />} />
        <Route path=":id" element={<SurveyDetail />} />
        <Route path=":id/results" element={<SurveyResults />} />
      </Routes>
    </Layout>
  );
}
