const TAXA_ENTREGA = 8.9;
const CHAVE_CARRINHO = "pizzaria-napoli-carrinho";

const carrinho = [];
const botoesPedir = document.querySelectorAll(".botao-pedir");
const botoesQuantidade = document.querySelectorAll(".botao-quantidade");
const botoesCategoria = document.querySelectorAll(".botao-categoria");
const cardsPizza = document.querySelectorAll(".card-pizza");
const listaCarrinho = document.getElementById("lista-carrinho");
const mensagemCarrinho = document.getElementById("mensagem-carrinho");
const subtotalCarrinho = document.getElementById("subtotal-carrinho");
const taxaEntrega = document.getElementById("taxa-entrega");
const totalCarrinho = document.getElementById("total-carrinho");
const contadorCarrinho = document.getElementById("contador-carrinho");
const mensagemFiltro = document.getElementById("mensagem-filtro");
const botaoRevisar = document.getElementById("botao-revisar");
const modalRevisao = document.getElementById("modal-revisao");
const formRevisao = document.getElementById("form-revisao");
const listaRevisao = document.getElementById("lista-revisao");
const mensagemRevisao = document.getElementById("mensagem-revisao");
const subtotalRevisao = document.getElementById("subtotal-revisao");
const taxaRevisao = document.getElementById("taxa-revisao");
const totalRevisao = document.getElementById("total-revisao");
const modalConfirmacao = document.getElementById("modal-confirmacao");
const resumoConfirmacao = document.getElementById("resumo-confirmacao");
const botaoVoltarRevisao = document.getElementById("botao-voltar-revisao");
const botaoConfirmarPedido = document.getElementById("botao-confirmar-pedido");
const botaoFecharRevisao = document.querySelector("[data-fechar-revisao]");
const botaoFecharConfirmacao = document.querySelector("[data-fechar-confirmacao]");
const formContato = document.getElementById("form-contato");
const campoNomeContato = document.getElementById("contato-nome");
const campoEmailContato = document.getElementById("contato-email");
const campoMensagemContato = document.getElementById("contato-mensagem");
const erroNomeContato = document.getElementById("erro-nome");
const erroEmailContato = document.getElementById("erro-email");
const erroMensagemContato = document.getElementById("erro-mensagem");
const mensagemSucessoContato = document.getElementById("mensagem-sucesso");
const botaoEnviarContato = document.getElementById("botao-enviar-contato");
const temPaginaPedido = Boolean(listaCarrinho && listaRevisao && botaoRevisar && formRevisao);

const formatarMoeda = (valor) => valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
});

const escaparHtml = (valor) => String(valor).replace(/[&<>"']/g, (caractere) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
}[caractere]));

function buscarItem(id) {
    return carrinho.find((item) => item.id === id);
}

function salvarCarrinho() {
    // Salva o carrinho no localStorage usando JSON.stringify para guardar o array como texto.
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}

function carregarCarrinhoSalvo() {
    // Recupera o carrinho do localStorage usando JSON.parse para voltar o texto para array.
    const carrinhoSalvo = localStorage.getItem(CHAVE_CARRINHO);

    if (!carrinhoSalvo) {
        return;
    }

    try {
        const itensSalvos = JSON.parse(carrinhoSalvo);

        if (!Array.isArray(itensSalvos)) {
            return;
        }

        carrinho.splice(0, carrinho.length, ...itensSalvos.filter((item) => (
            item.id &&
            item.nome &&
            Number.isFinite(Number(item.preco)) &&
            Number.isFinite(Number(item.quantidade)) &&
            Number(item.quantidade) > 0
        )).map((item) => ({
            id: item.id,
            nome: item.nome,
            preco: Number(item.preco),
            quantidade: Number(item.quantidade)
        })));
    } catch (erro) {
        carrinho.splice(0, carrinho.length);
    }
}

function atualizarControleCard(id) {
    const item = buscarItem(id);
    const botaoAdicionar = document.querySelector(`.botao-pedir[data-id="${id}"]`);
    const controle = document.querySelector(`.controle-quantidade[data-id="${id}"]`);

    if (!botaoAdicionar || !controle) {
        return;
    }

    const quantidadeCard = controle.querySelector(".quantidade-card");
    const temItem = Boolean(item);

    botaoAdicionar.hidden = temItem;
    controle.hidden = !temItem;
    quantidadeCard.textContent = item?.quantidade ?? 1;
}

