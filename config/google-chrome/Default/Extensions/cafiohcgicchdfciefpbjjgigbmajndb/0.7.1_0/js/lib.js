(function() {
  var __slice = [].slice;

  this.log = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return chrome.extension.sendRequest({
      action: 'console',
      fn: 'info',
      args: args
    });
  };

  this.readKeyCombo = function(e, preventDefault) {
    var correctedIdentifiers, keyChar, keyCodes, keyIdentifier, keyIdentifierCorrectionMap, keyNames, modifiers, platform, specialKeys, unicodeKeyInHex;
    keyChar = "";
    keyCodes = {
      ESC: 27,
      backspace: 8,
      deleteKey: 46,
      enter: 13,
      space: 32,
      shiftKey: 16,
      f1: 112,
      f12: 123
    };
    keyNames = {
      37: "left",
      38: "up",
      39: "right",
      40: "down"
    };
    keyIdentifierCorrectionMap = {
      "U+00C0": ["U+0060", "U+007E"],
      "U+00BD": ["U+002D", "U+005F"],
      "U+00BB": ["U+003D", "U+002B"],
      "U+00DB": ["U+005B", "U+007B"],
      "U+00DD": ["U+005D", "U+007D"],
      "U+00DC": ["U+005C", "U+007C"],
      "U+00BA": ["U+003B", "U+003A"],
      "U+00DE": ["U+0027", "U+0022"],
      "U+00BC": ["U+002C", "U+003C"],
      "U+00BE": ["U+002E", "U+003E"],
      "U+00BF": ["U+002F", "U+003F"]
    };
    specialKeys = {
      32: 'Space',
      33: 'PageUp',
      34: 'PageDown',
      35: 'End',
      36: 'Home',
      37: 'Left',
      38: 'Up',
      39: 'Right',
      40: 'Down',
      44: 'PrScr',
      45: 'Insert',
      46: 'Delete',
      112: 'F1',
      113: 'F2',
      114: 'F3',
      115: 'F4',
      116: 'F5',
      117: 'F6',
      118: 'F7',
      119: 'F8',
      120: 'F9',
      121: 'F10',
      122: 'F11',
      123: 'F12'
    };
    platform = navigator.userAgent.indexOf("Mac") !== -1 ? "Mac" : navigator.userAgent.indexOf("Linux") !== -1 ? "Linux" : "Windows";
    if (e.type === 'keydown') {
      if (e.keyCode in specialKeys) {
        keyChar = '<' + (e.metaKey ? 'M-' : '') + (e.ctrlKey ? 'C-' : '') + (e.altKey ? 'A-' : '') + (e.shiftKey ? 'S-' : '') + specialKeys[e.keyCode] + '>';
      } else if ((e.metaKey || e.ctrlKey || e.altKey) && e.keyCode > 31) {
        if (preventDefault) {
          e.preventDefault();
        }
        if (e.keyIdentifier.slice(0, 2) !== "U+") {
          if (keyNames[e.keyCode]) {
            return keyNames[e.keyCode];
          }
          if (e.keyCode >= keyCodes.f1 && e.keyCode <= keyCodes.f12) {
            return "f" + (1 + e.keyCode - keyCodes.f1);
          }
          return "";
        }
        keyIdentifier = e.keyIdentifier;
        if ((platform === "Windows" || platform === "Linux") && keyIdentifierCorrectionMap[keyIdentifier]) {
          correctedIdentifiers = keyIdentifierCorrectionMap[keyIdentifier];
          keyIdentifier = e.shiftKey ? correctedIdentifiers[0] : correctedIdentifiers[1];
        }
        unicodeKeyInHex = "0x" + keyIdentifier.substring(2);
        keyChar = String.fromCharCode(parseInt(unicodeKeyInHex)).toLowerCase();
        if (keyChar !== "") {
          if (e.shiftKey) {
            keyChar = keyChar.toUpperCase();
          }
          modifiers = [];
          if (e.metaKey) {
            modifiers.push("M");
          }
          if (e.ctrlKey) {
            modifiers.push("C");
          }
          if (e.altKey) {
            modifiers.push("A");
          }
          keyChar = modifiers.join('-') + (modifiers.length === 0 ? '' : '-') + keyChar;
          if (modifiers.length > 0 || keyChar.length > 1) {
            keyChar = "<" + keyChar + ">";
          }
        }
      }
    } else if (e.type === 'keypress') {
      if (e.keyCode > 31) {
        keyChar = String.fromCharCode(e.charCode);
      }
    }
    log('key char', keyChar);
    return keyChar;
  };

  this.globToRegex = function(line) {
    var currentChar, escaping, i, inCurlies, len, sb;
    log("got line [" + line + "]");
    line = $.trim(line);
    sb = [];
    if (line.length > 1 && line[0] === "*") {
      line = line.substring(1);
    }
    if (line.length > 1 && line[line.length - 1] === "*") {
      line = line.substring(0, line.length - 1);
    }
    i = 0;
    len = line.length;
    escaping = false;
    inCurlies = 0;
    while (i < len) {
      currentChar = line[i++];
      switch (currentChar) {
        case '*':
          sb.push(escaping ? "\\*" : ".*");
          escaping = false;
          break;
        case '?':
          sb.push(escaping ? "\\?" : ".");
          escaping = false;
          break;
        case '.':
        case '(':
        case ')':
        case '+':
        case '|':
        case '^':
        case '$':
        case '@':
        case '%':
          sb.push('\\');
          sb.push(currentChar);
          escaping = false;
          break;
        case '\\':
          if (escaping) {
            sb.push("\\\\");
          }
          escaping = !escaping;
          break;
        case '{':
          sb.push(escaping ? '\\{' : '(');
          if (!escaping) {
            inCurlies++;
          }
          escaping = false;
          break;
        case '}':
          if (inCurlies > 0 && !escaping) {
            sb.push(')');
            inCurlies--;
          } else if (escaping) {
            sb.push("\\}");
          } else {
            sb.push("}");
          }
          escaping = false;
          break;
        case ',':
          if (inCurlies > 0 && !escaping) {
            sb.push('|');
          } else if (escaping) {
            sb.push("\\,");
          } else {
            sb.push(",");
          }
          break;
        default:
          sb.push(currentChar);
          escaping = false;
      }
    }
    return sb.join('');
  };

  this.htmlentities = function(string, quote_style) {
    var entity, hash_map, symbol, tmp_str;
    hash_map = get_html_translation_table('HTML_ENTITIES', quote_style);
    if (!hash_map) {
      return false;
    }
    hash_map["'"] = '&#039;';
    symbol = '';
    tmp_str = '';
    entity = '';
    tmp_str = string.toString();
    for (symbol in hash_map) {
      entity = hash_map[symbol];
      tmp_str = tmp_str.split(symbol).join(entity);
    }
    return tmp_str;
  };

  this.get_html_translation_table = function(table, quote_style) {
    var constMappingQuoteStyle, constMappingTable, decimal, entities, entity, hash_map, symbol, useQuoteStyle, useTable;
    entities = {};
    hash_map = {};
    decimal = 0;
    symbol = '';
    constMappingTable = {};
    constMappingQuoteStyle = {};
    useTable = {};
    useQuoteStyle = {};
    constMappingTable[0] = 'HTML_SPECIALCHARS';
    constMappingTable[1] = 'HTML_ENTITIES';
    constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
    constMappingQuoteStyle[2] = 'ENT_COMPAT';
    constMappingQuoteStyle[3] = 'ENT_QUOTES';
    useTable = !isNaN(table) ? constMappingTable[table] : (table ? table.toUpperCase() : 'HTML_SPECIALCHARS');
    useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : (quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT');
    if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
      throw new Error("Table: " + useTable + " not supported");
    }
    entities['38'] = '&amp;';
    if (useTable === 'HTML_ENTITIES') {
      entities['160'] = '&nbsp;';
      entities['161'] = '&iexcl;';
      entities['162'] = '&cent;';
      entities['163'] = '&pound;';
      entities['164'] = '&curren;';
      entities['165'] = '&yen;';
      entities['166'] = '&brvbar;';
      entities['167'] = '&sect;';
      entities['168'] = '&uml;';
      entities['169'] = '&copy;';
      entities['170'] = '&ordf;';
      entities['171'] = '&laquo;';
      entities['172'] = '&not;';
      entities['173'] = '&shy;';
      entities['174'] = '&reg;';
      entities['175'] = '&macr;';
      entities['176'] = '&deg;';
      entities['177'] = '&plusmn;';
      entities['178'] = '&sup2;';
      entities['179'] = '&sup3;';
      entities['180'] = '&acute;';
      entities['181'] = '&micro;';
      entities['182'] = '&para;';
      entities['183'] = '&middot;';
      entities['184'] = '&cedil;';
      entities['185'] = '&sup1;';
      entities['186'] = '&ordm;';
      entities['187'] = '&raquo;';
      entities['188'] = '&frac14;';
      entities['189'] = '&frac12;';
      entities['190'] = '&frac34;';
      entities['191'] = '&iquest;';
      entities['192'] = '&Agrave;';
      entities['193'] = '&Aacute;';
      entities['194'] = '&Acirc;';
      entities['195'] = '&Atilde;';
      entities['196'] = '&Auml;';
      entities['197'] = '&Aring;';
      entities['198'] = '&AElig;';
      entities['199'] = '&Ccedil;';
      entities['200'] = '&Egrave;';
      entities['201'] = '&Eacute;';
      entities['202'] = '&Ecirc;';
      entities['203'] = '&Euml;';
      entities['204'] = '&Igrave;';
      entities['205'] = '&Iacute;';
      entities['206'] = '&Icirc;';
      entities['207'] = '&Iuml;';
      entities['208'] = '&ETH;';
      entities['209'] = '&Ntilde;';
      entities['210'] = '&Ograve;';
      entities['211'] = '&Oacute;';
      entities['212'] = '&Ocirc;';
      entities['213'] = '&Otilde;';
      entities['214'] = '&Ouml;';
      entities['215'] = '&times;';
      entities['216'] = '&Oslash;';
      entities['217'] = '&Ugrave;';
      entities['218'] = '&Uacute;';
      entities['219'] = '&Ucirc;';
      entities['220'] = '&Uuml;';
      entities['221'] = '&Yacute;';
      entities['222'] = '&THORN;';
      entities['223'] = '&szlig;';
      entities['224'] = '&agrave;';
      entities['225'] = '&aacute;';
      entities['226'] = '&acirc;';
      entities['227'] = '&atilde;';
      entities['228'] = '&auml;';
      entities['229'] = '&aring;';
      entities['230'] = '&aelig;';
      entities['231'] = '&ccedil;';
      entities['232'] = '&egrave;';
      entities['233'] = '&eacute;';
      entities['234'] = '&ecirc;';
      entities['235'] = '&euml;';
      entities['236'] = '&igrave;';
      entities['237'] = '&iacute;';
      entities['238'] = '&icirc;';
      entities['239'] = '&iuml;';
      entities['240'] = '&eth;';
      entities['241'] = '&ntilde;';
      entities['242'] = '&ograve;';
      entities['243'] = '&oacute;';
      entities['244'] = '&ocirc;';
      entities['245'] = '&otilde;';
      entities['246'] = '&ouml;';
      entities['247'] = '&divide;';
      entities['248'] = '&oslash;';
      entities['249'] = '&ugrave;';
      entities['250'] = '&uacute;';
      entities['251'] = '&ucirc;';
      entities['252'] = '&uuml;';
      entities['253'] = '&yacute;';
      entities['254'] = '&thorn;';
      entities['255'] = '&yuml;';
    }
    if (useQuoteStyle !== 'ENT_NOQUOTES') {
      entities['34'] = '&quot;';
    }
    if (useQuoteStyle === 'ENT_QUOTES') {
      entities['39'] = '&#39;';
    }
    entities['60'] = '&lt;';
    entities['62'] = '&gt;';
    for (decimal in entities) {
      entity = entities[decimal];
      symbol = String.fromCharCode(decimal);
      hash_map[symbol] = entity;
    }
    return hash_map;
  };

}).call(this);
