import React from 'react';

interface HomePageProps {
  onStartChat: () => void;
}

const BookCard: React.FC<{ imgSrc: string; title: string; alt: string }> = ({ imgSrc, title, alt }) => (
    <div className="group flex flex-col items-center text-center">
        <img src={imgSrc} alt={alt} className="w-40 h-64 object-cover rounded-lg shadow-lg transform group-hover:scale-105 group-hover:shadow-xl transition-all duration-300" />
        <h4 className="mt-4 font-semibold text-stone-700">{title}</h4>
    </div>
);

const HomePage: React.FC<HomePageProps> = ({ onStartChat }) => {
  return (
    <div className="bg-stone-50 text-stone-800 font-serif antialiased">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-stone-50/80 backdrop-blur-md z-50 shadow-sm transition-all duration-300">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                    <span className="font-bold text-xl font-['Playfair_Display',_serif] text-stone-900">Machado de Assis</span>
                </div>
                <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                        <a href="#home" className="text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md text-sm font-medium">Início</a>
                        <a href="#autor" className="text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md text-sm font-medium">O Autor</a>
                        <a href="#obra" className="text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md text-sm font-medium">A Obra</a>
                        <a href="#encontro" className="text-stone-600 hover:text-stone-900 px-3 py-2 rounded-md text-sm font-medium">O Encontro</a>
                    </div>
                </div>
            </div>
        </nav>
      </header>
      
      <main>
        {/* Hero Section */}
        <section id="home" className="relative pt-16 min-h-screen flex items-center justify-center bg-stone-800">
            <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Rio_de_Janeiro_ca_1890.jpg" alt="Rio de Janeiro no século XIX" className="absolute inset-0 w-full h-full object-cover"/>
            <div className="relative z-20 text-center text-white p-8">
                <h1 className="text-5xl md:text-7xl font-bold font-['Playfair_Display',_serif] mb-4 drop-shadow-lg">Diálogos com Machado</h1>
                <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 leading-relaxed drop-shadow-md">
                    Através das brumas do tempo, um convite à reflexão. Ouse partilhar de uma conversa com a mente que desvendou os labirintos da alma humana e a crônica de uma época.
                </p>
                <button
                    onClick={onStartChat}
                    className="bg-stone-800/80 text-white font-bold py-3 px-10 rounded-lg text-lg shadow-lg border border-white/50 hover:bg-white hover:text-stone-900 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-stone-300/50"
                    aria-label="Iniciar Diálogo com Machado de Assis"
                >
                    Iniciar Diálogo
                </button>
            </div>
        </section>

        {/* The Author Section */}
        <section id="autor" className="py-20 md:py-32 bg-stone-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold font-['Playfair_Display',_serif]">O Autor</h2>
                    <div className="mt-4 w-24 h-1 bg-stone-800 mx-auto"></div>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-center md:text-left">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Machado_de_Assis_by_Duque_Estrada_em_1903.jpg/800px-Machado_de_Assis_by_Duque_Estrada_em_1903.jpg" alt="Retrato de Machado de Assis" className="rounded-lg shadow-2xl mx-auto md:mx-0 w-3/4 md:w-full max-w-sm" />
                    </div>
                    <div className="text-stone-700 leading-relaxed text-lg space-y-6">
                        <p>
                            Joaquim Maria Machado de Assis (1839-1908), o "Bruxo do Cosme Velho", não foi apenas um escritor; foi um cronista da alma brasileira. Nascido no Rio de Janeiro, superou origens humildes para se tornar jornalista, contista, romancista, poeta e o primeiro presidente da Academia Brasileira de Letras.
                        </p>
                        <p>
                            Sua prosa é marcada por uma elegância ímpar, uma ironia fina e um profundo pessimismo sobre a natureza humana. Ele observou a sociedade de seu tempo com um olhar cético e penetrante, revelando as vaidades, as contradições e os pequenos dramas que compõem o grande teatro da vida.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* The Work Section */}
        <section id="obra" className="py-20 md:py-32 bg-stone-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold font-['Playfair_Display',_serif]">A Obra</h2>
                    <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">Um legado imortal que transcende as páginas e continua a dialogar com cada nova geração de leitores.</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 justify-items-center">
                    <BookCard imgSrc="https://machadodeassis-ia.com.br/wp-content/uploads/2024/05/815uSBDpJL._AC_UF10001000_QL80_.jpg" title="Memórias Póstumas de Brás Cubas" alt="Capa de Memórias Póstumas de Brás Cubas" />
                    <BookCard imgSrc="https://machadodeassis-ia.com.br/wp-content/uploads/2024/05/Dom.jpg" title="Dom Casmurro" alt="Capa de Dom Casmurro" />
                    <BookCard imgSrc="https://machadodeassis-ia.com.br/wp-content/uploads/2024/05/Imagem-do-WhatsApp-de-2024-05-25-as-19.44.11_ca61784b-1.jpg" title="Quincas Borba" alt="Capa de Quincas Borba" />
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section id="encontro" className="py-20 md:py-32 bg-stone-800 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <h2 className="text-4xl md:text-5xl font-bold font-['Playfair_Display',_serif] mb-6">O Encontro</h2>
                 <p className="text-xl text-stone-300 mb-10 leading-relaxed">As palavras aguardam. A reflexão o espera. O que você diria a Machado de Assis?</p>
                 <button
                    onClick={onStartChat}
                    className="bg-white text-stone-900 font-bold py-3 px-10 rounded-lg text-lg shadow-lg hover:bg-stone-200 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-stone-300/50"
                    aria-label="Iniciar Diálogo com Machado de Assis"
                >
                    Fale com Machado
                </button>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
              <p>2024 Diálogos com Machado de Assis. Uma homenagem literária.</p>
              <p className="mt-2">Todas as imagens e referências à obra de Machado de Assis são utilizadas para fins educacionais e de homenagem.</p>
          </div>
      </footer>
    </div>
  );
};

export default HomePage;
