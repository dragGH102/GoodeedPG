/* ######################
	@ Author: Manuel Gajo

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

(function( $ ) {
	
	// #############################
	// ##### UTILITY FUNCTIONS #####
	// #############################	
	
	var s4 = function(){ 
	  return Math.floor((1 + Math.random()) * 0x10000)
				 .toString(16)
				 .substring(1);
	}
	
	//\\ generare new Guid (using s4)
	var generateGuid = function(){
	   return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		      s4() + '-' + s4() + s4() + s4();
	}
	
	//\\ does nothing..
	var nullFunction = function(){
		// do nothing..
		console.log("null function..");
		return;
	}
	
	//\\ check whether a file exists o not (and call callback() if it does)
	function fileExists(fileName,storageRootEntry,callback) {
		
		// default values management
		if (typeof(storageRootEntry) === 'undefined'){return;}
		fileName = typeof(fileName) !== 'undefined' ? fileName : '';
		callback = typeof(callback) !== 'undefined' ? callback : nullFunction();
	
        storageRootEntry.getFile(fileName, {create : false}, function() {
			console.log("File "+fileName+" DOES exist");
			// ..do nothing
        }, function() {
			console.log("File "+fileName+" does NOT exist");
			callback(); // return true
        });
    }
	
	//\\ get video mimetype (and specify suitable codecs) according to file extension
	var getVideoMimetype = function(url_ext){
		var mime_type = "";
		
		switch(url_ext){ // according to file extension..
			case "webm":
				mime_type = "video/webm;codecs='vp8, vorbis'";
				break;
			case "ogg":
				mime_type = "video/ogg;codecs='theora, vorbis'";
				break;
			case "ogv":
				mime_type = "video/ogg";
				break;							
			case "mp4":
				mime_type = "video/mp4;codecs='avc1.42E01E, mp4a.40.2'";
				break;
			case "m4v":
				mime_type = "video/mp4";
				break;
			case "mov":
				mime_type = "video/mp4";
				break;							
			case "avi":
				mime_type = "video/mp4";
				break;							
			default:
				mime_type = "video/mp4";
		}
		
		return mime_type;
	};

	// #############################
	// #### UI & SYS FUNCTIONS #####
	// #############################
	
	var page_loading_start = function(){
	
		$.blockUI({
			message: $('#whole-page')
		});

		
		var opts = {
		  lines: 15, // The number of lines to draw
		  length: 27, // The length of each line
		  width: 11, // The line thickness
		  radius: 38, // The radius of the inner circle
		  corners: 0.6, // Corner roundness (0..1)
		  rotate: 48, // The rotation offset
		  direction: 1, // 1: clockwise, -1: counterclockwise
		  color: '#000', // #rgb or #rrggbb or array of colors
		  speed: 0.9, // Rounds per second
		  trail: 41, // Afterglow percentage
		  shadow: false, // Whether to render a shadow
		  hwaccel: false, // Whether to use hardware acceleration
		  className: 'spinner', // The CSS class to assign to the spinner
		  zIndex: 2e9, // The z-index (defaults to 2000000000)
		  top: '50%', // Top position relative to parent
		  left: '50%' // Left position relative to parent
		};
		
		var target = document.getElementById('whole-page');
		$.spinner = new Spinner(opts).spin(target);		

	};
	
	var page_loading_end = function(fun)
	{
		if(fun!==undefined && fun!==""){ fun(); }
		$.spinner.stop();
		$.unblockUI();
	};
	
	//\\ open or close contextual menu
	var openCloseMenu = function(open,menu){
		// default values management
		if (typeof(menu) === 'undefined'){return;}
		open = typeof(open) !== 'undefined' ? open : 1;
	
		if (open==0){ // open
			// block main+footer
			$("#main").block({message:null});
			$("#footer").block({message:null});
			
			// show menu
			menu.css({"width":"70%","height":"91.5%"});
			
			menu.attr("is_open","1");
		} else { // =="1", close menu
			// UNblock main+footer
			$("#main").unblock({message:null});
			$("#footer").unblock({message:null});
			
			// hide menu
			menu.css({"width":"0%","height":"0%"});
			
			menu.attr("is_open","0");
		}
	}
	
	//\\ load various [files] in different [parts] of the page according to [actor]
	var load_page = function(header, main, footer, fun, actor){
		// default values management
		if (typeof(header) === 'undefined' || typeof(main) === 'undefined' || typeof(actor) === 'undefined'){return;} // (!)=== VS (!)==  [http://stackoverflow.com/questions/894860/set-a-default-parameter-value-for-a-javascript-function]
		fun = typeof(fun) !== 'undefined' ? fun : nullFunction();
		
		if(footer!==undefined && footer!==""){
			$("#footer").show();
		} else {
			$("#footer").hide();
		}
		
		page_loading_start();
		
		//** header
		$.ajax({
			url: "pages/"+header,
			dataType:'html',
			success: function(data){
				$("#header").html(data);
				
				var menu = $("#menu-container");
				
				var menu_obj = undefined;
				if (actor==="association"){ // menu..
					menu_obj = $("#option-menu-association");
				} else { // donor
					menu_obj = $("#option-menu-donor");
				}
				
				// clean previous bounded events..
				menu_obj.off();
				
				// bind click event..
				menu_obj.click(function(){
					if (menu.attr("is_open")==="0"){ // open menu
						openCloseMenu(0,menu);
					}else{ // close menu
						openCloseMenu(1,menu);
					}
					
				});
			
				//** main
				$.ajax({
					url:"pages/"+main,
					dataType:'html',
					success: function(data){
						$("#main").html(data);
						
						if(footer!==undefined && footer!==""){
							//** footer
							$.ajax({
								url:"pages/"+footer,
								dataType:'html',
								success: function(data){
									$("#footer").html(data);
									
									// done loading all
									page_loading_end(fun);
								}
							});
						} else {
							page_loading_end(fun);
						}
					
						
					}
				});
			}
		});
		
	};
	

	// handle back button behavior
	var backButtonHandler = function(){
	
		// close menu first..		
		var menu = $("#menu-container");
		// close menu (if opened..)
		openCloseMenu(1,menu);
	
		switch($.last_loaded_view){
			case "welcome":
				navigator.app.exitApp(); // close app
				break;
			case "association_projects": 
				loadWelcomePage();
				break;
			case "association_project_actions":
				loadAssociationProjectsPage();
				break;
			case "association_project_text":
				loadAssociationProjectActionsPage();
				break;
			case "association_project_picture":
				// restore CSS..
				$("#header").css("height","9%");
				$("#main").css("height","91.5%");
				$("#option-menu-association").css("margin-top",""); 
				$(".c-icon").css("margin","40% 0 40% 0");
			
				loadAssociationProjectActionsPage();
				break;
			case "association_project_audio":
				loadAssociationProjectActionsPage();
				break;
			case "association_project_video":
				// restore CSS..
				$("#header").css("height","9%");
				$("#main").css("height","91.5%");
				$("#option-menu-association").css("margin-top",""); 
				$(".c-icon").css("margin","40% 0 40% 0");
			
				loadAssociationProjectActionsPage();
				break;
			case "association_project":
				loadAssociationProjectsPage();
				break;
			case "donor_projects": 
				loadWelcomePage();
				break;
			case "donor_starred_projects":
				loadWelcomePage();
				break;
			case "donor_project":
				loadDonorProjectsPage();
				break;				
			default:
				console.log("back button [last_loaded_view: " + $.last_loaded_view + " ]");
		}
	}
	
	//\\ restore css when loading portrait views after landscape view
	var restoreCss = function(){
		$("#header").css("height","9%");
		$("#main").css("height","91.5%");
		$("#option-menu-association").css("margin-top",""); 
		$(".c-icon").css("margin","40% 0 40% 0");
	}
	
	$.execFunctionsOnclick = function(page){
		restoreCss();
	
		switch(page){
			case "welcome":
				loadWelcomePage();
				break;
			case "association_projects":
				loadAssociationProjectsPage();
				break;
			case "association_project_actions":
				loadAssociationProjectActionsPage();
				break;
			case "association_project_text":
				loadAssociationProjectTextPage();
				break;
			case "association_project_picture":
				loadAssociationProjectPicturePage();
				break;
			case "association_project_audio":
				loadAssociationProjectAudioPage();
				break;
			case "association_project_video":
				loadAssociationProjectVideoPage();
				break;
			case "association_project":
				loadAssociationProjectPage();
				break;
			case "donor_projects": 
				loadDonorProjectsPage();
				break;
			case "starred_donor_projects": 
				loadStarredDonorProjectsPage();
				break;
			case "donor_project":
				loadDonorProjectPage();
				break;				
			default:
				console.log("last_loaded_view: " + $.last_loaded_view + " ]");
		}
	}
	
	var loadContextualMenu = function(actor){
		actor = typeof(actor) !== 'undefined' ? actor : '';
	
		// # association
		if (actor==="association"){
			$.ajax({
				url: "pages/menu_association.html",
				dataType:'html',
				success: function(data){
					$("#menu-container").html(data);
				}
			});			
		}
		
		// # donor
		if (actor==="donor"){
			$.ajax({
				url: "pages/menu_donor.html",
				dataType:'html',
				success: function(data){
					$("#menu-container").html(data);
				}
			});			
		}
		
	}
 
	//\\ app "main" function
	$.initApp = function(){
		document.addEventListener("deviceready", function(){
			// initialize global/util vars
			$.last_URI = "";
			$.last_GUID = "";
			$.last_title = "";
			$.last_post = "";
			$.last_loaded_view = "";
			
			$.project1_isstarred = false;
			$.project2_isstarred = false;
			$.project3_isstarred = false;
			
			$.texts_storage_file = "texts.txt";
			$.pictures_storage_file = "pictures.txt";
			$.videos_storage_file = "videos.txt";
			$.audios_storage_file = "audios.txt";
				
			// initialize storage for text & media
			createtxtStorage($.texts_storage_file);
			createtxtStorage($.pictures_storage_file);
			createtxtStorage($.videos_storage_file);
			createtxtStorage($.audios_storage_file);
			
			
			// load global events
			document.addEventListener("backbutton", backButtonHandler, false);
			
			// start app
			loadWelcomePage();
		},false);

	};
	
	
	// #############################
	// ###### MANAGE STORAGE #######
	// #############################
	
	//\\ create storage..
	var createtxtStorage = function(storage_file){

		 function fsCreateTxtStorageSuccess(fs){
			fileExists(storage_file,fs.root,function(){
				
				fs.root.getFile(storage_file, {create: true},
					function(fileEntry) {
						fileEntry.createWriter(function(fileWriter) {
						
						  fileWriter.onwriteend = function(e) {/**/};
						  fileWriter.onerror = function(e) {/**/};
						  
						   // Create a new Blob obj ("+" [initial content**]) and write it to file
						   // needed to make sure every picture/video/audio/text is printed when I use .split() function
						   var blob = new Blob(["+"], {type: 'text/plain'});
						   // write (APPEND) to file
						   fileWriter.seek(fileWriter.length);
						   fileWriter.write(blob);
						   
						},function(){ /*error callback*/});
					}, function(fileEntry) { /* callback: file creation error */}
				);
			});
		}
		
		window.webkitStorageInfo.requestQuota(window.PERSISTENT, 1024*1024, function(grantedBytes) {
		  window.requestFileSystem(window.PERSISTENT, grantedBytes, fsCreateTxtStorageSuccess, function(){});
		}, function(e) {
		  console.log('Error', e);
		});
	}

	// \\ print FS error
	function fsError(e){ // common for all requestQuota
		  var msg = '';

		  switch (e.code) {
			case FileError.QUOTA_EXCEEDED_ERR:
			  msg = 'QUOTA_EXCEEDED_ERR';
			  break;
			case FileError.NOT_FOUND_ERR:
			  msg = 'NOT_FOUND_ERR';
			  break;
			case FileError.SECURITY_ERR:
			  msg = 'SECURITY_ERR';
			  break;
			case FileError.INVALID_MODIFICATION_ERR:
			  msg = 'INVALID_MODIFICATION_ERR';
			  break;
			case FileError.INVALID_STATE_ERR:
			  msg = 'INVALID_STATE_ERR';
			  break;
			default:
			  msg = 'Unknown Error';
			  break;
		  };

		  console.log('FS Error: ' + msg);				 
	}
	
	
	//\\ load pictures.. & append to diary
	var loadPicturesDiary = function(project_id){
	
		function fsLoadPictureSuccess(fs){
			fs.root.getFile($.pictures_storage_file, {}, function(fileEntry) { // callback: file read successfully
					// fileEntry.toURL() to print path..for debug
					fileEntry.file(function(file) {
						var reader = new FileReader();
					
						reader.onloadend = function(e) {
							var res = this.result.split("+"),this_el;
							// load images into feed
							for (var i=1; i< res.length; i++){ // starts from 1 becase 0 is empty ("")
								this_el = res[i].trim();
								if (this_el!=""){
									var append_str = '<div class="project-content project-content-image" style="background-image:url(';
									append_str += "'"+this_el+"');";
									append_str += '"></div>';
									$("#project-feed").append(append_str);
								}
							};
						};
						  
					  reader.readAsText(file);
						  
					},function(){ /*error callback*/});
				}, function(fileEntry) { /* callback: file creation error */}
			);
		}

		// load images..
		window.webkitStorageInfo.requestQuota(window.PERSISTENT, 1024*1024, function(grantedBytes) {
		  window.requestFileSystem(window.PERSISTENT, grantedBytes, fsLoadPictureSuccess, fsError);
		}, function(e) {
		  console.log('Error', e); // debug
		});
	
	}
	
	//\\ load texts (posts).. & append to diary
	var loadTextsDiary = function(project_id){
	
		function fsLoadTextSuccess(fs){
			fs.root.getFile($.texts_storage_file, {}, function(fileEntry) { // callback: file read successfully
					fileEntry.file(function(file) {
						var reader = new FileReader();
					
						  reader.onloadend = function(e) {
							var res = this.result.split("+"),this_el, this_title, this_post,append_str="";
							
							// load texts (posts) into feed
							for (var i=1; i< res.length; i++){ // starts from 1 becase 0 is empty ("")
								this_el = res[i].trim();
								
								
								if (this_el!="" && this_el!="|"){ // if not empty..
									// update css (if not already done)
									$("#project-feed").css("max-height","");
									$("#project-feed").css("height","50%");
								
									this_el_parts = this_el.split("|");
									this_title = this_el_parts[0];
									this_post = this_el_parts[1];
									
									append_str = '<div class="project-content"><div class="project-content-text-title">'+this_title+'</div><div class="project-content-text-body">'+this_post+'</div></div>';
									$("#project-feed").append(append_str);
									
								}
							};
						  };
						  
						  reader.readAsText(file);
						  
					},function(){ /*error callback*/});

				}, function(fileEntry) { /*callback: file creation error*/}
			);
		}
			
		// load texts..
		window.webkitStorageInfo.requestQuota(window.PERSISTENT, 1024*1024, function(grantedBytes) {
		  window.requestFileSystem(window.PERSISTENT, grantedBytes, fsLoadTextSuccess, fsError);
		}, function(e) {
		  console.log('Error', e); // debug
		});
	
	}
	
	//\\ load audio clips.. & append to diary
	var loadAudiosDiary = function(project_id){
	
		function fsLoadAudioSuccess(fs){
			fs.root.getFile($.audios_storage_file, {}, function(fileEntry) { // callback: file read successfully
					fileEntry.file(function(file) {
						var reader = new FileReader();
					
						reader.onloadend = function(e) {
							var res = this.result.split("+"),this_el,append_str="";

							// load audios into feed
							for (var i=1; i< res.length; i++){ // starts from 1 becase 0 is empty ("")
								this_el = res[i].trim();
								
								
								if (this_el!="" && this_el!="|"){ // if not empty..
									append_str = '<div class="project-content project-content-audio" controls="controls" style="width:100%;">';
									append_str = append_str + '<audio controls="controls" style="display:block; width:100%; padding-top:53%;" src="'+ this_el.trim() + '" type="audio/mpeg"></audio></div>';
									$("#project-feed").append(append_str);									
								}
							};
						};
						  
						reader.readAsText(file);
						  
					},function(){ /*error callback*/});

				}, function(fileEntry) { /*callback: file creation error*/}
			);
		}
			
		// load audios..
		window.webkitStorageInfo.requestQuota(window.PERSISTENT, 1024*1024, function(grantedBytes) {
		  window.requestFileSystem(window.PERSISTENT, grantedBytes, fsLoadAudioSuccess, fsError);
		}, function(e) {
		  console.log('Error', e); // debug
		});
	
	}
	
	//\\ load video clips.. & append to diary
	var loadVideosDiary = function(project_id){
	
		function fsLoadVideoSuccess(fs){
			fs.root.getFile($.videos_storage_file, {}, function(fileEntry) { // callback: file read successfully

					fileEntry.file(function(file) {
						var reader = new FileReader();
					
						reader.onloadend = function(e) {
							var res = this.result.split("+"),res2,i,j,this_ext,this_video,this_source,this_source_parts,mime_type,sourcePartsLength,append_str="";

							// load videos into feed
							for (i=1; i< res.length; i++){ // N videos >> for each video 1+ sources.. (starts from 1 becase 0 is empty ("") )
								this_video = res[i].trim();
								
								// clean string
								this_video = this_video.replace('|','');
								this_video = this_video.replace('+','');

								if (this_video!=""){ // if not empty/invalid
									
									append_str = '<div class="project-content"><video controls id="video-contained" width="100%" height="100%"  poster="images/goodeed.jpg">';
									
									res2 = this.result.split("|");
									
									
									for (j=0; j < res2.length; j++){ // for each source..
										this_source = res2[j].trim();
										
										// clean string
										this_source = this_source.replace('|','');
										this_source = this_source.replace('+','');
										
										if (this_source!=""){ // if not empty/invalid
											this_source_parts = this_source.split(".");
											sourcePartsLength = this_source_parts.length;
											this_ext = this_source_parts[sourcePartsLength-1]; // extension
											
											console.log("[this_ext] " + this_ext);  // debug
											if (this_ext==="vtt"){ // subtitle file (English)
												append_str = append_str + '<track src="' + this_source + '" label="English subtitles"  kind="subtitles" srclang="en" default></track>';
												$("#video-contained").append();
											} else { // video source
												mime_type = getVideoMimetype(this_ext);
												append_str = append_str + '<source src="' + this_source + '" type="' + mime_type + '" />';
											}
											
										}
									}
									
									append_str = append_str + "</video></div>";
									
									$("#project-feed").append(append_str);
								}
							};
						};

						reader.readAsText(file);
						  
					},function(){ /*error callback*/});

				}, function(fileEntry) { /*callback: file creation error*/}
			);
		}
			
		// load videos..
		window.webkitStorageInfo.requestQuota(window.PERSISTENT, 1024*1024, function(grantedBytes) {
		  window.requestFileSystem(window.PERSISTENT, grantedBytes, fsLoadVideoSuccess, fsError);
		}, function(e) {
		  console.log('Error', e);
		});
	
	}
	
	//\\ load multimedia content into diary
	var loadDiaryContent = function(project_id){
		loadTextsDiary(project_id);
		loadPicturesDiary(project_id);
		loadAudiosDiary(project_id);
		loadVideosDiary(project_id);
	}
	
	// #############################
	// ###### VIEWS LOADING ########
	// #############################	
	
	//\\ welcome page: association or donor?
	var loadWelcomePage = function(){ 
		var fun = function(){
			navigator.screenOrientation.set('portrait'); // only portrait
			$.last_loaded_view = "welcome"; // to handle backbutton..
			
			// close menu if opened
			openCloseMenu(1,$("#menu-container"));
			
			// ## events
		
			$("#choice-association").click(function(){
				loadAssociationProjectsPage();
			});

			$("#choice-donor").click(function(){
				loadDonorProjectsPage();
			});
			
			// ## edit css..
			// nothing to edit
		};
	
		load_page("welcome_header.html","welcome_main.html","",fun,"");
	};
	
	//\\ projects list (of one association)
	var loadAssociationProjectsPage = function(){ 
		var fun = function(){
			navigator.screenOrientation.set('portrait'); // only portrait
			$.last_loaded_view = "association_projects"; // to handle backbutton..
		
			loadContextualMenu("association");
			
			// close menu if opened
			openCloseMenu(1,$("#menu-container"));
			
			// ## events
			
			$(".project-image-association").click(function(){
				var project_id = $(this).attr("id");
				loadAssociationProjectActionsPage(project_id);
			});
			
			// ## edit css..
			// nothing to edit
		};
	
		load_page("association_projects_header.html","association_projects_main.html","",fun,"association"); 
	};
	
	//\\ text (post),media(picture-video) or audio?
	var loadAssociationProjectActionsPage = function(){ // text (post),media(picture-video) or audio?
		var fun = function(){
			navigator.screenOrientation.set('portrait'); // only portrait
			$.last_loaded_view = "association_project_actions"; // to handle backbutton..
			
			loadContextualMenu("association");
			
			// close menu if opened
			openCloseMenu(1,$("#menu-container"));
			
			
			// ## events
			$("#choice-text").click(function(){
				loadAssociationProjectTextPage();
			});
			
			$("#choice-media").click(function(){
				$("#choice-media-picture").click(function(){
					loadAssociationProjectPicturePage();
				});
				
				$("#choice-media-video").click(function(){
					loadAssociationProjectVideoPage();
				});				
			
				$(this).hide();
				$("#choice-media2").show();
			});

			$("#choice-audio").click(function(){
				loadAssociationProjectAudioPage();
			});
			
			// ## edit css..
			// nothing to edit
		};
	
		load_page("association_projects_actions_header.html","association_projects_actions_main.html","",fun,"association"); 
	};
	
	//\\ make a post (title+description)
	var loadAssociationProjectTextPage = function(){ 
	
		var fun = function(){
			navigator.screenOrientation.set('portrait'); // only portrait
			$.last_loaded_view = "association_project_text"; // to handle backbutton..
			
			loadContextualMenu("association");
			
			$('#add-text-diary').prop('disabled', true); // disable "add text" button

			// write post content to file..
			 function fsTextSuccess(fs){
				fs.root.getFile($.texts_storage_file, {create: true},
					function(fileEntry) { // callback: file created/opened successfully
						fileEntry.createWriter(function(fileWriter) {
						
							fileWriter.onwriteend = function(e) {/**/};
							fileWriter.onerror = function(e) {/**/};

							if ($.last_title!="" && $.last_post!=""){
								
							   // Create a new Blob obj (raw data) and write it to file
							   var blob = new Blob([$.last_title.trim() + "|" + $.last_post.trim() + "+"], {type: 'text/plain'});
							   // write (APPEND) to file
							   fileWriter.seek(fileWriter.length);
							   fileWriter.write(blob);
							   
							   loadAssociationProjectPage(); // show project diary
							}
						   
						},function(){ /*error callback*/});

					}, function(fileEntry) { /*callback: file creation error*/}
				);
			}				
			 
			// ## events	
			 $("#project-text-description").keydown(function (e) { // Prevent new line + handle confirm button activation
				if ($("#project-text-description").val()!="" && $("#project-text-description-title").val()!=""){
					$('#add-text-diary').prop('disabled', false); // enable "confirm" button
				} else {
					$('#add-text-diary').prop('disabled', true); // disable "confirm" button
				}
			 
				if (e.keyCode != 13) return;
				var msg = $(this).val().replace(/\n/g, " ");
				return false;
			});

			$("#project-text-description-title").keydown(function (e) { // handle confirm button activation
				if ($("#project-text-description").val()!="" && $("#project-text-description-title").val()!=""){
					$('#add-text-diary').prop('disabled', false); // enable "confirm" button
				} else {
					$('#add-text-diary').prop('disabled', true); // disable "confirm" button
				}
			});
			
			
			$("#add-text-diary").click(function(){

				$.last_title = $("#project-text-description-title").val();
				$.last_post = $("#project-text-description").val();

				window.webkitStorageInfo.requestQuota(window.PERSISTENT, 1024*1024, function(grantedBytes) {
				  window.requestFileSystem(window.PERSISTENT, grantedBytes, fsTextSuccess, fsError);
				}, function(e) {
				  console.log('Error', e);
				});

			});
			
			// ## code to be executed on page loading
			$("#project-text-description").val(''); // clean textarea
			$("#project-text-description-title").val(''); // clean title
			
			// ## edit css..
			// nothing to edit
		};
		
		load_page("association_projects_text_header.html","association_projects_text_main.html","",fun,"association");
	};
	
	//\\ take a picture (with device's camera)
	var loadAssociationProjectPicturePage = function(project_id){ 
		var fun = function(){
			$.last_loaded_view = "association_project_picture"; // to handle backbutton..
			navigator.screenOrientation.set('landscape'); // only landscape
			
			loadContextualMenu("association");
			
			// show taken picture..
			function pictureOnSuccess(imageURI){
				$.last_URI = imageURI;
				
				// modify CSS..
				$("#header").css("height","15%");
				$("#main").css("height","78%");
				$("#option-menu-association").css("margin-top","10%"); 
				$(".c-icon").css("margin","8% 0% 0% 0%");
			
				// show picture container
				$("#picture-container").show();
				$("#picture-container").attr("src",imageURI);
				$("#add-picture-library").show();
			}
			
			function pictureOnError(message){
				// do nothing..
			}
			
			// ## code to be executed on page loading
						
			navigator.camera.getPicture(pictureOnSuccess,pictureOnError, { quality: 50,
				destinationType: Camera.DestinationType.FILE_URI,
				allowEdit : false
			 }); 
			 
			// store taken picture full path
			function fsPictureSuccess(fs){
				fs.root.getFile($.pictures_storage_file, {create: true},
					function(fileEntry) { // callback: file created/opened successfully
						fileEntry.createWriter(function(fileWriter) {
						
							fileWriter.onwriteend = function(e) {/**/};
							fileWriter.onerror = function(e) {/**/};	

							// Create a new Blob obj (raw data) and write it to file
							var blob = new Blob([$.last_URI + "+"], {type: 'text/plain'});
							// write (APPEND) to file
							fileWriter.seek(fileWriter.length);
							fileWriter.write(blob);

							loadAssociationProjectPage(); // show project diary
						   
						},function(){ /*error callback*/});

					}, function(fileEntry) { /*callback: file creation error*/}
				);
			}

			 
			 // ## events
			 $("#add-picture-diary").click(function(){
				// restore CSS..
				$("#header").css("height","9%");
				$("#main").css("height","91.5%");
				$("#option-menu-association").css("margin-top",""); 
				$(".c-icon").css("margin","40% 0 40% 0");
			 
				window.webkitStorageInfo.requestQuota(window.PERSISTENT, 1024*1024, function(grantedBytes) {
				  window.requestFileSystem(window.PERSISTENT, grantedBytes, fsPictureSuccess, fsError);
				}, function(e) {
				  console.log('Error', e);
				});
		
			 });
		};
		
		load_page("association_projects_picture_header.html","association_projects_picture_main.html","",fun,"association");
	};
	
	//\\ add video from the Internet
	var loadAssociationProjectVideoPage = function(project_id){ 

		var fun = function(){
			
			$.last_loaded_view = "association_project_video"; // to handle backbutton..
			navigator.screenOrientation.set('portrait'); // only portrait
			
			loadContextualMenu("association");
			
			// store video source(s) full URLS
			function fsVideoSuccess(fs){
				fs.root.getFile($.videos_storage_file, {create: true},
					function(fileEntry) { // callback: file created/opened successfully
						fileEntry.createWriter(function(fileWriter) {
						
							fileWriter.onwriteend = function(e) {/**/};
							fileWriter.onerror = function(e) {/**/};	
						  
							if ($.last_URI!=""){
								// Create a new Blob obj (raw data) and write it to file
								var blob = new Blob([$.last_URI + "+"], {type: 'text/plain'});
								// write (APPEND) to file
								fileWriter.seek(fileWriter.length);
								fileWriter.write(blob);

								loadAssociationProjectPage();
							}
						   
						},function(){ /*error callback*/});

					}, function(fileEntry) { /*callback: file creation error*/}
				);
			}
			
			// show chosen video
			$("#add-new-video").click(function(){
				$("#ask-link-video").hide();
				
				navigator.screenOrientation.set('landscape'); // only landscape
				
				// modify CSS..
				$("#header").css("height","15%");
				$("#main").css("height","78%");
				$("#option-menu-association").css("margin-top","10%");
				$(".c-icon").css("margin","8% 0% 0% 0%");
				
				// show video container
				$("#video-container").show();
				$("#video-container").css("margin-top","1%");
				
				
				
				$("#add-video-diary").show();
			
				var uris = $.last_URI.split("|"); // split different sources
				
				var uriParts,uriPartsLength,url_ext,mime_type;
				
				for (var i=0; i < uris.length; i++){
				
					if (uris[i]!=""){ // if not empty..
						
						uriParts = uris[i].split(".");
						uriPartsLength = uriParts.length;
						
						url_ext = uriParts[uriPartsLength-1].toLowerCase()
						if (url_ext==="vtt"){ // subtitle file (English)
							$("#video-contained").append('<track src="' + uris[i] + '" label="English subtitles"  kind="subtitles" srclang="en" default></track>');
						} else { // video source
							mime_type = getVideoMimetype(url_ext);
							$("#video-contained").append('<source src="' + uris[i] + '" type="' + mime_type + '" />');
						}

					}
				}
				
			});
			
			// ## events
			
			$("#add-new-video-source").click(function(){
				window.plugins.toast.showShortCenter('Some video containers may not play properly (such as ogg)', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
			
				$.last_URI = $.last_URI + $("#video-link").val() + "|";
				$("#video-link").val(""); // clean text field for next input
				$('#add-new-video').prop('disabled', false); // enable "confirm" button
			});

			 $("#video-link").keydown(function (e) { // Prevent new line
				
				if ($("#video-link").val()!=""){
					$('#add-new-video-source').prop('disabled', false); // enable "add source" button
				} else {
					$('#add-new-video-source').prop('disabled', true); // disable "add source" button
				}
			});
			
			$("#add-video-diary").click(function(){
			
				// restore CSS..
				$("#header").css("height","9%");
				$("#main").css("height","91.5%");
				$("#option-menu-association").css("margin-top",""); 
				
				// store URI (multi-format) to show in diary
				window.webkitStorageInfo.requestQuota(window.PERSISTENT, 1024*1024, function(grantedBytes) {
				  window.requestFileSystem(window.PERSISTENT, grantedBytes, fsVideoSuccess, fsError);
				}, function(e) {
				  console.log('Error', e);
				});
		
			});
			
			// ## code to be executed on page loading
			$('#add-new-video-source').prop('disabled', true); // disable "add source" button
			$('#add-new-video').prop('disabled', true); // disable "confirm" button
			
			$.last_URI = "";
			
			window.plugins.toast.showShortCenter('Add VTT file as source for subtitle (in English language)', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
		
			// ## edit css..
			// nothing to edit
		};	
	
		
		load_page("association_projects_video_header.html","association_projects_video_main.html","",fun,"association");
	}
	
	//\\ record audio clip
	var loadAssociationProjectAudioPage = function(project_id){

		var fun = function(){
			navigator.screenOrientation.set('portrait'); // only portrait
			$.last_loaded_view = "association_project_audio"; // to handle backbutton..
			
			loadContextualMenu("association");
			
			var recordSuccess = function(){/*do nothing*/};
			
			// store recorded audio full path
			function fsAudioSuccess(fs){
				fs.root.getFile($.audios_storage_file, {create: true},
					function(fileEntry) { // callback: file created/opened successfully
						fileEntry.createWriter(function(fileWriter) {
						
							fileWriter.onwriteend = function(e) {/**/};
							fileWriter.onerror = function(e) {/**/};	

							// Create a new Blob obj (raw data) and write it to file
							var blob = new Blob([$.last_URI + "+"], {type: 'text/plain'});
							// write (APPEND) to file
							fileWriter.seek(fileWriter.length);
							fileWriter.write(blob);

							loadAssociationProjectPage();
						   
						},function(){ /*error callback*/});

					}, function(fileEntry) { /*callback: file creation error*/}
				);
			}
		
			// ## events
			$("#audio-start-recording").click(function(){ // start recording
				$(this).hide();
				$("#audio-stop-recording").show();
				$("#audio-play-recording").hide();
				$("#add-audio-diary").hide();
				
				media.startRecord();
			});
			
			$("#audio-stop-recording").click(function(){ // stop recording 
				$(this).hide();

				media.stopRecord();

				$.last_URI = "file:///storage/sdcard0/media/audio/"+$.last_GUID+".mp3";

				$("#audio-play-recording").attr("src",$.last_URI);
				
				$("#audio-start-recording").show();
				$("#audio-play-recording").show();
				$("#add-audio-diary").show();
				
			});
			
			$("#add-audio-diary").click(function(){ // store recording 
				window.webkitStorageInfo.requestQuota(window.PERSISTENT, 1024*1024, function(grantedBytes) {
				  window.requestFileSystem(window.PERSISTENT, grantedBytes, fsAudioSuccess, fsError);
				}, function(e) {
				  console.log('Error', e);
				});
				
			});
			
			// ## code to be executed on page loading
			$.last_GUID = generateGuid();
			var src = "media/audio/"+$.last_GUID+".mp3";
			var media = new Media(src, recordSuccess);
			
			// ## edit css..
			// nothing to edit
			
		};
		
		load_page("association_projects_audio_header.html","association_projects_audio_main.html","",fun,"association");
	};
	
	//\\ projects list (between those supported by the donor)
	var loadDonorProjectsPage = function(){ 
		var fun = function(){
		
			navigator.screenOrientation.set('portrait'); // only portrait
			$.last_loaded_view = "donor_projects"; // to handle backbutton...
			
			loadContextualMenu("donor");
			
			// close menu if opened
			openCloseMenu(1,$("#menu-container"));
			
			// ## code to be executed on page loading
			if ($.project1_isstarred === true){
				$("#project-1-starred").removeClass("c-icon-starred");
				$("#project-1-starred").addClass("c-icon-starred-chosen");
			} 
			if ($.project2_isstarred === true){
				$("#project-2-starred").removeClass("c-icon-starred");
				$("#project-2-starred").addClass("c-icon-starred-chosen");
			} 
			if ($.project3_isstarred === true){
				$("#project-3-starred").removeClass("c-icon-starred");
				$("#project-3-starred").addClass("c-icon-starred-chosen");
			} 


			// ## events
			$(".c-icon-starred").click(function(evt){
				evt.stopPropagation();
			
				$(this).removeClass("c-icon-starred");
				$(this).addClass("c-icon-starred-chosen");
				$(this).attr("is_starred","1");
				
				if ($(this).attr("id")==="project-1-starred"){ $.project1_isstarred = true; }
				if ($(this).attr("id")==="project-2-starred"){ $.project2_isstarred = true; }
				if ($(this).attr("id")==="project-3-starred"){ $.project3_isstarred = true; }
			});
			
			$(".c-icon-starred-chosen").click(function(evt){
				evt.stopPropagation();
			
				$(this).removeClass("c-icon-starred-chosen");
				$(this).addClass("c-icon-starred");
				$(this).attr("is_starred","0");
				
				if ($(this).attr("id")==="project-1-starred"){ $.project1_isstarred = false; }
				if ($(this).attr("id")==="project-2-starred"){ $.project2_isstarred = false; }
				if ($(this).attr("id")==="project-3-starred"){ $.project3_isstarred = false; }
			});
			
			$(".project-image-donor").click(function(){
				var project_id = $(this).attr("id");
				
				if(project_id!="project-2"){ // only "La biblioteca sul mare" project is available in demo
					window.plugins.toast.showShortCenter('Project not available in demo', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
					return;
				}

				loadDonorProjectPage(project_id);
			});
			
			
			// ## edit css..
			// nothing to edit
		
		};
	
		load_page("donor_projects_header.html","donor_projects_main.html","",fun,"donor");
	};
	
	//\\ projects list (between those supported by the donor)
	var loadStarredDonorProjectsPage = function(){ 
		var fun = function(){
		
			navigator.screenOrientation.set('portrait'); // only portrait
			$.last_loaded_view = "donor_starred_projects"; // to handle backbutton...
			
			loadContextualMenu("donor");
			
			// close menu if opened
			openCloseMenu(1,$("#menu-container"));

			// ## events
			
			$(".project-image-donor").click(function(){
				var project_id = $(this).attr("id");
				
				if(project_id!="project-2"){ // only "La biblioteca sul mare" project is available in demo
					window.plugins.toast.showShortCenter('Project not available in demo', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
					return;
				}
				
				loadDonorProjectPage(project_id);
			});
			
			// ## code to be executed on page loading
			if ($.project1_isstarred === true){
				$("#project-1").show();
			} 
			if ($.project2_isstarred === true){
				$("#project-2").show();
			} 
			if ($.project3_isstarred === true){
				$("#project-3").show();
			} 
			
			// ## edit css..
			// nothing to edit
		
		};
	
		load_page("donor_starred_projects_header.html","donor_starred_projects_main.html","",fun,"donor");
	};
	
	//\\ load diary of the project chosen by the association
	var loadAssociationProjectPage = function(project_id){ // load project diary
		var fun = function(){
			navigator.screenOrientation.set('portrait'); // only portrait
			$.last_loaded_view = "association_project"; // to handle backbutton...
			
			loadContextualMenu("association");
				
			loadDiaryContent(project_id);
			
			// ## edit css..
			// nothing to edit
		};
	
		load_page("association_project_diary_header.html","project_diary_main.html","",fun,"association");
		window.plugins.toast.showShortCenter('Sample project loading complete', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
	};

	//\\ load diary of the project chosen by the donor
	var loadDonorProjectPage = function(project_id){
		var fun = function(){
			navigator.screenOrientation.set('portrait'); // only portrait
			$.last_loaded_view = "donor_project"; // to handle backbutton..
			
			loadContextualMenu("donor");
			
			loadDiaryContent(project_id);
			
			// ## edit css..
			// nothing to edit
		};
	
		load_page("donor_project_diary_header.html","project_diary_main.html","",fun,"donor");
		window.plugins.toast.showShortCenter('Sample project loading complete', function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});
	};
	
})(jQuery);