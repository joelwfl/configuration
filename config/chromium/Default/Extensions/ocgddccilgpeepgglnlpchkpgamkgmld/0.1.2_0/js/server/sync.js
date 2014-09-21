var methodMap={create:"POST",update:"PUT","delete":"DELETE",read:"GET"},cachedAttributes={listPositionByCategory:!0,listPositionByDueDate:!0,listPositionByPriority:!0,categoryCollapsed:!0,linkUrl:!0},volatileAttributes={taskExpanded:!0};
define(["jquery","underscore","backbone","constants","server/auth"],function(p,i,j,q,k){function n(f,d,a){console.log("%c called sync with","background: pink",arguments);var e="string"==typeof d.url?d.url:d.url(),g=!0,e=i.extend({type:methodMap[f],dataType:"json",url:e+"?responseType=flat&includeDeleted=false&includeDone=false",xhrFields:{withCredentials:!0},crossDomain:!0},a);if(d&&("create"==f||"update"==f)){e.contentType="application/json";"create"==f&&(null==d.get("id")&&d.set({id:createGlobalId()}),
d.unset("neverSynced"));var h=d.toJSON();"update"==f&&(g=!1);for(var c in h)if(cachedAttributes[c]){var b={};b[d.get("id")+":"+c]=JSON.stringify(d.get(c));storage.set(b);b=null}else d.get(c)!=d.previous(c)&&"update"==f&&"id"!=c&&!volatileAttributes[c]&&(g=!0);e.data="create"==f?JSON.stringify([h]):JSON.stringify(h)}if(g){var j=e.success;e.success=function(a,d,e){var b=function(a){if(a)for(var b in cachedAttributes)"undefined"==typeof a[b]&&(a[b]=JSON.parse(userValues[a.id+":"+b]||null))};if(a instanceof
Array)if("create"==f)a=a[0],b(a);else for(var c=0;c<a.length;c++)b(a[c]);else b(a);return j(a,d,e)};var l=e.error;e.error=function(a,b,c){"parsererror"==b?k.logInUsingStoredCredentials(function(){},function(){k.logOut()}):409==b?k.logOut():"function"==typeof l&&l(a,b,c)};return p.ajax(e)}a.success()}function o(f,d,a){console.log("Model#save, this is:",this,"collection is:",this.collection);var e="tasks"==this.collection.type?"task":"category";console.log("called OUR save with",arguments,"connection is",
navigator.onLine,this.collection.type);var g,h;i.isObject(f)||null==f?(g=f,a=d):(g={},g[f]=d);a=a?i.clone(a):{};a.wait&&(h=i.clone(this.attributes));var c=i.extend({},a,{silent:!0});if(g&&!this.set(g,a.wait?c:a))return!1;var b=this;if(navigator.onLine){var k=a.success;a.success=function(c,d,e){d=b.parse(c,e);a.wait&&(d=i.extend(g||{},d));if(!b.set(d,a))return false;b._previousAttributes=i.clone(b.attributes);k?k(b,c):b.trigger("sync",b,c,a)};e=this.isNew()?"create":"update";e=(this.sync||j.sync).call(this,
e,this,a);a.wait&&this.set(h,c);return e}console.log("%c You're OFFLINE, but no worries","background: orange;");h=b.get("id");h||(h=createGlobalId(),b.set("neverSynced",!0));var c=b.collection.type,l="undefined"===typeof app?window[c]:app[c],m={};m[e+"-"+h]=JSON.stringify(b);m[c]=JSON.stringify(l);storage.set(m)}console.log("Not implemented in pacakged app yet");j.sync=n;j.Model.prototype.save=o;j.Model.prototype.isNew=function(){return!0==this.get("neverSynced")};return{sync:n,save:o}});