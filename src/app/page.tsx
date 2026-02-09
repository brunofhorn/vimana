import {
  MdCalendarToday,
  MdGroups,
  MdMovie,
  MdAdd,
  MdExpandMore,
} from "react-icons/md";

type StatCard = {
  title: string;
  value: string;
  change: string;
  positive: boolean;
};

type PlatformBar = {
  name: string;
  height: string; // em %
};

type TopVideo = {
  id: number;
  title: string;
  platform: string;
  views: string;
  interactions: string;
  engagement: string;
  date: string;
  thumbnail: string;
  alt: string;
};

const stats: StatCard[] = [
  {
    title: "Total de Visualizações",
    value: "1,234,567",
    change: "+5%",
    positive: true,
  },
  {
    title: "Total de Interações",
    value: "89,123",
    change: "-2.1%",
    positive: false,
  },
  {
    title: "Número de Postagens",
    value: "152",
    change: "+10%",
    positive: true,
  },
  {
    title: "Taxa de Engajamento",
    value: "7.2%",
    change: "+0.8%",
    positive: true,
  },
];

const platformBars: PlatformBar[] = [
  { name: "Instagram", height: "60%" },
  { name: "TikTok", height: "80%" },
  { name: "YouTube", height: "50%" },
  { name: "Facebook", height: "30%" },
];