function atualizarControlesCards() {
    botoesPedir.forEach((botao) => atualizarControleCard(botao.dataset.id));
}

function calcularTotais() {
    const quantidadeTotal = carrinho.reduce((soma, pizza) => soma + pizza.quantidade, 0);
    const subtotal = carrinho.reduce((soma, pizza) => soma + pizza.preco * pizza.quantidade, 0);
    const entrega = quantidadeTotal > 0 ? TAXA_ENTREGA : 0;

    return {
        quantidadeTotal,
        subtotal,
        entrega,
        total: subtotal + entrega
    };
}

function montarItemCarrinho(pizza) {
    const item = document.createElement("li");
    item.className = "item-carrinho";

    item.innerHTML = `
        <div class="info-item-carrinho">
            <span>${pizza.nome}</span>
            <small>${pizza.quantidade} x ${formatarMoeda(pizza.preco)}</small>
            <strong>${formatarMoeda(pizza.preco * pizza.quantidade)}</strong>
        </div>
        <div class="acoes-item-carrinho" aria-label="Editar ${pizza.nome}">
            <button type="button" class="botao-quantidade-carrinho" data-acao="diminuir" data-id="${pizza.id}" aria-label="Diminuir quantidade de ${pizza.nome}">-</button>
            <span>${pizza.quantidade}</span>
            <button type="button" class="botao-quantidade-carrinho" data-acao="aumentar" data-id="${pizza.id}" aria-label="Aumentar quantidade de ${pizza.nome}">+</button>
            <button type="button" class="botao-remover" data-id="${pizza.id}" aria-label="Remover ${pizza.nome}">
                Remover
            </button>
        </div>
    `;

    return item;
}

function preencherListaCarrinho(lista) {
    lista.innerHTML = "";

    carrinho.forEach((pizza) => {
        lista.appendChild(montarItemCarrinho(pizza));
    });
}

function atualizarCarrinho() {
    const totais = calcularTotais();

    preencherListaCarrinho(listaCarrinho);
    preencherListaCarrinho(listaRevisao);

    subtotalCarrinho.textContent = formatarMoeda(totais.subtotal);
    taxaEntrega.textContent = formatarMoeda(totais.entrega);
    totalCarrinho.textContent = formatarMoeda(totais.total);
    subtotalRevisao.textContent = formatarMoeda(totais.subtotal);
    taxaRevisao.textContent = formatarMoeda(totais.entrega);
    totalRevisao.textContent = formatarMoeda(totais.total);
    contadorCarrinho.textContent = `${totais.quantidadeTotal} ${totais.quantidadeTotal === 1 ? "item" : "itens"}`;
    mensagemCarrinho.style.display = totais.quantidadeTotal === 0 ? "block" : "none";
    mensagemRevisao.style.display = totais.quantidadeTotal === 0 ? "block" : "none";
    botaoRevisar.disabled = totais.quantidadeTotal === 0;
    atualizarControlesCards();
}

function adicionarProduto(botao) {
    carrinho.push({
        id: botao.dataset.id,
        nome: botao.dataset.nome,
        preco: Number(botao.dataset.preco),
        quantidade: 1
    });

    salvarCarrinho();
    atualizarCarrinho();
}

function alterarQuantidade(id, acao) {
    const item = buscarItem(id);

    if (!item) {
        return;
    }

    if (acao === "aumentar") {
        item.quantidade += 1;
    }

    if (acao === "diminuir") {
        item.quantidade -= 1;
    }

    if (item.quantidade <= 0) {
        const indice = carrinho.findIndex((pizza) => pizza.id === id);
        if (indice >= 0) {
            carrinho.splice(indice, 1);
        }
    }

    salvarCarrinho();
    atualizarCarrinho();
}

function removerProduto(id) {
    const indice = carrinho.findIndex((pizza) => pizza.id === id);

    if (indice >= 0) {
        carrinho.splice(indice, 1);
    }

    salvarCarrinho();
    atualizarCarrinho();
}

function abrirModal(modal) {
    // Abre o modal adicionando a classe que exibe a div oculta.
    modal.classList.add("aberto");
    modal.setAttribute("aria-hidden", "false");
}

function fecharModal(modal) {
    // Fecha o modal removendo a classe que deixa a div visivel.
    modal.classList.remove("aberto");
    modal.setAttribute("aria-hidden", "true");
}

