var lock = false; // so we don't trigger shutUp() as we manipulate the dom in shutUp()

var facebookStoryClass = ".userContentWrapper";
var shutUp = function(regex) {
    if (lock) {
        return;
    }
    lock = true;
    jQuery(facebookStoryClass + ":not(.shutupguy)")
        .filter(function() {
            if (jQuery(this).closest(facebookStoryClass + ".shutupguy").length > 0) {
                return false; // don't add stuff more than once per story
            }
            var matches = regex.exec(this.textContent);
            if (matches !== null) {
                var matchingString = matches.join(", ");
                var story = jQuery(this);
                story.addClass("shutupguy");
                story.parent().addClass("shutupguy");

                // insert the list of matched words
                var div = jQuery("<div></div>")
                    .addClass("shutupguy_matches")
                    .attr("style", "background-color: white !important") // ugh sorry
                    .text(matchingString);
                div.appendTo(jQuery(this));
                div.css("top", -1 * story.outerHeight() / 2.0);
                div.css("left", (story.outerWidth() / 2.0) - div.width());

                return true;
            }
            return false;
        })
        .addClass("shutupguy");
    lock = false;
}

function makeRegex(blacklist) {
    var bannedWords = blacklist.split(/,\s*/); // comma-separated, optional whitespace
    // only match on word boundaries
    bannedWords = bannedWords.map(function(word) { return "\\b" + escape(word) + "\\b"; });
    return new RegExp(bannedWords.join("|"), "i");
}

function escape(str) {
    // source: http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

chrome.storage.sync.get("shutupguy_blacklist", function(response) {
    var blacklist = response["shutupguy_blacklist"];
    if (!blacklist) {
        if (window.confirm("'Shut Up, Guy' won't do anything unless you " +
                "set up a list of words to ban." +
                "\nDo that now?")) {
            window.open(chrome.extension.getURL("options.html"));
        }
    } else {
        var regex = makeRegex(blacklist);
        document.addEventListener("DOMNodeInserted", function() {
            // this runs pretty slow-- it'd be better to hook into whatever event Facebook
            // uses to trigger loading additional content, I think.
            shutUp(regex);
        });
        shutUp(regex);
    }
});


