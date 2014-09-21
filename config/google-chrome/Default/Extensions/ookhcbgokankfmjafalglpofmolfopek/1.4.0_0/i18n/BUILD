subinclude("//javascript/closure/builddefs:BUILD")

LOCALES = [
    "ar", "bg", "ca", "cs", "da", "de", "el", "en", "en-GB", "es", "es-419",
    "et", "fi", "fil", "fr", "he", "hi", "hr", "hu", "id", "it", "ja", "ko",
    "lt", "lv", "no", "nl", "pl", "pt-BR", "pt-PT", "ro", "ru", "sk", "sl",
    "sr", "sv", "th", "tr", "uk", "vi", "zh-CN", "zh-TW" ]

LOCALE_XTBS = ['//googledata/transconsole/xtb/ChromeExtensions:%s.xtb' %
               l for l in LOCALES]

js_library(name = "i18n_messages",
           srcs = [ "i18n_messages.js" ],
           deps = [ "//javascript/closure:base",
                    "//javascript/closure/json:json",
                    "//javascript/chrome:extensions_i18n" ])

js_binary(name = "i18n_messages_localized",
          srcs = [ ":i18n_messages" ],
          msgs = LOCALE_XTBS,
          compile = 1,
          externs_list = [ "//third_party/java/rhino:externs.js",
                           "//javascript/externs:common_for_chrome_extensions"
                         ],
          defs = CLOSURE_COMPILER_FLAGS_FULL + [
                    "--property_renaming=OFF",
                    "--collapse_properties=false" ],
          locales = LOCALES,
          tc_project = 'ChromeExtensions')

chrome_locales = []
for locale in LOCALES:
  js_compiler_locale = locale.lower().replace('-', '_')
  chrome_locale = locale.replace('-', '_').replace('no', 'nb')
  chrome_locales.append(chrome_locale)
  genrule(name = "messages_%s.json" % locale,
          srcs = [ "i18n_messages_localized__%s.js" % js_compiler_locale ],
          outs = [ "_locales/%s/messages.json" % chrome_locale ],
          tools = [ "//third_party/java/rhino:rhino_shell" ],
          cmd =
            "$(location //third_party/java/rhino:rhino_shell) $(SRCS)> $(OUTS)")

Fileset(name = "messages_fileset",
        entries = [
            FilesetEntry(files = [ "_locales/%s/messages.json" %
                                   locale for locale in chrome_locales ]) ],
        out = "messages_fs")