function filtrarProdutos(categoriaSelecionada) {
    let totalVisivel = 0;

    cardsPizza.forEach((card) => {
        const deveExibir = categoriaSelecionada === "todos" || card.dataset.categoria === categoriaSelecionada;
        card.hidden = !deveExibir;

        if (deveExibir) {
            totalVisivel += 1;
        }
    });

    mensagemFiltro.hidden = totalVisivel > 0;
}

function validarEmail(email) {
    // Valida o e-mail com uma regex simples.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mostrarErro(campo, elementoErro, mensagem) {
    campo.classList.add("campo-invalido");
    elementoErro.textContent = mensagem;
}

function limparErro(campo, elementoErro) {
    campo.classList.remove("campo-invalido");
    elementoErro.textContent = "";
}

function validarCampoContato(campo) {
    const nome = campoNomeContato.value.trim();
    const email = campoEmailContato.value.trim();
    const mensagem = campoMensagemContato.value.trim();

    if (campo === campoNomeContato) {
        // Valida os campos obrigatórios.
        if (!nome) {
            mostrarErro(campoNomeContato, erroNomeContato, "Informe seu nome.");
            return false;
        }

        limparErro(campoNomeContato, erroNomeContato);
        return true;
    }

    if (campo === campoEmailContato) {
        if (!email) {
            mostrarErro(campoEmailContato, erroEmailContato, "Informe seu e-mail.");
            return false;
        }

        // Valida o formato do e-mail.
        if (!validarEmail(email)) {
            mostrarErro(campoEmailContato, erroEmailContato, "Informe um e-mail válido.");
            return false;
        }

        limparErro(campoEmailContato, erroEmailContato);
        return true;
    }

    if (campo === campoMensagemContato) {
        if (!mensagem) {
            mostrarErro(campoMensagemContato, erroMensagemContato, "Escreva sua mensagem.");
            return false;
        }

        // Valida o tamanho mínimo da mensagem.
        if (mensagem.length < 10) {
            mostrarErro(campoMensagemContato, erroMensagemContato, "A mensagem deve ter pelo menos 10 caracteres.");
            return false;
        }

        limparErro(campoMensagemContato, erroMensagemContato);
        return true;
    }

    return true;
}

function validarFormularioContato() {
    // Validação em tempo real: confere os três campos e habilita o botão só quando tudo está correto.
    const nome = campoNomeContato.value.trim();
    const email = campoEmailContato.value.trim();
    const mensagem = campoMensagemContato.value.trim();
    const formularioValido = Boolean(nome && validarEmail(email) && mensagem.length >= 10);

    botaoEnviarContato.disabled = !formularioValido;
    return formularioValido;
}

function validarFormularioContatoComErros() {
    const nomeValido = validarCampoContato(campoNomeContato);
    const emailValido = validarCampoContato(campoEmailContato);
    const mensagemValida = validarCampoContato(campoMensagemContato);
    const formularioValido = nomeValido && emailValido && mensagemValida;

    botaoEnviarContato.disabled = !formularioValido;
    return formularioValido;
}

