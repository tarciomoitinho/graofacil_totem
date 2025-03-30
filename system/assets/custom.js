// document.addEventListener('contextmenu', event => event.preventDefault());
// $('body').bind('copy paste', function (e) {
//     e.preventDefault();
// });

let produto = localStorage.getItem('produto') || '';
let pesoIntervalo = parseInt(localStorage.getItem('pesoIntervalo')) || 0;
let valorKG = localStorage.getItem('valorKG') || 0;
let pesoMaximo = parseInt(localStorage.getItem('pesoMaximo')) || 0;
let pesoAtual = 0;
let valorAtual = 0;
let metodos = localStorage.getItem('metodos') || '';
let internet = 0;
let load = 0;
let statusSilo = 1;
var intervalId = 0;
let url_api = 'https://app.graofacil.agr.br/api/v1/pdv';
let token = 'AibfI47wkfDDtmJV2QCixTVEIljIFEFrsWKPlleFAy03dfW9b4IveGLms3QmAWfj';
let serial = localStorage.getItem('serial');
let venda = '';

var min = 5, seg = 0;
let contagemSessao = 0;
let timerConsultaPix = 0;
let timerProgresso = 0;

function sessao() {
    if ((min > 0) || (seg > 0)) {
        if (seg == 0) {
            seg = 59;
            min = min - 1
        }
        else {
            seg = seg - 1;
        }
        if (min.toString().length == 1) {
            min = "0" + min;
        }
        if (seg.toString().length == 1) {
            seg = "0" + seg;
        }
        $('.spanRelogio').html(min + ":" + seg);
        contagemSessao = setTimeout(sessao, 1000);
    }
    else {
        $('.spanRelogio').html("00:00");
        location.reload();
    }
}

function statusInternet() {
    fetch(url_api + '/status', {
        method: "GET",
        headers: { "Content-type": "application/json;charset=UTF-8", 'X-API-Key': token }
    }).then(response => {
        internet = 1;
        if (produto != '') {
            load = 1;
        }
    }).catch(error => {
        internet = 0;
        Swal.fire({
            text: 'Falha ao contatar o servidor!',
            icon: 'warning',
            showConfirmButton: false,
            showDenyButton: true,
            showCancelButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            cancelButtonText: "Tentar Novamente",
            denyButtonText: 'Operar Manual',
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.cancel) {
                statusInternet();
            } else if (result.isDenied) {
                window.location = "manual.html"
            }
        });
    });
}

statusInternet();

function buscarInfo() {
    if (!localStorage.getItem('serial')) {
        Swal.fire({
            title: "Serial de Ativação",
            input: "text",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: "Ativar",
            showLoaderOnConfirm: true,
            preConfirm: async (serial) => {
                try {
                    const response = await fetch(url_api + '/serial/' + serial, {
                        method: "GET",
                        headers: { "Content-type": "application/json;charset=UTF-8", 'X-API-Key': token }
                    });
                    if (!response.ok) {
                        return Swal.showValidationMessage("Equipamento não encontrado ou já instalado!");
                    }
                    if (response.ok) {
                        localStorage.setItem('serial', serial);
                        location.reload();
                    }
                } catch (error) {
                    Swal.showValidationMessage(`Requisição falhou: ${error}`);
                }
            },
        });
    } else {
        fetch(url_api + '/equipamento/' + serial, {
            method: "GET",
            headers: { "Content-type": "application/json;charset=UTF-8", 'X-API-Key': token }
        }).then(response => {
            response.json().then(function (data) {
                localStorage.setItem('pesoIntervalo', parseInt(data['peso-intervalo']));
                localStorage.setItem('valorKG', parseFloat(data['valor-kg']));
                localStorage.setItem('pesoMaximo', parseInt(data['peso-maximo']));
                localStorage.setItem('produto', data['produto']);
                localStorage.setItem('metodos', JSON.stringify(data['metodos']));
                load = 1;
                statusSilo = data['status'];

                if (data['status'] == 0) {
                    manuntecao();
                }

            });
        }).catch(err => console.log(err));
    }
}

buscarInfo();

function manuntecao() {
    Swal.fire({
        icon: "warning",
        title: "Manutenção, aguarde...",
        text: "A Grão Fácil agradece sua compreensão!",
        showCancelButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        timer: 15000,
        timerProgressBar: true,
        willClose: () => {
            buscarInfo();
            location.reload();
        }
    });
}

