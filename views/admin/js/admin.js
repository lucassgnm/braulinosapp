$(document).ready(function () {
    toastr.options.positionClass = 'toast-top-center';

    $("#allChart").hide();
    carregaTabela();

    $.post("sessaoUsuario/").done(function (data) {
        dados = JSON.parse(data);

        if (dados['cpf'] != "") {
            $("#h4name").html('Bem-vindo (a) ' + dados['primeironome']);
        } else {
            toastr.warning(data);
        }
    });

    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: carregaDatasChart(),
            datasets: [{
                label: 'Numero de agendamentos',
                data: carregaQtsChart(),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(0, 15, 156, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(0, 15, 156, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });


    var down = false;

    $('#bell').click(function (e) {

        var color = $(this).text();
        if (down) {

            $('#box').css('height', '0px');
            $('#box').css('opacity', '0');
            down = false;
        } else {

            $('#box').css('height', 'auto');
            $('#box').css('opacity', '1');
            down = true;
        }
    });

    $("#mostraMenu").hide();

    $("#escondeMenu").click(function (e) {
        e.preventDefault();
        $(".sidebar").fadeOut(500);
        $("#escondeMenu").hide();
        $("#mostraMenu").show();
    });

    $("#mostraMenu").click(function (e) {
        e.preventDefault();
        $(".sidebar").fadeIn(500);
        $("#escondeMenu").show();
        $("#mostraMenu").hide();
    });

    $("#dashLogout").click(function (e) {
        e.preventDefault();
        $.post("dashLogout/").done(function (data) {
            if (data == "OK") {
                window.location = '../login/';
            } else {

            }
        });
    });

    $("#btnAdiciona").click(function (e) {
        e.preventDefault();
        var procedimento;
        var horario;
        var dataprocedimento = $("#dataInput").val();
        $("#selProcedimento option:selected").each(function () {
            procedimento = $(this).val();
        });

        $("#selHorario option:selected").each(function () {
            horario = $(this).text();
        });
        if (procedimento == "" || horario == "" || dataprocedimento == "") {
            toastr.warning("Todos os campos devem estar preenchidos!");
        } else {
            $.post("addAgendamento/", { procedimento: procedimento, horario: horario, dataprocedimento: dataprocedimento }).done(function (data) {
                dados = JSON.parse(data);
                if (dados["code"] == 1) {
                    toastr.success(dados["msg"]);
                    carregaTabela();
                } else {
                    toastr.error("Houve um erro na sua solicitação")
                }
            });
        }
    });


    $("#btnNew").click(function (e) {
        e.preventDefault();

        $(".modal-title").html("Adicionar agendamento");
        $("#btnSalvaEdit").hide();
        $("#btnAdiciona").show();

        populaProcedimento();
        populaHorario();
        calendarioHoje();


        $("#modaledit").modal("show");
    });

    $("#goToEstatisticas").click(function (e) {
        e.preventDefault();
        $("#allTable").hide();
        $("#allChart").show();
    });

    $("#btnFiltraSemana").click(function (e) {
        e.preventDefault();
        $.post("listaUltimaSemana/").done(function (data) {
            dados = JSON.parse(data);

            result = "";

            for (var i = 0; i < dados.length; i++) {
                result += "<tr>";
                result += "<td>" + dados[i].id + "</td>";
                result += "<td>" + primeiroNome(dados[i].nomecompleto) + "</td>";
                result += "<td>" + dados[i].nome + "</td>";
                result += "<td>" + dados[i].horario + "</td>";
                result += "<td>" + dateToBR(dados[i].data) + "</td>";
                result += '<td class="text-center"><button onclick=editarItem(' + dados[i].id + '); class="btn btn-info btn-xs"><span class="glyphicon glyphicon-edit"></span> Editar</button> <button onclick=excluirItemConfirm(' + dados[i].id + '); class="btn btn-danger btn-xs"><span class="glyphicon glyphicon-remove"></span> Cancelar</button></td>';
                result += "</tr>";
            }
            result += "<tr>";
            result += "<td></td>";
            result += "<td></td>";
            result += "<td></td>";
            result += "<td></td>";
            result += "<td></td>";
            result += "<td>" + dados.length + " resultados encontrados</td>";
            result += "</tr>";

            $("#linhas").html(result);
        });
    });

    $("#inputFiltra").keyup(function () {
        str = $("#inputFiltra").val()
        carregaTabelaFiltro(str);
    });

    /////////////////////////////////// chart

});

//FUNCOES --------------------------------------------
// MODAL EDITAR
function editarItem(id) {

    populaProcedimento();
    populaHorario();
    calendarioHoje();

    $(".modal-title").html("Editar agendamento");
    $("#btnSalvaEdit").show();
    $("#btnAdiciona").hide();
    $("#modaledit").modal("show");
    $("#btnSalvaEdit").attr("onclick", "updItem(" + id + ")");
}

function updItem(id) {
    var procedimento;
    var horario;
    var dataprocedimento = $("#dataInput").val();
    $("#selProcedimento option:selected").each(function () {
        procedimento = $(this).val();
    });

    $("#selHorario option:selected").each(function () {
        horario = $(this).text();
    });
    if (procedimento == "" || horario == "" || dataprocedimento == "") {
        toastr.warning("Todos os campos devem estar preenchidos!");
    } else {
        $.post("updAgendamento/" + id + "", { procedimento: procedimento, horario: horario, dataprocedimento: dataprocedimento }).done(function (data) {
            dados = JSON.parse(data);
            if (dados["code"] == 1) {
                toastr.success(dados["msg"]);
                carregaTabela();
            } else if (dados["code"] == 0) {
                toastr.warning(dados["msg"]);
            } else {
                toastr.error("Houve um erro na sua solicitação")
            }
        });
    }
}

// MODAL EXCLUIR
function excluirItemConfirm(id) {
    $(".modal-title").html("Cancelar agendamento");
    $(".modalconfirm").modal("show");
    $("#labelIdDelete").html(id);
    $("#btnOkCancelaAgendamento").attr("onclick", "excluirItem(" + id + ")");
}

function excluirItem(id) {
    $.post("delAgendamento/" + id + "").done(function (data) {
        dados = JSON.parse(data);
        if (dados["code"] == 1) {
            toastr.success(dados["msg"]);
            carregaTabela();
            $(".modalconfirm").modal("hide");
        } else if (dados["code"] == 0) {
            toastr.warning(dados["msg"]);
            $(".modalconfirm").modal("hide");
        } else {
            toastr.error("Houve um erro na sua solicitação")
        }
    });
}
// POPULA A TABELA
function carregaTabela() {
    $.post("listaAgendamentosCliente/",).done(function (data) {
        dados = JSON.parse(data);
        result = "";

        for (var i = 0; i < dados.length; i++) {
            result += "<tr>";
            result += "<td>" + dados[i].id + "</td>";
            result += "<td>" + primeiroNome(dados[i].nomecompleto) + "</td>";
            result += "<td>" + dados[i].nome + "</td>";
            result += "<td>" + dados[i].horario + "</td>";
            result += "<td>" + dateToBR(dados[i].data) + "</td>";
            result += '<td class="text-center"><button onclick=editarItem(' + dados[i].id + '); class="btn btn-info btn-xs"><span class="glyphicon glyphicon-edit"></span> Editar</button> <button onclick=excluirItemConfirm(' + dados[i].id + '); class="btn btn-danger btn-xs"><span class="glyphicon glyphicon-remove"></span> Cancelar</button></td>';
            result += "</tr>";
        }

        $("#linhas").html(result);
    });
}

// POPULA A TABELA
function carregaTabelaFiltro(filtro) {
    if (filtro == "") {
        carregaTabela();
    } else {
        $.post("listaAgendamentosFiltro/" + filtro + "").done(function (data) {
            dados = JSON.parse(data);
            result = "";
            for (var i = 0; i < dados.length; i++) {
                result += "<tr>";
                result += "<td>" + dados[i].id + "</td>";
                result += "<td>" + primeiroNome(dados[i].nomecompleto) + "</td>";
                result += "<td>" + dados[i].nome + "</td>";
                result += "<td>" + dados[i].horario + "</td>";
                result += "<td>" + dateToBR(dados[i].data) + "</td>";
                result += '<td class="text-center"><button onclick=editarItem(' + dados[i].id + '); class="btn btn-info btn-xs"><span class="glyphicon glyphicon-edit"></span> Editar</button> <button onclick=excluirItemConfirm(' + dados[i].id + '); class="btn btn-danger btn-xs"><span class="glyphicon glyphicon-remove"></span> Cancelar</button></td>';
                result += "</tr>";
            }

            $("#linhas").html(result);
        });
    }
}
// POPULANDO OS SELECTS
/** @description Popula o select dos procedimentos.*/
function populaProcedimento() {
    var selectProcedimento = $('#selProcedimento');
    selectProcedimento.find('option').remove();
    $.post("getProcedimento/").done(function (data) {
        dados = JSON.parse(data);
        $.each(dados, function (i, d) {
            $('<option>').val(d.id).text(d.nome).appendTo(selectProcedimento);
        });
    });
}
/** @description Popula o select dos horários.*/
function populaHorario() {
    var selectHorario = $('#selHorario');
    selectHorario.find('option').remove();
    $.post("getHorario/").done(function (data) {
        dados = JSON.parse(data);
        $.each(dados, function (i, d) {
            $('<option>').val(d.id).text(d.horario).appendTo(selectHorario);
        });
    });
}

/** @description Deixa disponivel no mínimo a data atual no input type="date"*/
function calendarioHoje() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    today = yyyy + '-' + mm + '-' + dd;
    document.getElementById("dataInput").setAttribute("min", today);
}

function dateToEN(date) {
    return date.split('/').reverse().join('-');
}

function dateToBR(date) {
    return date.split('-').reverse().join('/');
}

function primeiroNome(nomeCompleto) {
    return fullName = nomeCompleto.split(' '),
        firstName = fullName[0];
}

function carregaDatasChart() {
    var datas = [];
    $.post("listaUltimaSemanaGrafico/").done(function (data) {
        dados = JSON.parse(data);
        for (let i = 0; i < dados.length; i++) {
            datas.push(dateToBR(dados[i].data));
        }
    });
    return datas;
};

function carregaQtsChart() {
    var qtd = [];
    $.post("listaUltimaSemanaGrafico/").done(function (data) {
        dados = JSON.parse(data);
        
        for (let i = 0; i < dados.length; i++) {
            qtd.push(dados[i].qtd);
        }
        return qtd;
    });
    return qtd;
};