if (temPaginaPedido) {
    botoesPedir.forEach((botao) => {
        botao.addEventListener("click", () => adicionarProduto(botao));
    });

    botoesQuantidade.forEach((botao) => {
        botao.addEventListener("click", () => alterarQuantidade(botao.dataset.id, botao.dataset.acao));
    });

    botoesCategoria.forEach((botao) => {
        botao.addEventListener("click", () => {
            botoesCategoria.forEach((item) => item.classList.remove("ativo"));
            botao.classList.add("ativo");
            filtrarProdutos(botao.dataset.categoria);
        });
    });

    listaCarrinho.addEventListener("click", (evento) => {
        const botaoRemover = evento.target.closest(".botao-remover");
        const botaoQuantidade = evento.target.closest(".botao-quantidade-carrinho");

        if (botaoQuantidade) {
            alterarQuantidade(botaoQuantidade.dataset.id, botaoQuantidade.dataset.acao);
            return;
        }

        if (!botaoRemover) {
            return;
        }

        removerProduto(botaoRemover.dataset.id);
    });

    listaRevisao.addEventListener("click", (evento) => {
        const botaoRemover = evento.target.closest(".botao-remover");
        const botaoQuantidade = evento.target.closest(".botao-quantidade-carrinho");

        if (botaoQuantidade) {
            alterarQuantidade(botaoQuantidade.dataset.id, botaoQuantidade.dataset.acao);
            return;
        }

        if (botaoRemover) {
            removerProduto(botaoRemover.dataset.id);
        }
    });

    botaoRevisar.addEventListener("click", () => {
        if (carrinho.length === 0) {
            return;
        }

        atualizarCarrinho();
        abrirModal(modalRevisao);
    });

    botaoFecharRevisao.addEventListener("click", () => fecharModal(modalRevisao));
    botaoFecharConfirmacao.addEventListener("click", () => fecharModal(modalConfirmacao));

    formRevisao.addEventListener("submit", (evento) => {
        evento.preventDefault();

        if (carrinho.length === 0 || !formRevisao.reportValidity()) {
            return;
        }

        const dados = new FormData(formRevisao);
        const totais = calcularTotais();
        const complemento = dados.get("complemento") || "Sem complemento";

        // Preenche dinamicamente o resumo do pedido com pizzas, entrega, pagamento e total.
        const itens = carrinho.map((pizza) => `
            <li>
                <span>${pizza.quantidade} x ${escaparHtml(pizza.nome)}</span>
                <strong>${formatarMoeda(pizza.preco * pizza.quantidade)}</strong>
            </li>
        `).join("");

        resumoConfirmacao.innerHTML = `
            <section>
                <h3>Itens</h3>
                <ul class="lista-confirmacao">${itens}</ul>
            </section>
            <section>
                <h3>Entrega</h3>
                <p><strong>Nome:</strong> ${escaparHtml(dados.get("nome"))}</p>
                <p><strong>Telefone:</strong> ${escaparHtml(dados.get("telefone"))}</p>
                <p><strong>Endereço:</strong> ${escaparHtml(dados.get("endereco"))}</p>
                <p><strong>Complemento:</strong> ${escaparHtml(complemento)}</p>
            </section>
            <section>
                <h3>Pagamento</h3>
                <p>${escaparHtml(dados.get("pagamento"))}</p>
            </section>
            <section>
                <h3>Total</h3>
                <div class="resumo-carrinho">
                    <div class="linha-resumo"><span>Subtotal</span><strong>${formatarMoeda(totais.subtotal)}</strong></div>
                    <div class="linha-resumo"><span>Entrega</span><strong>${formatarMoeda(totais.entrega)}</strong></div>
                    <div class="linha-resumo linha-total"><span>Total</span><strong>${formatarMoeda(totais.total)}</strong></div>
                </div>
            </section>
        `;

        fecharModal(modalRevisao);
        abrirModal(modalConfirmacao);
    });

    botaoVoltarRevisao.addEventListener("click", () => {
        fecharModal(modalConfirmacao);
        abrirModal(modalRevisao);
    });

    botaoConfirmarPedido.addEventListener("click", () => {
        carrinho.splice(0, carrinho.length);
        formRevisao.reset();
        salvarCarrinho();
        atualizarCarrinho();
        fecharModal(modalConfirmacao);
        alert("Pedido confirmado com sucesso!");
    });

    // Atualiza a interface depois de recuperar os dados salvos no navegador.
    carregarCarrinhoSalvo();
    atualizarCarrinho();
}

if (formContato) {
    formContato.addEventListener("submit", (evento) => {
        // Bloqueia o envio para validar tudo no front-end.
        evento.preventDefault();
        mensagemSucessoContato.textContent = "";

        if (!validarFormularioContatoComErros()) {
            return;
        }

        formContato.reset();
        botaoEnviarContato.disabled = true;
        limparErro(campoNomeContato, erroNomeContato);
        limparErro(campoEmailContato, erroEmailContato);
        limparErro(campoMensagemContato, erroMensagemContato);

        // Exibe a mensagem de sucesso após o formulário estar válido.
        mensagemSucessoContato.textContent = "Mensagem enviada com sucesso!";
    });

    [campoNomeContato, campoEmailContato, campoMensagemContato].forEach((campo) => {
        campo.addEventListener("input", () => {
            mensagemSucessoContato.textContent = "";
            validarCampoContato(campo);
            // Atualiza o estado do botão enquanto o usuário digita.
            validarFormularioContato();
        });
    });

    validarFormularioContato();
}
