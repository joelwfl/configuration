define(["jquery"],function(c){return{shake:function(a){var b=10;a.addClass("invalidField");var c=setInterval(function(){a.css("margin-left",b);b*=-0.8;0==parseInt(b)&&clearInterval(c)},40)},changeCssNoTransition:function(a,b){a.css("-webkit-transition","none").css(b);setTimeout(function(){a.css("-webkit-transition","")},10)},addClassNoTransition:function(a,b){a.css("-webkit-transition","none").addClass(b);setTimeout(function(){a.css("-webkit-transition","")},10)},showError:function(a,b,d){c("<div>").addClass("errorLabel invisible").html(a)[d](b).delay(100).queue(function(){c(this).removeClass("invisible")})},
clearErrors:function(){c(".errorLabel").remove();c(":input").removeClass("invalidField")}}});