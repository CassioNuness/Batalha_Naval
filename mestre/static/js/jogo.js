const tabuleiro = document.getElementById('tabuleiro');
const linhas = 10;
const colunas = 10;
let jogadorAtual = 1;
let vidasJogador1 = 3;
let vidasJogador2 = 3;
let acertosJogador1 = 0;
let acertosJogador2 = 0;
const totalAcertosParaVencer = 15;

const minas = gerarMinas(10);
const navios = gerarNavios();

function gerarCoordenadasAleatorias(qtd, ocupadas = []) {
  const coordenadas = [];
  while (coordenadas.length < qtd) {
    const linha = Math.floor(Math.random() * linhas);
    const coluna = Math.floor(Math.random() * colunas);
    const key = `${linha}-${coluna}`;
    if (!ocupadas.includes(key) && !coordenadas.includes(key)) {
      coordenadas.push(key);
    }
  }
  return coordenadas;
}

function gerarMinas(qtd) {
  return gerarCoordenadasAleatorias(qtd);
}

function gerarNavios() {
  const navios = {};
  const ocupadas = new Set(minas);

  const modelos = [
    { nome: 'porta_avioes1', tamanho: 3 },
    { nome: 'submarino1', tamanho: 3 },
    { nome: 'submarino2', tamanho: 3 },
    { nome: 'cruzador1', tamanho: 3 },
    { nome: 'cruzador2', tamanho: 3 },
    { nome: 'cruzador3', tamanho: 3 },
    { nome: 'destroier1', tamanho: 2 },
    { nome: 'destroier2', tamanho: 2 }
  ];

  for (const modelo of modelos) {
    let colocado = false;
    while (!colocado) {
      const linha = Math.floor(Math.random() * linhas);
      const coluna = Math.floor(Math.random() * colunas);
      const partes = [];

      for (let i = 0; i < modelo.tamanho; i++) {
        const l = linha;
        const c = coluna + i;
        const key = `${l}-${c}`;
        if (l >= linhas || c >= colunas || ocupadas.has(key)) break;
        partes.push(key);
      }

      if (partes.length === modelo.tamanho) {
        partes.forEach((pos, i) => {
          let tipo;
          if (modelo.tamanho === 2) {
            tipo = i === 0 ? 'frente' : 'tras';
          } else {
            tipo = i === 0 ? 'frente' : (i === modelo.tamanho - 1 ? 'tras' : 'meio');
          }
          navios[pos] = `${modelo.nome}_${tipo}`;
          ocupadas.add(pos);
        });
        colocado = true;
      }
    }
  }

  return navios;
}

function construirTabuleiro() {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, linhas).split('');
  const numeros = Array.from({ length: colunas }, (_, i) => (i + 1).toString());

  tabuleiro.innerHTML = '';

  const vazio = document.createElement('div');
  vazio.classList.add('label');
  tabuleiro.appendChild(vazio);

  for (let num of numeros) {
    const label = document.createElement('div');
    label.classList.add('label');
    label.textContent = num;
    tabuleiro.appendChild(label);
  }

  for (let linha = 0; linha < linhas; linha++) {
    const labelLinha = document.createElement('div');
    labelLinha.classList.add('label');
    labelLinha.textContent = letras[linha];
    tabuleiro.appendChild(labelLinha);

    for (let coluna = 0; coluna < colunas; coluna++) {
      const celula = document.createElement('div');
      celula.classList.add('celula');
      celula.dataset.posicao = `${linha}-${coluna}`;
      celula.addEventListener('click', clicouNaCelula);
      tabuleiro.appendChild(celula);
    }
  }

  mostrarMensagemRodada();
  atualizarPainelJogador();
}

function mostrarMensagemRodada() {
  const mensagem = document.getElementById('mensagem-rodada');
  const nomeJogador = jogadorAtual === 1 ? "Jogador 1" : "Jogador 2";
  mensagem.textContent = `🚩 Rodada de ${nomeJogador}`;
  mensagem.classList.add('visivel');

  setTimeout(() => {
    mensagem.classList.remove('visivel');
  }, 2000);
}

function atualizarPainelJogador() {
  const vidas1 = document.getElementById('vidas-jogador1');
  const vidas2 = document.getElementById('vidas-jogador2');

  vidas1.classList.toggle('jogador-ativo', jogadorAtual === 1);
  vidas2.classList.toggle('jogador-ativo', jogadorAtual === 2);
}

function clicouNaCelula(e) {
  const celula = e.target;
  const posicao = celula.dataset.posicao;

  if (celula.classList.contains('clicada')) return;

  celula.classList.add('clicada');

  if (minas.includes(posicao)) {
    celula.classList.add('mina');
    celula.style.backgroundImage = 'url("/static/img/bombas.png")';
    perderVida();
    trocarJogador();
  } else if (navios[posicao]) {
    const imagem = navios[posicao];
    celula.classList.add('acerto');
    celula.style.backgroundImage = `url("/static/img/${imagem}.png")`;

    if (jogadorAtual === 1) acertosJogador1++;
    else acertosJogador2++;

    if (acertosJogador1 + acertosJogador2 >= totalAcertosParaVencer) {
      let mensagemFinal = "";
      if (acertosJogador1 > acertosJogador2) {
        mensagemFinal = `🏆 Jogador 1 venceu com ${acertosJogador1} acertos!`;
      } else if (acertosJogador2 > acertosJogador1) {
        mensagemFinal = `🏆 Jogador 2 venceu com ${acertosJogador2} acertos!`;
      } else {
        mensagemFinal = `🤝 Empate! Ambos os jogadores têm ${acertosJogador1} acertos.`;
      }
      alert(mensagemFinal);
      setTimeout(() => window.location.href = '/vitoria', 500);
      return;
    }
    // jogador mantém vez após acerto
  } else {
    celula.classList.add('agua');
    celula.style.backgroundImage = 'url("/static/img/mar.png")';
    trocarJogador();
  }
}

function perderVida() {
  if (jogadorAtual === 1) {
    const coracao = document.getElementById('v1_' + vidasJogador1);
    if (coracao) coracao.src = '/static/img/coracao_vazio.png';
    vidasJogador1--;
    if (vidasJogador1 === 0) {
      alert(`💥 Jogador 1 perdeu todas as vidas! Fim de jogo.`);
      setTimeout(() => window.location.href = '/gameover', 500);
    }
  } else {
    const coracao = document.getElementById('v2_' + vidasJogador2);
    if (coracao) coracao.src = '/static/img/coracao_vazio.png';
    vidasJogador2--;
    if (vidasJogador2 === 0) {
      alert(`💥 Jogador 2 perdeu todas as vidas! Fim de jogo.`);
      setTimeout(() => window.location.href = '/gameover', 500);
    }
  }
}

function trocarJogador() {
  jogadorAtual = jogadorAtual === 1 ? 2 : 1;
  atualizarPainelJogador();
  mostrarMensagemRodada();
}

construirTabuleiro();