$('#infoModal').on('shown.bs.modal', function (e) {
    $('#infoProduto').html(produto);
    $('#infoPesoIntervalo').html(pesoIntervalo);
    $('#infoValorKG').html(valorKG);
    $('#infoPesoMaximo').html(pesoMaximo);
    $('#infoPesoAtual').html(pesoAtual);
    $('#infoValorAtual').html(valorAtual);
    $('#infoInternet').html(internet);
    $('#infoLoad').html(load);
    $('#infoStatus').html(statusSilo);
});

$(document).on("click", "#nextDivPeso", function () {
    statusInternet();
    if (internet == 1 && load == 1) {
        $('#divIndex').addClass('d-none');
        $('#divPeso').removeClass('d-none');
        $('#peso').html(pesoIntervalo);
        $('#valor').html(parseFloat(pesoIntervalo * valorKG).toFixed(2).replace(".", ","));
        pesoAtual = parseInt($('#peso').html());
        valorAtual = pesoAtual * valorKG;
        if (produto == 'Milho') {
            $('.pMilho').removeClass('d-none');
        } else if (produto == 'Soja') {
            $('.pSoja').removeClass('d-none');
        }
        sessao();
    }
});

$(document).on("click", "#prevDivIndex", function () {
    location.reload();
});

function peso(param) {
    if (param == 'minus' && pesoAtual > pesoIntervalo) {
        pesoAtual = pesoAtual - pesoIntervalo;
    } else if (param == 'plus' && pesoAtual < pesoMaximo) {
        pesoAtual = pesoAtual + pesoIntervalo;
    }
    valorAtual = pesoAtual * valorKG;
    $('#peso').html(pesoAtual);
    $('#valor').html(parseFloat(valorAtual).toFixed(2).replace(".", ","));
}

$('#minus').on('click', function () {
    peso('minus');
});
$('#plus').on('click', function () {
    peso('plus');
});
$('#minus').on('mousedown', function () {
    intervalId = setInterval(function () { peso('minus') }, 200);
});
$('#plus').on('mousedown', function () {
    intervalId = setInterval(function () { peso('plus') }, 200);
});

$(document).on('mouseup', release);

function release() {
    if (intervalId != 0) {
        clearInterval(intervalId); // Limpa o intervalo registrado anteriormente
        intervalId = 0;
    }
}

$(document).on("click", "#nextDivDados", function () {
    statusInternet();
    if (internet == 1 && load == 1) {
        $('#divPeso').addClass('d-none');
        $('#divDados').removeClass('d-none');
        // -----
        $('.resumoPeso').html(pesoAtual);
        $('.resumoProduto').html(produto);
        $('.resumoValor').html(parseFloat(valorAtual).toFixed(2).replace(".", ","));
    }
});

$(document).on("click", "#prevDivPeso", function () {
    $('#divDados').addClass('d-none');
    $('#divPeso').removeClass('d-none');
});

$('#cpf').keyboard({
    type: 'tel',
});
$('#cel').keyboard({
    type: 'tel'
});

$(document).on("click", "#nextDivMetodo", function () {
    statusInternet();
    if (internet == 1 && load == 1) {
        var docCount = $('#cpf').val().length;
        var celCount = $('#cel').val().length;
        if (docCount < 11) {
            validaInput("O número do seu CPF é inválido. A numeração precisa conter 11 dígitos.");
        } else if (docCount > 11 && docCount < 14 || docCount > 14) {
            validaInput("O número de CNPJ é inválido. A numeração precisa conter 14 dígitos.");
        } else if (celCount < 11 || celCount > 11) {
            validaInput("O número de celular (WhatsApp) é inválido. A numeração precisa conter 11 dígitos.");
        } else {
            if ($("#metodosPagamento").find(".btn-pagamento").length == 0) {
                JSON.parse(metodos).forEach((response, key) => {
                    var newBTN = '<div class="col-md-12 mb-3">' +
                        '<button class="btn btn-outline-warning w-75 py-5 btn-pagamento" style="font-size: 45px" data-id="' + response.id + '" data-nome="' + response.metodo + '">' +
                        '<i class="' + response.icone + '"></i><br>' + response.metodo + '</button>' +
                        '</div>';
                    $("#metodosPagamento").append(newBTN);
                });
            }
            $('#divDados').addClass('d-none');
            $('#divMetodo').removeClass('d-none');
        }
    }
});

$(document).on("click", "#prevDivDados", function () {
    $('#divMetodo').addClass('d-none');
    $('#divDados').removeClass('d-none');
});

function validaInput(texto) {
    Swal.fire({
        text: texto,
        icon: 'warning',
        showConfirmButton: true,
        showCancelButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonText: 'Ok, vou verificar...',
    });
}

