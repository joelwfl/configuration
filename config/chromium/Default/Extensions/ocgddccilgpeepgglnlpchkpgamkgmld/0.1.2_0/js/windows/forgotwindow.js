define("jquery,underscore,backbone,mustache,windows/window,server/auth,helpers/view,text!templates/forgotwindow.html".split(","),function(c,i,j,e,f,g,b,h){return f.extend({className:"window form-window",events:{"click .back":"back","click button":"remindMe","focus :input":"clearErrors"},render:function(){var a=e.i18n_to_html(h,["forgot_headline","forgot_instructions","reset_password_button","your_email"]);c(this.el).html(a);return this},remindMe:function(){this.options.app.trackClick("Forgot Window",
"Remind Me");this.clearErrors();var a=c(this.el).find("input"),d=a.val();if(d)g.remindMe(d,function(){this.back()}.bind(this),function(){b.shake(a);b.showError("<br>"+getMessage("error_with_email"),a,"insertBefore")}.bind(this));else{b.shake(a);b.showError(getMessage("error_with_email"),a,"insertBefore")}},clearErrors:function(){b.clearErrors()}})});