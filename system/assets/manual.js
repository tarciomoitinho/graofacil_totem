function salvar(){

    const texto  = 'abcdessfdsfsdf';
    const titulo = 'vendas';

    var blob = new Blob([texto],
    {type: 'text/plain: charset=utf-8'}
    );

   saveAs(blob, titulo + '.txt');

}

$(document).on("click", "#carregar", function () {
    var codigo = [];
    codigo.unshift($('#codigoManual').val());
    localStorage.setItem('codigoManual', JSON.stringify(codigo));

    console.log(JSON.parse(localStorage.getItem('codigoManual')));
});


























// kasadelicia
// gatasp