$(document).on("click", ".btn-pagamento", function () {
    statusInternet();
    if (internet == 1 && load == 1) {
        clearTimeout(contagemSessao);
        $('.resumoMetodo').html($(this).attr('data-nome'));
        $('#divMetodo').addClass('d-none');
        $('#divPagamento').removeClass('d-none');
        var metodo = $(this).attr('data-id');
        var cpf = $('#cpf').val();
        var cel = $('#cel').val();
        fetch(url_api + '/venda/' + serial, {
            method: "POST",
            headers: { "Content-type": "application/json;charset=UTF-8", 'X-API-Key': token },
            body: JSON.stringify({ peso: pesoAtual, valor: valorAtual, doc: cpf, cel: cel, metodo: metodo })
        }).then(response => {
            response.json().then(function (data) {
                $('#codigoPagamento').html(
                    '<div class="w-100"><img src="data:image/jpeg;base64,' + data[0].encodedImage +
                    '" class="mx-auto" /></div>' +
                    '<div id="progressBar" class="mt-4 w-50">' +
                    '<div class="bar"></div>' +
                    '<span style="font-size:15px" class="text-muted">Aguardando pagamento...</span>' +
                    '</div>'
                );
                $('.codigoVenda').html(data[1].codigo);
                $('#infoPagamento').removeClass('d-none');
                venda = data[1].id;
                setTimer();
            });
        }).catch(err => console.log(err));
    }
});

function setTimer() {
    timerConsultaPix = setInterval(consultaPix, 30000);
    progress(500, 500, $('#progressBar'));
}

function progress(timeleft, timetotal, element) {
    var progressBarWidth = timeleft * element.width() / timetotal;
    element.find('div').animate({ width: progressBarWidth }, 1000);
    if (timeleft > 0) {
        timerProgresso = setTimeout(function () {
            progress(timeleft - 1.6, timetotal, element);
        }, 1000);
    } else {
        cancelarVenda();
    }
}

$(document).on("click", "#cancelarVenda", function () {
    Swal.fire({
        icon: 'warning',
        text: 'Tem certeza que deseja cancelar o pedido?',
        confirmButtonText: 'Tenho certeza!',
        showCancelButton: false,
        showCloseButton: true,
        allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
            cancelarVenda();
        }
    });
});


function cancelarVenda() {
    statusInternet();
    if (internet == 1) {
        fetch(url_api + '/venda/' + venda + '/cancelar', {
            method: "POST",
            headers: { "Content-type": "application/json;charset=UTF-8", 'X-API-Key': token }
        }).then(response => {
            response.json().then(function (data) {
                if (data.success == true) {
                    Swal.fire({
                        icon: 'warning',
                        text: 'Cancelando pedido. Aguarde...',
                        showConfirmButton: false,
                        showCancelButton: false,
                        showCloseButton: false,
                        allowOutsideClick: false,
                    });
                    setTimeout(function () { location.reload() }, 5000);
                }
            });
        }).catch(err => console.log(err));
    }
}

function consultaPix() {
    statusInternet();
    if (internet == 1) {
        fetch(url_api + '/venda/' + venda + '/consulta', {
            method: "POST",
            headers: { "Content-type": "application/json;charset=UTF-8", 'X-API-Key': token }
        }).then(response => {
            response.json().then(function (data) {
                if (data.success == true) {
                    clearInterval(timerProgresso);
                    clearInterval(timerConsultaPix);
                    $('#divPagamento').addClass('d-none');
                    $('#divCarga').removeClass('d-none');
                    // $('#pesoCarga').html(pesoAtual);
                    postWebViewMessage("peso:" + pesoAtual);
                }
            });
        }).catch(err => console.log(err));
    }
}


function postWebViewMessage(message) {
    window.chrome.webview.postMessage(message);
}

function retornoArduino(retorno) {
    var comando = retorno.split(":");
    if (comando[0] == "c" && comando[1] == "0") {
        Swal.fire({
            icon: "success",
            title: "Carga finalizada",
            text: "A Grão Fácil agradece sua compra!",
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            timer: 9000,
            timerProgressBar: true,
            willClose: () => {
                location.reload();
            }
        });
    }
    if (comando[0] == "m") {
        statusInternet();
        if (internet == 1) {
            fetch(url_api + '/equipamentoMedida/' + serial, {
                method: "POST",
                headers: { "Content-type": "application/json;charset=UTF-8", 'X-API-Key': token },
                body: JSON.stringify({ medida: comando[1]})
            }).catch(err => console.log(err));
        }
    }

}

$(document).on("click", "#rebootPC", function () {
    postWebViewMessage("rebootPC:1");
});


function solicitarMedidaSilo() {
    postWebViewMessage("medida:1");
}

solicitarMedidaSilo();

function removerSerial() {
    localStorage.removeItem('serial');
}

// removerSerial();