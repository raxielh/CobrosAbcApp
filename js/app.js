var db = openDatabase('mydb', '1.0', 'my first database', 2 * 1024 * 1024);
var url='http://127.0.0.1:8000/api/';


$(function() {

	$('#entrar').click(function(event) {
		var key=$('#key').val();
		var uri=url+'key/'+key;
		//console.log(uri);
		$.getJSON(uri, function(json, textStatus) {
			if(json.length==0){
				alert('Pin incorrecto');
			}else{
				console.log(json[0].cobro_id);
				location.href ="app.html";
				db.transaction(function (tx) {
				  tx.executeSql('INSERT INTO cobro (cobro_id) VALUES ('+json[0].cobro_id+')');
				});
			}
		});
	});

});

function sync(){
	var r = confirm("Estas seguro de sincronizar? se descargaran los prestamos que se se encuentran en la nube!");
	if (r == true) {

	db.transaction(function (tx) {
        tx.executeSql('DELETE FROM prestamos', [], function (tx, results) {

        });
    });

      db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM cobro', [], function (tx, results) {
          var len = results.rows.length, i;
          for (i = 0; i < len; i++) {
            var cobro=(results.rows.item(i).cobro_id);
            	var uri=url+'prestamos/'+cobro;
				console.log(uri);
				$.getJSON(uri, function(json, textStatus) {
					$.each( json, function( key, val ) {
					   console.log(val);
					   	db.transaction(function (tx) {
						  tx.executeSql('INSERT INTO prestamos (prestamo,nombre,identificacion,cuota) VALUES ("'+val.ide+'","'+val.nombre+'","'+val.identificacion+'","'+val.cuota+'")');
						});
					});
				});
          }
        });
      });
	}

}


function refresh(){
	var r = confirm("Estas seguro de Refrescar los prestamos?");
	if (r == true) {
		location.href ="app.html";
	}
}

function mostrar_prestamos(){
	var d = '<tr>'+
'<th>Nombre</th>'+
'<th>Identificacion</th>'+
'<th>Cuota</th>'+
'<th>Accion</th>'+
'</tr>';
      db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM prestamos', [], function (tx, results) {
          var len = results.rows.length, i;
          for (i = 0; i < len; i++) {
          	 d+= '<tr id="'+results.rows.item(i).prestamo+'">'+
					 '<td>'+results.rows.item(i).nombre+'</td>'+
					 '<td>'+results.rows.item(i).identificacion+'</td>'+
					 '<td>'+results.rows.item(i).cuota+'</td>'+
					 '<td onclick="pagar('+results.rows.item(i).cuota+','+results.rows.item(i).prestamo+')" >Pagar</td>'+
					 '</tr>';
          }
           $("#tabla").append(d);
        });

      });	
}

function pagar(cuota,prestamo){
	var x = prompt("Digite Monto a pagar", cuota);
	var r = confirm("Estas seguro de pagar?");
	if (r == true) {
	    var num = parseInt(x);
		db.transaction(function (tx) {
			tx.executeSql('INSERT INTO pago_prestamo (prestamo,cuota) VALUES ("'+prestamo+'","'+num+'")');
			$('#'+prestamo).hide();
		});
	}
}

function upload(){
	var r = confirm("Estas seguro de subir los pagos de prestamos?");
	if (r == true) {
      db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM pago_prestamo', [], function (tx, results) {
          var len = results.rows.length, i;
          if(len==0){
          	alert('No tienes pagos que subir');
          }else{
          	  for (i = 0; i < len; i++) {
          	  	var uri=url+'key/';
				console.log(url);/*
				$.getJSON(uri, function(json, textStatus) {
					console.log(json);
				});
				console.log(results.rows.item(i));
				*/
	          	if(len==i+1){
      				db.transaction(function (tx) {tx.executeSql('DELETE FROM pago_prestamo', [], function (tx, results){});});
	          	}
	          }
          }

        });

      });	
	}
}