import pnrrLogo from '../../assets/img/Pachet logo-uri PNRR/compuse/PNG/logo UE_NextGEN_Guv. RO_PNRR_COLOR_RGB_A4.png';

const PNRRBanner = () => {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-2 sm:py-3">
          <img
            src={pnrrLogo}
            alt="Finanțat de Uniunea Europeană NextGenerationEU - PNRR"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default PNRRBanner;
