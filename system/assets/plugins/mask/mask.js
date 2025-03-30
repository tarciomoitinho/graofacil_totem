function changeMaskCpfCnpj(a,n){
	var t='input[name="'+$(n).data("target")+'"]',
	e=$(n).val();
	aplicaMascaraCpfCnpj(t,e)
}
function aplicaMascaraCpfCnpj(a,n){
	$(a).length&&("cnpj"==n?($(a).removeClass("input-mask-cpf"),
	$(a).addClass("input-mask-cnpj"),bindMasks(a)):($(a).addClass("input-mask-cpf"),
	$(a).removeClass("input-mask-cnpj"),bindMasks(a)))
}
function bindMasks(a){
	var n=function(a){
		var n=a.replace(/\D/g,"");
		return n.startsWith("08")?10===n.length?"0000-00-00009":"0000-000-0000":11===n.length?"(00) 00000-0000":"(00) 0000-00009"},
		t={onKeyPress:function(a,t,e,_){e.mask(n.apply({},arguments),_)}};
		$(a).find(".input-mask-phone").mask(n,t);
		var e=function(a){var n=a.replace(/\D/g,"");
		return 14===n.length?"00.000.000/0000-00":11===n.length?"000.000.000-00999":"00000000000000"},
		_={onKeyPress:function(a,n,t,_){t.mask(e.apply({},arguments),_)},
		selectOnFocus:!0};
		$(a).find(".input-mask-cpfcnpj").mask(e,_),
		$(a).find(".input-mask-cpf").mask("000.000.000-00",{clearIfNotMatch:!0}),
		$(a).find(".input-mask-cnpj").mask("00.000.000/0000-00",{clearIfNotMatch:!0}),
		$(a).find(".input-mask-tofixed2").mask("#0.00",{reverse:!0}),

		$(a).find(".input-mask-value").mask("#0,00",{reverse:!0,maxlength:!1}),
		$(a).find(".desconto-padrao").mask("TZZ,00",{translation:{T:{pattern:/[+-]/,fallback:"+",optional:!0},Z:{pattern:/[0-9]/,optional:!0}}}),
		$(a).find(".numero-cartao-credito").mask("0000 0000 0000 0000",{clearIfNotMatch:!0}),
		$(a).find(".cvv-cartao").mask("0000"),
		$(a).find(".validade-cartao").mask("00/00",{clearIfNotMatch:!0}),
		$(a).find(".input-mask-convenio-sicoob").mask("00000-0",{clearIfNotMatch:!1,placeholder:"_____-_"}),
		$(a).find(".input-mask-cedente-cef").mask("000000",{clearIfNotMatch:!1,placeholder:"______"}),
		$(a).find(".input-mask-digito").mask("0",{clearIfNotMatch:!0,placeholder:"_"}),
		$(a).find(".input-mask-variacao-carteira").mask("000",{clearIfNotMatch:!1,placeholder:"___",maxlength:!0});
		var s=function(a){return a=a.split(":"),parseInt(a[0])>19?"HZ:M0":"H0:M0"};spOptions={clearIfNotMatch:!0,placeholder:"__:__",onKeyPress:function(a,n,t,e){t.mask(s.apply({},arguments),e)},translation:{H:{pattern:/[0-2]/,optional:!1},Z:{pattern:/[0-3]/,optional:!1},M:{pattern:/[0-5]/,optional:!1}}},
		$(a).find(".input-mask-hora").mask(s,spOptions),
}
$(function(){bindMasks($(document))});