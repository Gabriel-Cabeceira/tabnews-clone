import Head from 'next/head';
import Script from 'next/script';

function Home() {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://sac-dev.ascbrazil.com.br/public/chat/new/chatInline.css" />
      </Head>
      {/* Scripts em ordem, usando next/script */}
      <Script src="https://sac-dev.ascbrazil.com.br/public/js/jquery/jquery-3.7.1.min.js" strategy="beforeInteractive" />
      <Script src="https://sac-dev.ascbrazil.com.br/public/js/Core.min.js" strategy="beforeInteractive" />
      <Script src="https://sac-dev.ascbrazil.com.br/public/js/basil/src/basil.js" strategy="beforeInteractive" />
      <Script src="https://sac-dev.ascbrazil.com.br/public/js/basil/src/basil.list.js" strategy="beforeInteractive" />
      <Script src="https://sac-dev.ascbrazil.com.br/public/js/basil/src/basil.set.js" strategy="beforeInteractive" />
      <Script src="https://sac-dev.ascbrazil.com.br/Painel/public/js/templates/socket.io.js" strategy="beforeInteractive" />
      <Script id="chat-vars" strategy="beforeInteractive">{`
        var chtfltUrl = "https://sac-dev.ascbrazil.com.br/Chat/id/conta28";
        var chtfltTitulo = "";
        var chtfltVarComplementar = "";
        var chtfltTema = "skin-blue";
        var chtfltLanguage = "pt-BR";
        var chtfltRobo = "0";
        var chtfltUrlImg = "";
      `}</Script>
      <Script src="https://sac-dev.ascbrazil.com.br/public/chat/new/chatInline.js" strategy="afterInteractive" />
      <div id="chtflt" style={{ display: 'none' }}></div>
      <h1>Olá &lt;3</h1>
    </>
  );
}

export default Home;