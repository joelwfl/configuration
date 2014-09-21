define("jquery,underscore,mustache,backbone,constants,text!templates/folder_options.html".split(","),function(b,e,g,h,j,i){return h.View.extend({tagName:"div",className:"folders-chooser",events:{"click .text":"itemClick","click .delete-button":"deleteCategory","click .edit-button":"editCategory","keydown .new-folder":"newFolderEntered","keydown .edit-box":"editBoxEntered","click .popover-background":"leave"},initialize:function(){e.bindAll(this,"leave","itemClick","selectAndClose","selectListViewItem",
"close","render");this.categories=this.options.app.categories;this.categories.bind("add",this.render);this.categories.bind("destroy",this.render)},render:function(){var a=[];if(this.options.target.length)if(b(this.options.target).offset().left==0&&b(this.options.target).offset().top==0)this.remove();else{e.each(this.categories.models,function(b){var d=b.get("name"),c=true;b.get("isDefault")&&(c=false);a.push({id:b.id,text:d,selected:b.id==this.options.selectedItem,canBeDeleted:c})},this);var d=g.i18n_to_html(i,
["choose_folder","new_folder"],{categories:a});b(this.el).html(d);b(document.body).append(this.el);var d=b(this.options.target).offset().left+b(this.options.target).width()/2,c=b(this.options.target).offset().top+b(this.options.target).height()/2;this.popoverWindow=b(this.el).find(".popover-window");this.popoverAnchor=this.popoverWindow.find(".popover-anchor");var f=false;c-this.popoverWindow.height()<10&&(f=true);this.popoverWindow.css("left",d-this.popoverWindow.find("ul").width()/2-2);this.popoverAnchor.css("left",
this.popoverWindow.find("ul").width()/2-2);if(f){this.popoverAnchor.removeClass("popover-anchor-top").addClass("popover-anchor-bottom");this.popoverWindow.css("top",c+5);this.popoverAnchor.css("top",-9)}else{this.popoverAnchor.removeClass("popover-anchor-bottom").addClass("popover-anchor-top");this.popoverWindow.css("top",c-this.popoverWindow.height()-20);this.popoverAnchor.css("top",this.popoverWindow.height()-7)}this.first=this.popoverWindow.find("li:first");this.last=this.popoverWindow.find("li:last");
this.selectedItem=this.popoverWindow.find(".selected");this.selectedItem.focus();this.selectListViewItem();return this}else this.remove()},itemClick:function(a){this.stopEditing();this.selectedItem=b(a.target);this.selectListViewItem();b(this.el).fadeOut("fast",this.selectAndClose)},deleteCategory:function(a){this.categories.get(b(a.target).parent().data("id")).destroy()},editCategory:function(a){a=b(a.target).parent("li");this.currentlyEditing=true;this.editingText=a.find(".text");this.editingInput=
a.find(".edit-box");this.editingCategory=a.data("id");this.startEditing()},startEditing:function(){this.editingText.hide();this.editingInput.show();this.editingInput.focus()},stopEditing:function(){if(this.currentlyEditing){this.currentlyEditing=false;if(this.editingText.text()!=this.editingInput.val()){this.categories.get(this.editingCategory).save({name:this.editingInput.val()});this.editingText.text(this.editingInput.val())}this.editingText.show();this.editingInput.hide()}},editBoxEntered:function(a){switch(a.keyCode){case 13:this.stopEditing();
break;case 27:this.editingInput.val(this.editingText.text());this.stopEditing()}},selectAndClose:function(){this.stopEditing();this.selectedItem.parent().data("id")==this.model.id?this.options.callback():this.model.collection.dropTaskIntoCategory(VIEW_BY_CATEGORY,this.model,this.selectedItem.parent().data("id"));this.remove()},leave:function(){b(this.el).fadeOut("fast",this.close);this.options.callback()},close:function(){this.categories.unbind("add",this.render);this.categories.unbind("destroy",
this.render);this.stopEditing();this.remove()},newFolderEntered:function(a){switch(a.keyCode){case 13:a=b(this.el).find(".new-folder").val();if(this.categories.getCategoryByName(a))break;a={name:a};a.id=createGlobalId();a.neverSynced=true;a=this.categories.create(a);b(this.el).find(".new-folder").val("");this.options.model.save({categoryId:a.id});this.render();break;case 27:this.leave()}},selectListViewItem:function(){b(this.el).children().removeClass("selected");this.selectedItem.find(".delete-button").addClass("selected")}})});