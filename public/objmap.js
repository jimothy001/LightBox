	var i = 0;
		var art = {};
		art.records = [];
		var curr = false;
		var host = window.location.host;
		var images2 = [];
		var sort = window.location.search.substr(1);
		var grid = true;
		
		var map = document.getElementById('map');
		var ctx = map.getContext('2d');
		var h;
		var itemX = 0;
	
	

		map.height = 1080;
		map.width = 1920;
		
		getMoreArt(0);
		
		$("#preview").css("opacity", 0);

		
		$(document).on("click", function(e) {
			console.log(e);
			if($(e.target).hasClass("button")) {
				var id = curr.objectid;
				socket.emit('add-item', {
					objectid: id
				});
				closePreview();
				
			} else if($(e.target).attr("id") == "map") {
				$.each(art.records, function(i, val) {
					if(e.offsetX > val.x1 && e.offsetX < val.x1+w) {
						if(e.offsetY > val.y1 && e.offsetY < val.y1+h) {
							console.log(val);
							/*socket.emit('add-item', {
								objectid: val.objectid
							});*/
							dbObjs.push({objectid: val.objectid});
							grabArt(val.objectid);
						}
					}
				
				});
			
			/*
					var x = Math.floor((e.offsetX) / w);

					var y = Math.floor((e.offsetY) / h);
					curr = art.records[y*itemX+x];
				

					$(".metadata, .metadata_back").show();


					$(".metadata, .metadata_back").on("click", function(e) {
						$(".metadata, .metadata_back").hide();
					});

					//$("#preview .img-preview").attr("src", "./art/" + curr.objectid + ".jpg");
					var img_src= "./art/" + curr.objectid + ".jpg";
					var max_w = $(".metadata .p1 .phldr").width();
					var max_h = $(".metadata .p1 .phldr").height();
					$(".img-preview").css({'background': 'url("'+img_src+'") no-repeat center center fixed','width':max_w,'height':max_h});

//img.height * (imgwidth/img.width))

console.log(max_w+' x '+max_h);
					//var prev_w = e.width;
					//var prev_h = e.height;

					//console.log(prev_w+' x '+prev_h);
					//$("#preview .img-preview").css({'width':prev_w,'height':prev_h,'max-width':'100%','max-height':'100%'});


					var title='',people='',birthplace='',name='',personid='',role='',displayorder='',culture='',displaydate='',deathplace='',displayname='',dated='';
					var division='',signed='',century='',classification='',description='';
					var department='',objectnumber='',contact='',exhibitioncount='',creditline='',copyright='';
					var url='',primaryimageurl='',totalpageviews='',totaluniquepageviews='',lastupdate='',dateoffirstpageview='',dateoflastpageview='',images='',baseimageurl='',primarydisplay='',copyright='',renditionnumber='';
					var id='',verificationlevel='',imagepermissionlevel='',accesslevel='',mediacount='',groupcount='',markscount='',relatedcount='',imagecount='',peoplecount='',titlescount='',datebegin='',dateend='',contextualtextcount='';


					///p2
					if(curr.title){title = 'title: "' + curr.title + '",</br>';};
					if(curr.birthplace){name = 'birthplace: "' + curr.birthplace + '",</br>';};
					if(curr.name){name = 'name: "' + curr.name + '",</br>';};
					if(curr.personid){personid = 'personid: "' + curr.personid + '",</br>';};
					if(curr.role){role = 'role: "' + curr.role + '",</br>';};
					if(curr.displayorder){displayorder = 'displayorder: "' + curr.displayorder + '",</br>';};
					if(curr.culture){culture = 'culture: "' + curr.culture + '",</br>';}else{culture='';};
					if(curr.displaydate){displaydate = 'displaydate: "' + curr.displaydate + '",</br>';};
					if(curr.deathplace){deathplace = 'deathplace: "' + curr.deathplace + '",</br>';};
					if(curr.displayname){displayname = 'deathplace: "' + curr.displayname + '",</br>';};
					if(curr.dated){dated = 'dated: "' + curr.dated;};

					///p3
					if(curr.division){division = 'division: "' + curr.division + '",</br>';};
					if(curr.signed){signed = 'signed: "' + curr.signed + '",</br>';};
					if(curr.century){century = 'century: "' + curr.century + '",</br>';};
					if(curr.classification){classification = 'classification: "' + curr.classification + '",</br>';};
					if(curr.description){description = 'description: "' + curr.description;};

					///p4
					if(curr.department){department = 'department: "' + curr.department + '",</br>';};
					if(curr.objectnumber){division = 'objectnumber: "' + curr.objectnumber + '",</br>';};
					if(curr.contact){contact = 'contact: "' + curr.contact + '",</br>';};
					if(curr.exhibitioncount){exhibitioncount = 'exhibitioncount: "' + curr.exhibitioncount + '",</br>';};
					if(curr.creditline){creditline = 'creditline: "' + curr.creditline + '",</br>';};
					if(curr.copyright){copyright = 'copyright: "' + curr.copyright + '",</br>';};

					///p7
					if(curr.url){url = 'url: "' + curr.url + '",</br>';};
					if(curr.primaryimageurl){primaryimageurl = 'primaryimageurl: "' + curr.primaryimageurl + '",</br>';};
					if(curr.totalpageviews){totalpageviews = 'totalpageviews: "' + curr.totalpageviews + '",</br>';};
					if(curr.totaluniquepageviews){totaluniquepageviews = 'totaluniquepageviews: "' + curr.totaluniquepageviews + '",</br>';};
					if(curr.lastupdate){lastupdate = 'lastupdate: "' + curr.lastupdate + '",</br>';};
					if(curr.dateoffirstpageview){dateoffirstpageview = 'dateoffirstpageview: "' + curr.dateoffirstpageview + '",</br>';};
					if(curr.dateoflastpageview){dateoflastpageview = 'dateoflastpageview: "' + curr.dateoflastpageview + '",</br>';};
						if(curr.baseimageurl){baseimageurl = 'baseimageurl: "' + curr.baseimageurl + '",</br>';};
						if(curr.primarydisplay){primarydisplay = 'primarydisplay: "' + curr.primarydisplay + '",</br>';};
						if(curr.copyright){copyright = 'copyright: "' + curr.copyright + '",</br>';};
						if(curr.renditionnumber){renditionnumber = 'renditionnumber: "' + curr.renditionnumber + '",</br>';};
		

					///p8
					if(curr.id){id = 'id: "' + curr.id + '",</br>';};
					if(curr.verificationlevel){verificationlevel = 'verificationlevel: "' + curr.verificationlevel + '",</br>';};
					if(curr.imagepermissionlevel){imagepermissionlevel = 'imagepermissionlevel: "' + curr.imagepermissionlevel + '",</br>';};
					if(curr.accesslevel){accesslevel = 'accesslevel: "' + curr.accesslevel + '",</br>';};
					if(curr.mediacount){mediacount = 'mediacount: "' + curr.mediacount + '",</br>';};
					if(curr.groupcount){groupcount = 'groupcount: "' + curr.groupcount + '",</br>';};
					if(curr.markscount){markscount = 'markscount: "' + curr.markscount + '",</br>';};
					if(curr.relatedcount){relatedcount = 'relatedcount: "' + curr.relatedcount + '",</br>';};
					if(curr.imagecount){imagecount = 'imagecount: "' + curr.imagecount + '",</br>';};
					if(curr.peoplecount){peoplecount = 'peoplecount: "' + curr.peoplecount + '",</br>';};
					if(curr.titlescount){titlescount = 'titlescount: "' + curr.titlescount + '",</br>';};
					if(curr.datebegin){datebegin = 'datebegin: "' + curr.datebegin + '",</br>';};
					if(curr.dateend){dateend = 'dateend: "' + curr.dateend + '",</br>';};
					if(curr.contextualtextcount){contextualtextcount = 'contextualtextcount: "' + curr.contextualtextcount + '",</br>';};



					//p2: title,people,dated
					$(".metadata .p2 .phldr").html(
							title +
							'people:</br>[</br>'+
								'<div class="tabspace">' +
								birthplace +
								name +
								personid +
								role +
								displayorder +
								culture +
								displaydate +
								deathplace +
								displayname +
								'</div>' +
							'],</br>' +
							dated
						);

					//p3: division,signed,century,classification
					$(".metadata .p3 .phldr").html(
							division +
							signed +
							century +
							classification +
							description
						);

					//p4: department,objectnumber,contact,exhibitioncount,creditline,copyright
					$(".metadata .p4 .phldr").html(
							department +
							objectnumber +
							contact +
							exhibitioncount +
							creditline +
							copyright 
						);


					//p6: colorcount,worktypes,dimensions,medium,colors
					$(".metadata .p6 .phldr").html(
							'url: "' + curr.title + '",</br>' +
							'primaryimageurl: "' + curr.primaryimageurl + '",</br>' +
							'totalpageviews: "' + curr.totalpageviews + '",</br>' +
							'totaluniquepageviews: "' + curr.totaluniquepageviews + '",</br>' +
							'lastupdate: "' + curr.lastupdate + '",</br>' +
							'dateoffirstpageview: "' + curr.dateoffirstpageview + '",</br>' +
							'dateoflastpageview: "' + curr.dateoflastpageview + '",</br>' +
							'images:</br>[</br>'+
								'<div class="tabspace">' + 
								'['+
									'<div class="tabspace2">' +
									'baseimageurl: "' + curr.baseimageurl + '",</br>' +
									'primarydisplay: "' + curr.primarydisplay + '",</br>' +
									'copyright: "' + curr.copyright + '",</br>' +
									'renditionnumber: "' + curr.renditionnumber + '",</br>' +
									'</div>' +
								']'+
								'</div>' +
							'],'
						);

					//p7: url,primaryimageurl,totalpageviews,totaluniquepageviews,lastupdate,dateoffirstpageview,dateoflastpageview,images
					$(".metadata .p7 .phldr").html(
							url +
							primaryimageurl +
							totalpageviews +
							totaluniquepageviews +
							lastupdate +
							dateoffirstpageview +
							dateoflastpageview +
							'images:</br>[</br>'+
								'<div class="tabspace">' + 
								'{</br>'+
									'<div class="tabspace">' +
									baseimageurl +
									primarydisplay +
									copyright +
									renditionnumber +
									'</div>' +
								'}</br>'+
								'</div>' +
							'],'
						);

					//p8: id,verificationlevel,imagepermissionlevel,accesslevel,mediacount,groupcount,markscount,relatedcount,imagecount,peoplecount,titlescount,datebegin,dateend,contextualtextcount
					$(".metadata .p8 .phldr").html(
							id +
							verificationlevel +
							imagepermissionlevel +
							accesslevel +
							mediacount +
							groupcount +
							markscount +
							relatedcount +
							imagecount +
							peoplecount +
							titlescount +
							datebegin +
							dateend +
							contextualtextcount
						);






					$("#preview").addClass("active");
					$("#sort").html(sort+": "+curr[sort]); 

					$(".img-preview").on("mouseover", function() {
						console.log('hovered');
					});

					$("#preview").animate({opacity: 1}, 500, function() {
				
					});*/
			} else {					
					closePreview();
					$(".metadata, .metadata_back").hide();

			}
		});
		
	
		socket.on('send-items', function(data) {
			console.log(data);
		});
		
		function closePreview() {
			$("#preview").animate({opacity: 0}, 500, function() {
				$("#preview").removeClass("active");
				$("#preview .img-preview").attr("src", "");
				//$("#preview").empty();
				$("#map").css("opacity", 1);
				curr = false;
			});
		}

		function customSort(a,b) {
			if ( a[sort] < b[sort] )
					return -1;
			if ( a[sort] > b[sort] )
					return 1;
			return 0;
		
		}
		
		//1023 objects have placeterms
		//982 w/previous exhibitions
		
		var placecount = 0;
		var places = [];
		function getMoreArt(count) {
			$.get("http://api.harvardartmuseums.org/object?gallery=any&apikey=f5473230-3f68-11e4-89b4-73adcea7266b&size=100&from="+count, function(data) {
				$.each(data.records, function(j, record) {
					/*if(record.images && record.images.length > 1) {
						placecount++;
						console.log(record.images.length);
					}*/
					if(record.primaryimageurl) art.records.push(record);

				});
				var next = count+100;
				if(data.info.pages > data.info.page) window.setTimeout(getMoreArt(next), 500);
				else {
					//console.log("w/surrogates: "+placecount);
					sort = "medium";
					art.records.sort(customSort);
					populateMap();
				}
			});	
		}
		var w = 37.64;
		function populateMap() {
			h = 32.727;
			
			itemX = 51;
			/*for(i=0; i < art.records.length; i++) {
				var x = (i % itemX)*w;
				var y = Math.floor(i/itemX)*h;
				addImage(i, x, y);	
			}*/
			var index = 0;
			for(var j=0; j < 33; j++) {
				for(var i=0; i < 52; i++) {
					var x = i*w;
					var y = j*h;
					var ind = index;
					addImage(ind, x, y);	
					index++;
			
				}
			}
			/*
			$("#highlight").width(h);
			$("#highlight").height(h);
			$("#highlight").css("z-index", 1000);
			*/
						
		
		}

		$(document).keydown(function(e) {
			var newSort;
			if(e.keyCode == 49) newSort = "medium";
			else if(e.keyCode == 50) newSort = "datebegin";
			else if(e.keyCode == 51) newSort = "division";
			else if(e.keyCode == 52) newSort = "exhibitioncount";
			
			if(newSort != sort) {
				sort = newSort;
				art.records.sort(customSort);
				populateMap();
			}
		});

	function addImage(order, x, y) {
		var base_image = new Image();
		base_image.src = "./art/" + art.records[order].objectid + ".jpg";
		base_image.onload = function(){
			art.records[order].x1 = x;
			art.records[order].y1 = y;
						
			var sizeh = base_image.height;
			var sizew = (base_image.height/h)*w;
			if(sizew > base_image.width) {
				sizew = base_image.width;
				sizeh = (base_image.width/w)*h;
			} 
			
			if(base_image.height > base_image.width) size = base_image.width;
			ctx.drawImage(base_image, 0, 0, sizew, sizeh, x, y, w, h);		
			
			
		}				
	}
