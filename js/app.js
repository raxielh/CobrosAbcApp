var db = openDatabase('mydb', '1.0', 'my first database', 2 * 1024 * 1024);
var url='http://127.0.0.1:8000/api/';


$(function() {

	$('#entrar').click(function(event) {
		var key=$('#key').val();
		var uri=url+'key/'+key;
		$.getJSON(uri, function(json, textStatus) {
			if(json.length==0){
				alert('Pin incorrecto');
			}else{
				$.each( json, function( key, value ) {
					location.href ='user.html?cobro='+value.cobro_id+'&key='+value.key+'';
				});
				
			}
		});
	});

});

function sync(){

	if(navigator.onLine){

		$.ajax({

		    url: url+'test'

		}).done( function() {

			var r = confirm("Estas seguro de sincronizar? se descargaran los prestamos que se encuentran en la nube!");
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
		            var keys=results.rows.item(i).key;
		            	var uri=url+'prestamos/'+cobro;
						$.getJSON(uri, function(json, textStatus) {
							
							var x=0;
							$.each( json, function( key, val ) {

							   	db.transaction(function (tx) {
								  tx.executeSql('INSERT INTO prestamos (prestamo,nombre,identificacion,cuota,key) VALUES ("'+val.ide+'","'+val.nombre+'","'+val.identificacion+'","'+val.cuota+'","'+keys+'")');
								  x=x+1;
									if(json.length==x){
								   		console.log(json.length+' '+x);
								   		location.href ="app.html";
								   	}
								});
							   	


							});
						});
		          }
		        });
		      });
		}

		}).fail( function() {

		    alert( 'Error conexion intenete mas tarde!!' );

		});	


	}else{
		alert('Te encuentras fuera de linea');
	}
}


function refresh(){
	if(navigator.onLine){
		var r = confirm("Estas seguro de Refrescar los prestamos?");
		if (r == true) {
			location.href ="app.html";
		}
	}else{
		alert('Te encuentras fuera de linea');
	}
}

function mostrar_prestamos(){
	var d = '<tr>'+
'<th>Nombre</th>'+
'<th>Identificacion</th>'+
'<th>Cuota</th>'+
'<th>Accion</th>'+
'</tr>';
		var user=null;
      db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM cobro', [], function (tx, results) {
          var len = results.rows.length, i;
          for (i = 0; i < len; i++) {
          	user=results.rows.item(i).user;
          }

        console.log(user);
                tx.executeSql('SELECT * FROM prestamos', [], function (tx, results) {
          var len = results.rows.length, i;
          for (i = 0; i < len; i++) {
          	 d+= '<tr id="'+results.rows.item(i).prestamo+'">'+
					 '<td>'+results.rows.item(i).nombre+'</td>'+
					 '<td>'+results.rows.item(i).identificacion+'</td>'+
					 '<td>'+results.rows.item(i).cuota+'</td>'+
					 '<td style="text-align: center;background: #512da8;color: #fff;font-weight: bold;" id="btn'+results.rows.item(i).prestamo+'" onclick="pagar('+results.rows.item(i).cuota+','+results.rows.item(i).prestamo+','+results.rows.item(i).key+','+user+')" >Pagar</td>'+
					 '</tr>';
          }
           $("#tabla").append(d);
        });

        });

      });
}

function pagar(cuota,prestamo,key,user){
	console.log(user);
	var x = prompt("Digite Monto a pagar", cuota);
	var r = confirm("Estas seguro de pagar?");
	if (r == true) {
	    var num = parseInt(x);
		db.transaction(function (tx) {
			tx.executeSql('INSERT INTO pago_prestamo (prestamo,cuota,key,user) VALUES ("'+prestamo+'","'+num+'","'+key+'","'+user+'")');
			$('#'+prestamo).css({"background-color":"green","color":"#fff"});
			$('#btn'+prestamo).hide();
		});
	}
}

function upload(){
	if(navigator.onLine){

		$.ajax({

		    url: url+'test'

		}).done( function() {		


				var r = confirm("Estas seguro de subir los pagos de prestamos?");
				if (r == true) {
			      db.transaction(function (tx) {
			        tx.executeSql('SELECT * FROM pago_prestamo', [], function (tx, results) {
			          var len = results.rows.length, i;
			          if(len==0){
			          	alert('No tienes pagos que subir');
			          }else{
							for (i = 0; i < len; i++) {
					          	var uri=url+'prestamos/'+results.rows.item(i).prestamo+'/'+results.rows.item(i).cuota+'/'+results.rows.item(i).key+'/'+results.rows.item(i).user;
								//console.log(uri);
								var y=0;
								$.getJSON(uri, function(json, textStatus) {
									console.log(uri);

								});
									
								if(i+1==len){
									db.transaction(function (tx) {tx.executeSql('DELETE FROM pago_prestamo', [], function (tx, results){});});
									alert('Pagos subidos con exito');
					      			location.href ="app.html";
								}
						    }
			          }

			        });

			      });	
				}
		}).fail( function() {

		    alert( 'Error conexion intenete mas tarde!!' );

		});





	} else {
		alert('Te encuentras fuera de linea');
	}

}
checkConnection();
setInterval(function(){ checkConnection(); }, 3000);
    
    function checkConnection() {
		$.ajax({

		    url: url+'test'

		}).done( function() {
			console.log('conectado');
			$('#con').css({"background-color":"green"});
		}).fail( function() {
			console.log('desconectado');
		    $('#con').css({"background-color":"red"});

		});
    }