if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

document.getElementById('btnEntrar').addEventListener('click', () => {
  const login = document.getElementById('login').value;
  const senha = document.getElementById('senha').value;
  const mensagemErro = document.getElementById('mensagemErro');

  fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, senha })
  })
    .then(resposta => resposta.json())
    .then(dados => {
      if (dados.token) {
        localStorage.setItem('token', dados.token);
        localStorage.setItem('id', dados.id);
        localStorage.setItem('nome', dados.nome);
        localStorage.setItem('papel', dados.papel);
        mensagemErro.textContent = '';
        window.location.href = 'venda.html';
      } else {
        mensagemErro.textContent = dados.mensagem || 'Erro ao fazer login';
      }
    })
    .catch(erro => {
      console.error(erro);
      mensagemErro.textContent = 'Erro ao conectar com o servidor';
    });
});