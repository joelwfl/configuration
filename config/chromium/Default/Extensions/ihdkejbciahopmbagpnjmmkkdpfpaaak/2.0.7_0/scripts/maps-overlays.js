////////////////////////////////////////////////////////////////////////////////////
var CID = "60016002";
function addOverlay(layer, slot, opacity) {
	//jQuery.log("addOverlay");
	var hMap = new MCustomTileLayer(map, layer, slot, opacity);
	map.overlayMapTypes.insertAt(0, hMap);
	return (hMap);
}

/*
MCustomTileLayer.js

Copyright 2010 - Marcelo Montagna  - http://maps.forum.nu

Free to use as long as copyright notices are left unchanged.
Please save the file to your own server. Do not link directly,
or unexpected things might happen to your control :-)
-----
Thanks Marcelo! This rocks!
We've updated to suit our needs, this code is not as originally written.
modifications added by mnottingham@aws.com
*/


function MCustomTileLayer(map, layer, slot, opacity) {
	//jQuery.log("MCustomTileLayer");
	this.map = map;
	this.opacity = opacity;
	this.tiles = Array();
	this.layer = layer;
	this.animationSlot = slot;
	this.tileSize = new google.maps.Size(256, 256);
	this.maxZoom = 19;
	this.minZoom = 4;
	this.name = 'Custom Layer';
	this.alt = 'Custom Layer';
	this.visible = false;
	this.initialized = false;
	this.self = this;
}


MCustomTileLayer.prototype.getTile = function(p, z, ownerDocument) {
	// If the tile already exists then use it
	for (var n = 0; n < this.tiles.length; n++) {
		if (this.tiles[n].id == 't_' + p.x + '_' + p.y + '_' + z) {
			showTileLoadingMessage();
			return this.tiles[n];
		}
	}
	// If the tile does not exist then create it
	var tile = ownerDocument.createElement('IMG');
	tile.id = 't_' + p.x + '_' + p.y + '_' + z
	tile.style.width = this.tileSize.width + 'px';
	tile.style.height = this.tileSize.height + 'px';
	tile.src = this.getTileUrl(p, z);
	tile.onload = function() {
		showTileLoadingMessage();
	}
	if (!this.visible) {
		tile.style.display = 'none';
	}
	this.tiles.push(tile)
	//Don't let the array get too big
	while (this.tiles.length > 180) {
		var removed = this.tiles.shift();
		removed = null;
	}
	this.setObjectOpacity(tile);
	// clear tile cache after 1 minute;
	setTimeout(function() { this.tiles = []; }, 1 * 60 * 1000);
	return tile;
};


var hideTileLoadingMessageTimer = false;
function showTileLoadingMessage() {
	jQuery("#map-animation-loading").css("display", "block");
	if (hideTileLoadingMessageTimer) clearTimeout(hideTileLoadingMessageTimer);
	hideTileLoadingMessageTimer = setTimeout(function() {
		jQuery("#map-animation-loading").css("display", "");
	}, 550);
	return (true);
}

MCustomTileLayer.prototype.getTileUrl = function(coord, zoom) {
	var maxTiles = Math.pow(2, zoom);
	var x = coord.x;
	while (x >= maxTiles) x -= maxTiles;
	while (x < 0) x += maxTiles;
	var y = coord.y;
	var url = "http://chrome.tiles.weatherbug.com/DataService/GetTile_v2.aspx?pid=2c6564fb-dc4c-422c-b89a-e7d4d4f4890b&cid=" + CID;
	url += "&lid=" + this.layer + "&as=" + this.animationSlot + "&c=0&fq=0&tx=" + x + "&ty=" + y + "&zm=" + zoom;
	return (url);
}

MCustomTileLayer.prototype.initialize = function() {
	//jQuery.log("initialize");
	if (this.initialized) {
		return;
	}
	var self = this.self;
	this.map.overlayMapTypes.insertAt(0, self);
	this.initialized = true;
}

MCustomTileLayer.prototype.hide = function() {
	//jQuery.log("hide")
	this.visible = false;
	for (var n = 0; n < this.tiles.length; n++) {
		this.tiles[n].style.display = 'none';
	}
}

MCustomTileLayer.prototype.show = function() {
	//jQuery.log("show")
	this.initialize();
	this.visible = true;
	for (var n = 0; n < this.tiles.length; n++) {
		this.tiles[n].style.display = '';
	}
}

// This function doesn't seem to do anything
MCustomTileLayer.prototype.releaseTile = function(tile) {
	//	debug('Release ' + tile.id);
	tile = null;
}

MCustomTileLayer.prototype.setOpacity = function(op) {
	this.opacity = op;
	for (var n = 0; n < this.tiles.length; n++) {
		this.setObjectOpacity(this.tiles[n]);
	}
}

MCustomTileLayer.prototype.fadeToOpacity = function(op) {
	var self = this.self;
	if (typeof op != 'undefined') {
		this.targetOpacity = op;
	}
	//debug(this.opacity + ' --- ' + this.targetOpacity)
	if (this.opacity != this.targetOpacity) {
		if (this.opacity < this.targetOpacity) {
			this.opacity += 1;
		}
		else if (this.opacity > this.targetOpacity) {
			this.opacity -= 1;
		}
		for (var n = 0; n < this.tiles.length; n++) {
			this.setObjectOpacity(this.tiles[n]);
		}
		window.setTimeout(function() { self.fadeToOpacity() }, 10);
	}
	else if (this.targetOpacity == 0) {
		this.hide();
	}
}

MCustomTileLayer.prototype.setObjectOpacity = function(obj) {
	if (this.opacity) {
		if (typeof (obj.style.filter) == 'string') { obj.style.filter = 'alpha(opacity:' + this.opacity * 100 + ')'; }
		if (typeof (obj.style.KHTMLOpacity) == 'string') { obj.style.KHTMLOpacity = this.opacity; }
		if (typeof (obj.style.MozOpacity) == 'string') { obj.style.MozOpacity = this.opacity; }
		if (typeof (obj.style.opacity) == 'string') { obj.style.opacity = this.opacity; }
	}
}