const topVideos: TopVideo[] = [
  {
    id: 1,
    title: "Dicas de Programação para Iniciantes",
    platform: "YouTube",
    views: "1.2M",
    interactions: "58.3k",
    engagement: "12.1%",
    date: "01/03/2024",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDOV2ZJ9wol1LIX4qvZoX_lkOiiq5kzM98PeqB3UDvs-F7h_Dor6S9G3mZAjYKDNg9WYzBLolHGLD0fw6oEnQH8ivaOsuaJpc2aKOVzoUMakfAmrnE9xcvpn8cRRUM0t99grnXu4VKB1lejeiNrHD4rgl5MEUai_pw-zaGMVOvlqn5YpqEytQhhcd8Lw7ZZFe8CzHczhGTNdWs6Gw7RUldKCIcKEs-v9dZKigvd9dTT9C_j8Wyg0pEXLSfZOSHIIaZHQ834vi8nFtrL",
    alt: "Video thumbnail showing code on a screen",
  },
  {
    id: 2,
    title: "Como crescer seu perfil no TikTok",
    platform: "TikTok",
    views: "890k",
    interactions: "120k",
    engagement: "18.5%",
    date: "15/02/2024",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDgLbGD3oXurr7HHHylFo2NsRBG5lBtGurMYxKZ8fgWDtwdnSnSyHslE7eDwc1NQ3wF3bqr6PfM8uqNj53DrRzBZwpTZjsAgV0R0RE6CZIksXPQEQA6ffMNKvvSoH8ytBOJ5jTWmzeao3ZyXtvd3y_2cGcRbbKYhq62B7SmE-O5nFUKkfORcxdE1ab0cWsjlUk3QjSIQQKVMWYuX6jVzSV03IyHAvOphSJeSGCbzFTO3z7CMkPMHqodqTVWweid-rz23t2BKSrLlG1Y",
    alt: "Video thumbnail with various social media logos",
  },
  {
    id: 3,
    title: "Reels: Tour pelo nosso escritório",
    platform: "Instagram",
    views: "560k",
    interactions: "32.1k",
    engagement: "8.9%",
    date: "28/02/2024",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA8DxTqDQ-kA8zyEvR4ejQptKP6h8vwrsnymjEfJS2OcWNHP6vZSNpBnCrfpD3r5wFFEaWyyuliznSG5NsWW-ScQ9bClOrB096dxG21oo4kl47Qx6oCQqJPUbrGl6iIZ_PqBry7SEoQEaIIZdJUyIE2vf4JB3B8bc-r0QCJO4pjGBdL-jP9gnVNq2Mjk1T1AivUNk_cnh6EM70XFMMwbRzdagGAmDLxPxJLxdOwpfms5BtHra97Y8jSvM4wz6RBHqll7wtCNmiM2i8I",
    alt: "Video thumbnail of a smartphone with Instagram open",
  },
  {
    id: 4,
    title: "Bastidores da nossa última campanha",
    platform: "Facebook",
    views: "215k",
    interactions: "5.6k",
    engagement: "4.2%",
    date: "20/02/2024",
    thumbnail:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAUhkhCfDEssnkHY7X0cFP-xkY_z_MWw8Z-vqLTAgI5Dpc_aHdy7x6Q4WuMgz2HecOu15cOU2Ckc1UHAeo3CCxnkMf1P4_2fZO6VwISaSLCeCCt3IxxSRLBubowoV8fAM3D21ls0O3O03zgs-8peJqdoA4br5mFBcObYPuiBCotad5iy2LIDTiCkxq4pmdrSx-ljfUXehmmQYB2xDym8ARjlh-ltzRzUJUaG-sWanApLh7c_Y295KYWXfnjgnnLa-VBJlmJU2z3TsQm",
    alt: "Video thumbnail of a person recording a video",
  },
];

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="mx-auto">
        {/* Page Heading */}
        <div className="flex flex-wrap justify-between gap-3 mb-6">
          <div className="flex min-w-72 flex-col gap-2">
            <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
              Dashboard de Relatórios - Desempenho de Vídeos
            </h1>
            <p className="text-gray-500 dark:text-[#92a4c9] text-base font-normal leading-normal">
              Analise a performance dos seus vídeos nas redes sociais.
            </p>
          </div>
        </div>

        {/* Filtros / Chips */}
        <div className="flex flex-wrap gap-3 mb-6">
          <ChipButton
            iconLeft={<MdCalendarToday size={18} />}
            label="Período: Últimos 7 dias"
            iconRight={<MdExpandMore size={18} />}
          />
          <ChipButton
            iconLeft={<MdGroups size={18} />}
            label="Rede Social: Todas"
            iconRight={<MdExpandMore size={18} />}
          />
          <ChipButton
            iconLeft={<MdMovie size={18} />}
            label="Tipo de Mídia: Vídeo"
            iconRight={<MdExpandMore size={18} />}
          />
          <ChipButton
            iconLeft={<MdAdd size={18} />}
            label="Adicionar Filtro"
          />
        </div>

        {/* Cards de Estatística */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="flex flex-col gap-2 rounded-xl bg-white dark:bg-[#111722] p-6 border border-gray-200 dark:border-[#324467]"
            >
              <p className="text-gray-600 dark:text-white text-base font-medium leading-normal">
                {stat.title}
              </p>
              <p className="text-gray-900 dark:text-white tracking-light text-3xl font-bold leading-tight">
                {stat.value}
              </p>
              <p
                className={`text-base font-medium leading-normal ${
                  stat.positive ? "text-[#0bda5e]" : "text-[#fa6238]"
                }`}
              >
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Barras por plataforma */}
          <div className="flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-[#324467] p-6 bg-white dark:bg-[#111722]">
            <p className="text-gray-800 dark:text-white text-lg font-medium leading-normal">
              Comparativo de Visualizações por Plataforma
            </p>
            <p className="text-gray-900 dark:text-white tracking-light text-[32px] font-bold leading-tight truncate">
              1.2M Visualizações
            </p>
            <div className="flex gap-1">
              <p className="text-gray-500 dark:text-[#92a4c9] text-base font-normal leading-normal">
                Últimos 7 dias
              </p>
              <p className="text-[#0bda5e] text-base font-medium leading-normal">
                +5%
              </p>
            </div>

            <div className="grid min-h-[220px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3 pt-4">
              {platformBars.map((platform) => (
                <div key={platform.name} className="w-full">
                  <div
                    className="bg-primary/20 dark:bg-[#232f48] w-full rounded-t-md"
                    style={{ height: platform.height }}
                  />
                  <p className="mt-2 text-center text-gray-500 dark:text-[#92a4c9] text-sm font-medium leading-normal">
                    {platform.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico de área / linha */}
          <div className="flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-[#324467] p-6 bg-white dark:bg-[#111722]">
            <p className="text-gray-800 dark:text-white text-lg font-medium leading-normal">
              Evolução do Engajamento
            </p>
            <p className="text-gray-900 dark:text-white tracking-light text-[32px] font-bold leading-tight truncate">
              89k Interações
            </p>
            <div className="flex gap-1">
              <p className="text-gray-500 dark:text-[#92a4c9] text-base font-normal leading-normal">
                Últimos 7 dias
              </p>
              <p className="text-[#fa6238] text-base font-medium leading-normal">
                -2.1%
              </p>
            </div>

            <div className="flex min-h-[220px] flex-1 flex-col gap-8 py-4">
              <svg
                fill="none"
                height="100%"
                preserveAspectRatio="none"
                viewBox="-3 0 478 150"
                width="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H0V109Z"
                  fill="url(#paint0_linear_chart)"
                />
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                  stroke="#135bec"
                  strokeLinecap="round"
                  strokeWidth="3"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_chart"
                    x1="236"
                    x2="236"
                    y1="1"
                    y2="149"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#135bec" stopOpacity="0.3" />
                    <stop offset="1" stopColor="#135bec" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="flex justify-around">
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
                  (day) => (
                    <p
                      key={day}
                      className="text-gray-500 dark:text-[#92a4c9] text-sm font-medium leading-normal"
                    >
                      {day}
                    </p>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de vídeos */}
        <div className="rounded-xl border border-gray-200 dark:border-[#324467] bg-white dark:bg-[#111722] overflow-hidden">
          <div className="p-6">
            <h3 className="text-gray-800 dark:text-white text-lg font-medium leading-normal">
              Vídeos com Melhor Desempenho
            </h3>
            <p className="text-gray-500 dark:text-[#92a4c9] text-sm">
              Lista dos vídeos mais populares no período selecionado.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-[#92a4c9] uppercase bg-gray-50 dark:bg-[#192131]">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Vídeo
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Plataforma
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Visualizações
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Interações
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Engajamento
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {topVideos.map((video, index) => (
                  <tr
                    key={video.id}
                    className={`hover:bg-gray-50 dark:hover:bg-[#192131] ${
                      index !== topVideos.length - 1
                        ? "border-b border-gray-200 dark:border-[#324467]"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <img
                          src={video.thumbnail}
                          alt={video.alt}
                          className="w-20 h-12 object-cover rounded-lg"
                        />
                        <span>{video.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{video.platform}</td>
                    <td className="px-6 py-4 text-right">{video.views}</td>
                    <td className="px-6 py-4 text-right">
                      {video.interactions}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {video.engagement}
                    </td>
                    <td className="px-6 py-4">{video.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

type ChipButtonProps = {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  label: string;
};

function ChipButton({ iconLeft, iconRight, label }: ChipButtonProps) {
  return (
    <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-[#232f48] px-4 border border-gray-200 dark:border-transparent">
      {iconLeft && (
        <span className="text-gray-600 dark:text-white flex items-center">
          {iconLeft}
        </span>
      )}
      <p className="text-gray-800 dark:text-white text-sm font-medium leading-normal">
        {label}
      </p>
      {iconRight && (
        <span className="text-gray-600 dark:text-white flex items-center">
          {iconRight}
        </span>
      )}
    </button>
  );
}
