$(function(){
	
	$('input').attr("autocomplete","off");
	$('[data-toggle="tooltip"]').tooltip();

	/*$('.main-form').submit(function(){
		var form_name = $(this).attr('frm-name');
		load_display($('.alert-form-wrap'));
		$.ajax({url:'main-form/'+form_name,type:'post',data:$(this).serialize(),success:function(a){setTimeout(function(){$('.alert-form-wrap').html(a); },500);}});
		return false;
	});*/

	$(".main-form").submit(function(e) {
		var form_name = $(this).attr('frm-name');
		load_display($('.alert-form-wrap'));
		e.preventDefault();    
		var data = new FormData(this);
		$.ajax({
			url: 'main-form/'+form_name,
			type: 'POST',
			data: data,
			success: function (data) {setTimeout(function(){$('.alert-form-wrap').html(data);},500);},
			error: function(xhr, ajaxOptions, thrownError) {alert("There was an error. Try again please!");},
			cache: false,
			contentType: false,
			processData: false
		});
	});

	$(document).ready(function(){
	  $(document).ajaxError(function(){
	    alert("เกิดข้อผิดพลาด โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ");
	    CloseAlert();
	  });
	});


	$(".select-exam-button").click(function(){
		var data = $(this).attr("data");
		$('.modal-'+data).show();
		$('.dismiss-modal-btn').fadeIn();
		$('.bg-modal').fadeIn();
		return false;
	});

	$(".dismiss-modal-btn").click(function(){
		$('.dismiss-modal-btn').hide();
		$('.madal-item').fadeOut();
		$('.bg-modal').fadeOut();
	});

	$('.link-action').click(function(){
		var link_name = $(this).attr('link-name');
		var data = $(this).attr('data');
		$.post('main-form/'+link_name,{data:data},function(a){$('.alert-form-wrap').html(a);});
		return false;
	});

	$(".prompt-form").submit(function(e) {
		var text = $(this).attr('text');
		var person = prompt(text);
			if (person =='ยืนยัน') {
				var form_name = $(this).attr('frm-name');
				load_display($('.alert-form-wrap'));
				e.preventDefault();    
				var data = new FormData(this);
				$.ajax({
					url: 'main-form/'+form_name,
					type: 'POST',
					data: data,
					success: function (data) {setTimeout(function(){$('.alert-form-wrap').html(data);},500);},
					cache: false,
					contentType: false,
					processData: false
				});
			}else{
				return false;
			}
	});

	$('.search-form').submit(function(){
		$('.data-load-more-wrap').attr('data-no','0');
		var type = $(this).attr('data-type');
		var text = $('.search-text').val();
		var limit = $(this).attr('data-limit');
		$('.search-text-data').val(text);

		//if(text.length>3){
			$.post('load-data/search_'+type,{text:text,limit:limit},function(a){$('.show-search-data').html(a);});
		//}
		return false;
	});

	$('.load-more-btn').click(function(){
		$('.load-more-btn-wrap').hide();
		var target = $('.data-load-more-wrap');
		var limit = target.attr('data-limit');
		var type = target.attr('data-type');
		var no = target.attr('data-no');
		var new_no = parseInt(no)+parseInt(limit);
		var s = $('.search-text-data').val();

		$.post('load-data/'+type+'_more',{limit:limit,no:no,s:s},function(a){$('.load-more-btn-wrap').show(),$('.data-load-show').append(a),target.attr('data-no',new_no);});
		
		return false;
	});

	$('.exam-form').submit(function(){
		var form_name = $(this).attr('frm-name');
		load_display($('.alert-form-wrap'));
		$.ajax({url:'main-form/'+form_name,type:'post',data:$(this).serialize(),success:function(a){setTimeout(function(){$('.alert-form-wrap').html(a); },500);}});
		return false;
	});

	$('.load-data').click(function(){
		var load_name = $(this).attr('load-name');
		var data = $(this).attr('data');
		$.post('load-data/'+load_name,{data:data},function(a){$('.modal-body').html(a);});
		//return false;
	});

	$('.login-select-item').click(function(){
		var pic = $(this).attr("pic");
		$('#login-pic').attr("src",pic);
		$('.login-select-item').removeClass('login-selected');
		$(this).addClass('login-selected');
	});
	

});



function load_display(selector){
	var lang = $('#u_lang').val();
	if(lang=='th'){
		var text = 'โปรดรอสักครู่..';
	}else{
		var text = 'Please wait..';
	}
	$('.bg-alert-form').show();
	$('.alert-form-wrap').show();
	$('button').prop('disabled',true);
	selector.html('<div class="text-center" style="padding:25px 15px"><i style="color:#bbbbbb" class="fa fa-circle-notch fa-spin fa-5x"></i><h3>'+text+'</h3></div>');
}
function load_dismiss(selector){
    $('.bg-alert-form').hide();
	$('.alert-form-wrap').hide();
    $('button').prop('disabled',false);
    selector.html('');
}
function CloseAlert(){
	$('.alert-form-wrap').html('');
	$('.bg-alert-form').hide();
	$('button').prop('disabled',false);
	return false;
}
