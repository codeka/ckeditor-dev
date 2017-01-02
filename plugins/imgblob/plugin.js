( function() {
	CKEDITOR.plugins.add("imgblob", {
    requires: "dialog,ajax",
    init: function(editor) {
        CKEDITOR.dialog.add("imgblob", this.path + "dialogs/imgblob.js");
        editor.addCommand("imgblob", new CKEDITOR.dialogCommand("imgblob"));
        editor.ui.addButton && editor.ui.addButton("Image", {
            label: editor.lang.common.image,
            command: "imgblob",
            toolbar: "insert,11"
        });
        editor.on("doubleclick", function(event) {
            var elem = event.data.element;
            if (elem.is("img") && !elem.data("cke-realelement") && !elem.isReadOnly()) {
              event.data.dialog = "imgblob";
            }
        });
        editor.addMenuItems && editor.addMenuItems({
            image: {
                label: editor.lang.image.menu,
                command: "imgblob",
                group: "image"
            }
        });
        editor.contextMenu && editor.contextMenu.addListener(function(a) {
            if (c(editor, a)) return {
                image: CKEDITOR.TRISTATE_OFF
            }
        })
    },
    afterInit: function(editor) {
        function a(a) {
            var j = editor.getCommand("justify" + a);
            if (j) {
                if (a == "left" || a == "right") j.on("exec", function(g) {
                    var h = c(editor),
                        f;
                    if (h) {
                        f = e(h);
                        if (f == a) {
                            h.removeStyle("float");
                            a == e(h) && h.removeAttribute("align")
                        } else h.setStyle("float",
                            a);
                        g.cancel()
                    }
                });
                j.on("refresh", function(g) {
                    var h = c(editor);
                    if (h) {
                        h = e(h);
                        this.setState(h == a ? CKEDITOR.TRISTATE_ON : a == "right" || a == "left" ? CKEDITOR.TRISTATE_OFF : CKEDITOR.TRISTATE_DISABLED);
                        g.cancel()
                    }
                })
            }
        }
        a("left");
        a("right");
        a("center");
        a("block")
    }
  });
})();