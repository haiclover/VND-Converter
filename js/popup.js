'use strict'

window.addEventListener('DOMContentLoaded',function(){
	let userCurrencyInput = document.getElementsByName('userCurrencyInput')[0];
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function(){
		if(this.readyState == 4 && this.status === 200){
			let json = JSON.parse(this.responseText);
			json['data'].forEach((item) => {
				let parr = document.createElement('option');
				let node = document.createTextNode(item['name'] + "(" + item['code'] +")");
				parr.appendChild(node);
				parr.value = item['code'];
				userCurrencyInput.appendChild(parr);
			});
		}
	}
	xhttp.open('GET','/json/currency.json',true);
	xhttp.send();
});

let userNumberInput = document.getElementsByName('userNumberInput')[0];
userNumberInput.addEventListener('change',function(){
	
	let cash = userNumberInput.value;
	let currency = document.getElementsByName('userCurrencyInput')[0].value;
	function getTodayDate(){
		let dateObj = new Date();
		return dateObj.getFullYear() + ('0' + (dateObj.getMonth()+1)).slice(-2) + ('0' + dateObj.getDate()).slice(-2);
	}
	function replaceComma(number){
		number = number.replace(/\,/g,'');
		return number;
	}
	function formatVND(number){
		number = number.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});
		return number;
	}
	function ajaxBidv($link){
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(){
			if(this.readyState == 4 && this.status === 200){
				let json = JSON.parse(this.responseText);
				for(let key in json['data']){
					if(json['data'][key]['currency'] == currency){
						document.querySelectorAll('#buy')[0].childNodes[7].innerHTML = formatVND(+cash * +replaceComma(json['data'][key]['muaTm']));
						document.querySelectorAll('#transfer')[0].childNodes[7].innerHTML = formatVND(+cash * +replaceComma(json['data'][key]['muaCk']));
						document.querySelectorAll('#sell')[0].childNodes[7].innerHTML = formatVND(+cash * +replaceComma(json['data'][key]['ban']));
					}
				}
			}
		}
		xhttp.open('GET',$link,true);
		xhttp.send();
	}
	function ajaxTpbank($link){
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(){
			if(this.readyState == 4 && this.status === 200){
				let json = JSON.parse(this.responseText);
				for(let key in json['rate_currency']){
					if(json['rate_currency'][key]['kieu'] == currency){
						document.querySelectorAll('#buy')[0].childNodes[3].innerHTML = formatVND(+cash * +replaceComma(json['rate_currency'][key]['mua']));
						document.querySelectorAll('#transfer')[0].childNodes[3].innerHTML = formatVND(+cash * +replaceComma(json['rate_currency'][key]['chuyen']));
						document.querySelectorAll('#sell')[0].childNodes[3].innerHTML = formatVND(+cash * +replaceComma(json['rate_currency'][key]['ban']));
					}
				}
			}
		}
		let auth = 'Basic d3BzdHBiMjAxODpXUFN0cGIyMDE4MTIxMg==';
		xhttp.open('GET',$link,true);
		xhttp.setRequestHeader('Authorization', auth);
		xhttp.send();
	}
	function ajaxVCB($link){
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(){
			if(this.readyState == 4 && this.status === 200){
				let xml = this.responseXML;
				let lenChild = xml.getElementsByTagName('ExrateList')[0].children.length;
				xml =  xml.getElementsByTagName('ExrateList')[0];
				for(let i = 0; i < lenChild; i++){
					if(i === 0 || i ===  lenChild - 1){
						continue;
					}
					if(xml.children[i].attributes['CurrencyCode'].value == currency){
						document.querySelectorAll('#buy')[0].childNodes[5].innerHTML = formatVND(+cash * +replaceComma(xml.children[i].attributes['Buy'].value));
						document.querySelectorAll('#transfer')[0].childNodes[5].innerHTML = formatVND(+cash * +replaceComma(xml.children[i].attributes['Transfer'].value));
						document.querySelectorAll('#sell')[0].childNodes[5].innerHTML = formatVND(+cash * +replaceComma(xml.children[i].attributes['Sell'].value));
					}
				}
			}
		}
		xhttp.open('GET',$link,true);
		xhttp.send();
	}
	
	ajaxBidv("https://www.bidv.com.vn/ServicesBIDV/ExchangeDetailServlet");
	ajaxTpbank("https://tpb.vn/CMCWPCoreAPI/api/public-service/get-currency-rate?filename=" + getTodayDate());
	ajaxVCB("https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx");
});
