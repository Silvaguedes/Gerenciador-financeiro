const form = document.getElementById("form")
const descricao = document.getElementById("descricao")
const valor = document.getElementById("valor")
const lista = document.getElementById("lista")
const saldo = document.getElementById("saldo")

let transacoes = JSON.parse(localStorage.getItem("transacoes")) || []
let chart

//  FORMATADOR DE MOEDA
function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })
}

// EVENTO DO FORM
form.addEventListener("submit", function (e) {
    e.preventDefault()

    const desc = descricao.value.trim()
    const val = Number(valor.value)

    if (!desc || isNaN(val) || val === 0) {
        alert("Preencha os campos corretamente!")
        return
    }

    adicionarTransacao(desc, val)

    descricao.value = ""
    valor.value = ""
})

// ADICIONAR TRANSAÇÃO
function adicionarTransacao(desc, val) {
    const nova = {
        id: Date.now(),
        descricao: desc,
        valor: val
    }

    transacoes.push(nova)
    atualizarTela()
}

// ATUALIZAR TELA
function atualizarTela() {
    lista.innerHTML = ""

    transacoes.forEach(transacao => {
        const li = document.createElement("li")

        li.classList.add(transacao.valor > 0 ? "entrada" : "saida")

        li.innerHTML = `
            ${transacao.descricao} - ${formatarMoeda(transacao.valor)}
            <button onclick="remover(${transacao.id})">❌</button>
        `

        lista.appendChild(li)
    })

    atualizarSaldo()
    atualizarGrafico()

    localStorage.setItem("transacoes", JSON.stringify(transacoes))
}

// ATUALIZAR SALDO
function atualizarSaldo() {
    const total = transacoes.reduce((acc, t) => acc + t.valor, 0)

    const entradas = transacoes
        .filter(t => t.valor > 0)
        .reduce((acc, t) => acc + t.valor, 0)

    const saidas = transacoes
        .filter(t => t.valor < 0)
        .reduce((acc, t) => acc + t.valor, 0)

    saldo.innerText = formatarMoeda(total)
    document.getElementById("entrada").innerText = formatarMoeda(entradas)
    document.getElementById("saida").innerText = formatarMoeda(saidas)
}

// REMOVER TRANSAÇÃO
function remover(id) {
    transacoes = transacoes.filter(t => t.id !== id)
    atualizarTela()
}

//GRÁFICO (Chart.js)
function atualizarGrafico() {
    const entradas = transacoes
        .filter(t => t.valor > 0)
        .reduce((acc, t) => acc + t.valor, 0)

    const saidas = transacoes
        .filter(t => t.valor < 0)
        .reduce((acc, t) => acc + Math.abs(t.valor), 0)

    const ctx = document.getElementById("grafico").getContext("2d")

    if (chart) {
        chart.destroy()
    }

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Entradas", "Saídas"],
            datasets: [{
                data: [entradas, saidas],
                backgroundColor: ["#4caf50", "#f44336"],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // 👈 ESSENCIAL
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    })
}

// INICIALIZAÇÃO
atualizarTela()