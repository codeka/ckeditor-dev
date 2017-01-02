(function() {
  function dialog(a) {
    /** Helper function that takes a blobstore URL and returns a new URL with the specified size. */
    function resize(url, size) {
      return url.replace("=s100", "=s" + size)
    }

    /** Refresh the image that we have loaded, when a new image is specified. */
    function refresh(g, editor) {
      var elem = editor.getContentElement("info", "filename");
      elem.setValue("Starting...");
      CKEDITOR.ajax.load("/blob/upload-url", function(resp) {
        var url = JSON.parse(resp).upload_url;
        console.log("Uploading to: " + url);
        var xhr = new XMLHttpRequest;
        xhr.upload.addEventListener("progress", function(b) {
          if (editor.lengthComputable && (editor = Math.round(100 * editor.loaded / editor.total))) {
            elem.setValue(g.name + " ... " + editor + "%");
          }
        }, false);
        xhr.onreadystatechange = function() {
          4 == xhr.readyState && (resp = JSON.parse(xhr.responseText),
            updatePreview(editor, resp))
        };
        xhr.open("POST", url, !0);
        xhr.setRequestHeader("X-File-Name", g.name);
        xhr.setRequestHeader("X-File-Type", g.type);
        var data = new FormData;
        data.append("file", g);
        xhr.send(data);
      })
    }

    function updatePreview(editor, response) {
      var e = editor.getContentElement("info", "filename");
      e.setValue(response.filename + " (" + response.width + "x" + response.height + ")");
      e.getElement().data("resp", base64.encode(JSON.stringify(response)));
      var d = CKEDITOR.document.getById(h),
        e = 0,
        e = response.width > response.height ? d.getParent().getSize("width") : d.getParent().getSize("height");
      d.setAttribute("src", resize(response.url, e));
      d = 0;
      (d = response.width > response.height ?
        editor.imageElement.getAttribute("width") : editor.imageElement.getAttribute("height")) || (d = 400);
      editor.getContentElement("info", "size").setValue(d);
      d = editor.getContentElement("info", "lightbox");
      editor.linkElement ? d.setValue(!0) : d.setValue(!1);
      editor.imageElement.setAttribute("src", resize(response.url, e));
      editor.imageElement.setAttribute("data-blobinfo", base64.encode(JSON.stringify(response)))
    }
    var h = CKEDITOR.tools.getNextId() + "_previewImage";

    return {
      title: "Image Properties",
      minWidth: 420,
      minHeight: 360,
      onShow: function() {
        this.linkEditMode = this.imageEditMode = this.linkElement =
          this.imageElement = !1;
        this.firstLoad = !0;
        this.addLink = !1;
        var a = this.getParentEditor(),
          b = a.getSelection(),
          e = (b = b && b.getSelectedElement()) && a.elementPath(b).contains("a", 1);
        if (e) {
          this.linkElement = e;
          this.linkEditMode = !0;
          var c = e.getChildren();
          1 == c.count() && "img" == c.getItem(0).getName() && (this.imageElement = c.getItem(0), this.imageEditMode = !0);
          this.setupContent(1, e)
        }
        b && ("img" == b.getName() && !b.data("cke-realelement")) && (this.imageEditMode = !0, this.imageElement = b);
        this.imageEditMode ? (this.originalImageElement =
          this.imageElement, this.imageElement = this.originalImageElement.clone(!0, !0), this.setupContent(2, this.imageElement)) : this.imageElement = a.document.createElement("img")
      },
      onOk: function() {
        this.imageEditMode ? (this.imageElement = this.originalImageElement, delete this.originalImageElement) : (this.imageElement = a.document.createElement("img"), this.imageElement.setAttribute("alt", ""));
        this.linkEditMode || (this.linkElement = a.document.createElement("a"));
        this.commitContent(2, this.imageElement);
        this.commitContent(1,
          this.linkElement);
        this.imageElement.getAttribute("style") || this.imageElement.removeAttribute("style");
        this.imageEditMode ? !this.linkEditMode && this.addLink ? (a.insertElement(this.linkElement), this.imageElement.appendTo(this.linkElement)) : this.linkEditMode && !this.addLink && (this.linkElement.remove(1), a.insertElement(this.imageElement)) : this.addLink ? this.linkEditMode ? a.insertElement(this.imageElement) : (a.insertElement(this.linkElement), this.linkElement.append(this.imageElement, !1)) : a.insertElement(this.imageElement)
      },
      onHide: function() {
        delete this.imageElement
      },
      contents: [{
        id: "info",
        label: a.lang.image.infoTab,
        accessKey: "I",
        elements: [{
          type: "vbox",
          padding: 0,
          children: [{
            type: "hbox",
            widths: ["290px", "100px"],
            align: "right",
            children: [{
              id: "filename",
              type: "text",
              label: "Filename",
              onLoad: function() {
                this.getElement().setAttribute("disabled", "disabled")
              },
              commit: function(a, b) {
                var e = JSON.parse(base64.decode(this.getElement().data("resp")));
                if (2 == a) {
                  var d = this.getDialog().getContentElement("info", "size"),
                    e = resize(e.url, d.getValue());
                  b.setAttribute("src",
                    e);
                  b.data("cke-saved-src", e);
                  b.data("resp", this.getElement().data("resp"))
                }
              },
              setup: function(a, b) {
                if (2 == a) {
                  var e = JSON.parse(base64.decode(b.data("resp")));
                  d(this.getDialog(), e)
                }
              }
            }, {
              type: "button",
              id: "browse",
              style: "display: inline-block; margin-top: 14px;",
              label: "Browse",
              onLoad: function() {
                var dialog = this.getDialog();
                var input = CKEDITOR.document.createElement("input");
                input.setAttribute("type", "file");
                input.on("change", function(event) {
                  refresh(event.sender.$.files[0], dialog);
                });
                input.setAttribute("style", "position: absolute; visibility: collapse");
                this.getElement().getParent().append(input);
                this.on("click", function() {
                  input.$.click();
                })
              }
            }]
          }]
        }, {
          id: "caption",
          type: "text",
          label: "Caption",
          accessKey: "T",
          "default": "",
          setup: function(a, b) {
            2 == a && this.setValue(b.getAttribute("alt"))
          },
          commit: function(a, b) {
            2 == a ? (this.getValue() || this.isChanged()) && b.setAttribute("alt", this.getValue()) : 1 == a ? b.setAttribute("title", this.getValue()) : 3 == a && b.removeAttribute("alt")
          }
        }, {
          type: "hbox",
          widths: ["110px", "280px"],
          align: "left",
          children: [{
            type: "vbox",
            children: [{
              id: "size",
              type: "text",
              label: "Size"
            }, {
              id: "lightbox",
              type: "checkbox",
              label: "Lightbox",
              commit: function(a, b) {
                if (this.getValue()) {
                  this.getDialog().addLink = !0;
                  var e = JSON.parse(base64.decode(this.getDialog().getContentElement("info", "filename").getElement().data("resp")));
                  1 == a && (b.setAttribute("class", "lightbox"), b.setAttribute("href", resize(e.url, Math.max(e.width, e.height))))
                } else this.getDialog().addLink = !1
              }
            }, {
              id: "float",
              label: "Float",
              type: "select",
              items: [
                ["None", ""],
                ["Left", "left"],
                ["Right", "right"]
              ],
              setup: function(a, b) {
                if (2 == a) {
                  var c = b.getStyle("float");
                  if ("none" == c || "inherit" == c) c = "";
                  this.setValue(c)
                }
              },
              commit: function(a, b) {
                if (2 == a) {
                  var c = this.getValue();
                  b.removeClass("float-left");
                  b.removeClass("float-right");
                  b.removeStyle("float");
                  c && (b.addClass("float-" + c), b.setStyle("float", c))
                }
              }
            }]
          }, {
            type: "html",
            html: '<div style="width: 100%; height: 200px; border: solid 1px #000; text-align: center;"><img src="" id="' + h + '" /></div>'
          }]
        }]
      }]
    }
  };
  CKEDITOR.dialog.add("imgblob", function(a) {
    return dialog(a, "imgblob")
  });
  var base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function(a) {
      for (var c = "", f, d, h, g, b, e, j = 0, a = base64._utf8_encode(a); j < a.length;) f = a.charCodeAt(j++), d = a.charCodeAt(j++), h = a.charCodeAt(j++), g = f >> 2, f = (f & 3) << 4 | d >> 4, b = (d & 15) << 2 | h >> 6, e = h & 63, isNaN(d) ? b = e = 64 : isNaN(h) && (e = 64), c = c + this._keyStr.charAt(g) + this._keyStr.charAt(f) + this._keyStr.charAt(b) + this._keyStr.charAt(e);
      return c
    },
    decode: function(a) {
      for (var c = "", f, d, h, g, b, e = 0, a = a.replace(/[^A-Za-z0-9\+\/\=]/g, ""); e < a.length;) f =
        this._keyStr.indexOf(a.charAt(e++)), d = this._keyStr.indexOf(a.charAt(e++)), g = this._keyStr.indexOf(a.charAt(e++)), b = this._keyStr.indexOf(a.charAt(e++)), f = f << 2 | d >> 4, d = (d & 15) << 4 | g >> 2, h = (g & 3) << 6 | b, c += String.fromCharCode(f), 64 != g && (c += String.fromCharCode(d)), 64 != b && (c += String.fromCharCode(h));
      return c = base64._utf8_decode(c)
    },
    _utf8_encode: function(a) {
      for (var a = a.replace(/\r\n/g, "\n"), c = "", f = 0; f < a.length; f++) {
        var d = a.charCodeAt(f);
        128 > d ? c += String.fromCharCode(d) : (127 < d && 2048 > d ? c += String.fromCharCode(d >> 6 | 192) :
          (c += String.fromCharCode(d >> 12 | 224), c += String.fromCharCode(d >> 6 & 63 | 128)), c += String.fromCharCode(d & 63 | 128))
      }
      return c
    },
    _utf8_decode: function(a) {
      for (var c = "", f = 0, d = c1 = c2 = 0; f < a.length;) d = a.charCodeAt(f), 128 > d ? (c += String.fromCharCode(d), f++) : 191 < d && 224 > d ? (c2 = a.charCodeAt(f + 1), c += String.fromCharCode((d & 31) << 6 | c2 & 63), f += 2) : (c2 = a.charCodeAt(f + 1), c3 = a.charCodeAt(f + 2), c += String.fromCharCode((d & 15) << 12 | (c2 & 63) << 6 | c3 & 63), f += 3);
      return c
    }
  }
})();